const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  companyName: { type: String, default: null },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pinCode: { type: String, required: true },
  email: { type: String, required: true },
  typeAddress: { type: String, required: true } // Changed field name to camelCase
});

const Address = mongoose.model('Address', AddressSchema);

module.exports = Address;
