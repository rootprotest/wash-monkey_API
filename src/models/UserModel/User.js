const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, default: "" },
  UserType: { type: String, default: "" },
  mobilenumber: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  username: { type: String, default: "" },
  lang: { type: String, default: "" },
  profile_img: { type: String, default: "" },
  OTPNumber: { type: Number },
  loyalty_point: { type: Number, default: 0 },
  verified: { type: Boolean, required: true, default: true },
  resetToken: { type: String, default: "" },
  resetTokenExpiration: { type: String, default: "" },
  otp_verified: { type: String, default: "" },
  image: { type: String, default: "" },
  profile_background: { type: String, default: "" },
  service_city: { type: String, default: "" },
  service_area: { type: String, default: "" },
  seller_type: { type: String, default: "" },
  user_status: { type: String, default: "" },
  terms_condition: { type: String, default: "" },
  address: { type: String, default: "" },
  state: { type: String, default: "" },
  about: { type: String, default: "" },
  tax_number: { type: String, default: "" },
  business_registration: { type: String, default: "" },
  post_code: { type: String, default: "" },
  country_id: { type: String, default: "" },
  email_verified: { type: String, default: "" },
  email_verify_token: { type: String, default: "" },
  remember_token: { type: String, default: "" },
  facebook_id: { type: String, default: "" },
  apple_id: { type: String, default: "" },
  google_id: { type: String, default: "" },
  country_code: { type: String, default: "" },
  created_at: { type: Date },
  updated_at: { type: Date },
  password_changed_at: { type: Date },
  fb_url: { type: String, default: "" },
  tw_url: { type: String, default: "" },
  go_url: { type: String, default: "" },
  li_url: { type: String, default: "" },
  yo_url: { type: String, default: "" },
  in_url: { type: String, default: "" },
  twi_url: { type: String, default: "" },
  pi_url: { type: String, default: "" },
  dr_url: { type: String, default: "" },
  re_url: { type: String, default: "" },
  web: { type: String, default: "" },
  bank_name: { type: String, default: "" },
  account_holder_name: { type: String, default: "" },
  account_number: { type: String, default: "" },
  ifsc_code: { type: String, default: "" },
  swift: { type: String, default: "" },
  aadhar_copy: { type: String, default: "" },
  pan_card_copy: { type: String, default: "" },
  gst_certificate: { type: String, default: "" },
  driving_license: { type: String, default: "" },
  last_seen: { type: Date },
  otp_expire_at: { type: Date },
  zone_id: { type: String, default: "" },
  latitude: { type: String, default: "" },
  longitude: { type: String, default: "" },
  seller_address: { type: String, default: "" }
});

// Method to generate token
userSchema.methods.generateVerificationToken = function () {
  const user = this;
  const verificationToken = jwt.sign(
    { ID: user._id },
    process.env.USER_VERIFICATION_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  return verificationToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
