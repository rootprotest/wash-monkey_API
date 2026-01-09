const WalletTransaction = require("../../models/WalletTransaction/WalletTransaction");
const User = require("../../models/UserModel/User");
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

    const transactions = await WalletTransaction.find({ userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
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