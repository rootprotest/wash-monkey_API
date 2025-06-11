const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({
  code: { type: String },
  description: String,
  discount: { type: Number },
  maxlimit: { type: Number },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String },
  category_id: { type: String },
  timesUsed: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lang: { type: String },
  isShow_display: { type: Boolean, default: true },
  coupon_type: { type: String},
  screen_Id: { type: String}
});

const Coupon = mongoose.model("Coupon", CouponSchema);

module.exports = Coupon;
