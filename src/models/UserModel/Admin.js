// models/Admin.js
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const AdminSchema = new mongoose.Schema({
  storename: { type: String, required: true },
  storeaddress: { type: String, required: true },
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  storetimming: { type: Object, required: true },
  lat: { type: Number, required: true },
  log: { type: Number, unique: false },
});

// Add a method to generate a AdminSchema 
AdminSchema.methods.generateVerificationToken = function () {
  const user = this;
  const verificationToken = jwt.sign(
    { ID: user._id },
    process.env.USER_VERIFICATION_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  return verificationToken;
};

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;
