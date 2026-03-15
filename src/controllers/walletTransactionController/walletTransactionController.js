const WalletTransaction = require("../../models/WalletTransaction/WalletTransaction");
const User = require("../../models/UserModel/User");
const Order = require("../../models/OrderModel/OrderModel");
const Product = require("../../models/ProductModel/NewModelProduct");

exports.createWallet = async (req, res) => {
  try {
    const { userId, amount, type, reason } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet data",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const newBalance =
      type === "DEBIT"
        ? user.loyalty_point - amount
        : user.loyalty_point + amount;

    if (newBalance < 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    user.loyalty_point = newBalance;
    await user.save();

    const transaction = await WalletTransaction.create({
      userId,
      amount,
      type,
      reason,
      balanceAfter: newBalance,
    });

    res.status(201).json({
      success: true,
      message: "Wallet updated successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Wallet Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * GET WALLET TRANSACTIONS (Cashback UI)
 */
exports.getWalletTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1️⃣ Update overdue tasks (same as order API)
    await Order.updateOverdueTasks();

    // 2️⃣ Fetch user, wallet transactions, and orders in parallel
    const [user, transactions, orders] = await Promise.all([
      User.findById(userId).lean(),
      WalletTransaction.find({ userId }).sort({ createdAt: -1 }).lean(),
      Order.find({ userId })
        .select("_id userId paymentStatus createdAt totalAmount productIds tasks walletamount applycoupon razorpay_payment_id")
        .sort({ createdAt: -1 })
        .lean()
    ]);

    // 3️⃣ Collect unique product IDs
    const allProductIds = [...new Set(orders.flatMap(order => order.productIds || []))];

    // 4️⃣ Fetch products
    const products = await Product.find({ _id: { $in: allProductIds } })
      .select("_id name category")
      .lean();

    // 5️⃣ Create product map
    const productMap = {};
    products.forEach(p => {
      productMap[p._id.toString()] = p;
    });

    // 6️⃣ Attach products to orders
    const ordersWithProducts = orders.map(order => ({
      ...order,
      products: (order.productIds || [])
        .map(id => productMap[id.toString()])
        .filter(Boolean)
    }));

    // 7️⃣ Response
    res.json({
      success: true,
      currentbalance: user?.loyalty_point || 0,
      transactions,
      orders: ordersWithProducts
    });

  } catch (error) {
    console.error("Wallet transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
/**
 * UPDATE TRANSACTION (Edit Remarks)
 */
exports.updateWalletTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const tx = await WalletTransaction.findByIdAndUpdate(
      id,
      { reason },
      { new: true }
    );

    res.json({ success: true, data: tx });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

/**
 * DELETE TRANSACTION
 */
exports.deleteWalletTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    await WalletTransaction.findByIdAndDelete(id);
    res.json({ success: true, message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};