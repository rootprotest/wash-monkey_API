const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleType: { type: String, required: true }, // e.g., Car, Bike
  brand: { type: String, required: true },
  model: { type: String, required: true },
  registrationNumber: { type: String, required: true, unique: true },
  color: { type: String },
  fuelType: { type: String }, // Petrol, Diesel, Electric
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
