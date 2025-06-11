// controllers/Coupon.js
const Coupon = require("../../models/Coupon/Coupon");
const Order = require("../../models/OrderModel/OrderModel")

// Get all Coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get a specific Coupon by ID
exports.getCouponById = async (req, res) => {
  try {
    const couponId = req.params.id;
    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    res.status(200).json({ success: true, coupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Create a new Coupon
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discount,
      isActive,
      createdBy,
      category_id,
      maxlimit,
      isShow_display,
      lang,
      screen_Id
    } = req.body;
    const newCoupon = await Coupon.create({
      code,
      description,
      discount,
      isActive,
      createdBy,
      maxlimit,
      category_id,
      isShow_display,
      lang,
      screen_Id
    });
    res.status(200).json({ success: true, coupon: newCoupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Update a specific Coupon by ID
exports.updateCouponById = async (req, res) => {
  try {
    const couponId = req.params.id;
    const {
      code,
      description,
      discount,
      isActive,
      createdBy,
      category_id,
      maxlimit,
      timesUsed,
      isShow_display,
      lang,
    } = req.body;

    // Check if the Coupon exists
    const existingCoupon = await Coupon.findById(couponId);

    if (!existingCoupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    // Update the Coupon fields
    existingCoupon.code = code;
    existingCoupon.description = description;
    existingCoupon.discount = discount;
    existingCoupon.isActive = isActive;
    existingCoupon.createdBy = createdBy;
    existingCoupon.maxlimit = maxlimit;
    existingCoupon.timesUsed = timesUsed;
    existingCoupon.isShow_display = isShow_display;
    existingCoupon.category_id = category_id;
    existingCoupon.lang = lang;

    // Save the updated Coupon
    const updatedCoupon = await existingCoupon.save();

    res.status(200).json({ success: true, coupon: updatedCoupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete a specific Coupon by ID
exports.deleteCouponById = async (req, res) => {
  try {
    const couponId = req.params.id;

    // Check if the Coupon exists
    const existingCoupon = await Coupon.findById(couponId);

    if (!existingCoupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    // Remove the Coupon from the database
    await Coupon.deleteOne({ _id: couponId });

    res
      .status(200)
      .json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    const { couponCode, userId } = req.body;

    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });

    if (!coupon) {
      return res.status(400).json({ success: false, message: "Invalid coupon code" });
    }

    if (coupon.maxlimit !== undefined && coupon.maxlimit === 0) {
      return res.status(400).json({ success: false, message: "Coupon has reached its maximum usage limit" });
    }

    // Check if the coupon has already been used by the user in the Order table
    const orderWithCoupon = await Order.findOne({ applycoupon: couponCode, userId: userId });

    if (orderWithCoupon) {
      return res.status(400).json({ success: false, message: "Coupon has already been used by this user" });
    }

    // Decrease maxlimit and increase timesUsed
    coupon.maxlimit = (coupon.maxlimit || 0) - 1;
    coupon.timesUsed = (coupon.timesUsed || 0) + 1;

    // Save the updated coupon
    const updatedCoupon = await coupon.save();
    // Prepare the response body based on coupon type
    let bodysend = {
      code: coupon.code,
      description: coupon.description,
      discount: coupon.discount,
      coupon_type: coupon.coupon_type
    };

    // Handle different coupon types
    if (coupon.coupon_type === 'percentage') {
      // For percentage discount coupons
      bodysend.coupon_type = coupon.coupon_type;
    } else if (coupon.coupon_type === 'bogo') {
      // For buy one get one free (BOGO) coupons
      bodysend.coupon_type = coupon.coupon_type;
    }
    else if (coupon.coupon_type === 'amount') {
      // For buy one get one free (BOGO) coupons
      bodysend.coupon_type = coupon.coupon_type;
    }

    res.status(200).json({ success: true, bodysend, message: "Coupon applied successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};