const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  // 🔹 EXISTING FIELDS (KEEP ALL)
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
  verified: { type: Boolean, default: true },

  // 🔹 OLD DOCUMENT FIELDS (KEEP)
  aadhar_copy: { type: String, default: "" },
  pan_card_copy: { type: String, default: "" },
  gst_certificate: { type: String, default: "" },
  driving_license: { type: String, default: "" },

  // 🔹 BANK (OLD)
  bank_name: { type: String, default: "" },
  account_holder_name: { type: String, default: "" },
  account_number: { type: String, default: "" },
  ifsc_code: { type: String, default: "" },

  // 🔹 LOCATION (OLD)
  address: { type: String, default: "" },
  state: { type: String, default: "" },
  latitude: { type: String, default: "" },
  longitude: { type: String, default: "" },

  // =====================================================
  // ✅ NEW STRUCTURED DATA (FOR EMPLOYEE SYSTEM)
  // =====================================================

  // 👤 PROFILE
  profile: {
    gender: { type: String, default: "" },
    dob: { type: Date },
    profile_img: { type: String, default: "" },
  },

  // 💼 EMPLOYEE DETAILS
  employee: {
    employee_id: { type: String, default: "" },
    role: { type: String, default: "" }, // Driver, Staff
    joining_date: { type: Date },
    salary: { type: Number },
    shift: { type: String },
    status: { type: String, default: "active" },
  },

  // 🚗 VEHICLE DETAILS
  vehicle: {
    vehicle_type: { type: String, default: "" },
    vehicle_name: { type: String, default: "" },
    vehicle_number: { type: String, default: "" },
    vehicle_model: { type: String, default: "" },
    vehicle_color: { type: String, default: "" },
  },

  // 📄 DOCUMENTS (NEW STRUCTURE)
  documents: {
    driving_license: { type: String, default: "" },
    aadhar_card: { type: String, default: "" },
    pan_card: { type: String, default: "" },
    vehicle_rc: { type: String, default: "" },
    insurance: { type: String, default: "" },
  },

  // 💳 BANK (NEW STRUCTURE)
  bank_details: {
    bank_name: String,
    account_holder_name: String,
    account_number: String,
    ifsc_code: String,
  },

  // 📍 LOCATION (NEW STRUCTURE)
  location: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    latitude: String,
    longitude: String,
  },

  // 📊 ACTIVITY
  activity: {
    last_seen: { type: Date },
    is_online: { type: Boolean, default: false },
  },

  // 🔹 OTHER EXISTING FIELDS (KEEP)
  created_at: { type: Date },
  updated_at: { type: Date },
  password_changed_at: { type: Date },

  mainAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    default: null,
  },
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
