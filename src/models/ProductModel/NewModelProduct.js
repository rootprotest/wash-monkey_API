const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number }, // Converted from string to number
  image: { type: String }, // Main image URL
  quantity: { type: Number, default: null }, // Can be used for stock
  weight: { type: Number, default: null },
  marirty: { type: String }, // New field as per your request

  tags: { type: [String], default: [] }, // e.g. ["Today Cleaning", "Week End"]
  category: { type: [String], default: [] }, // e.g. ["Basic Wash"]

  is_new: { type: Boolean, default: false },
  is_hot: { type: Boolean, default: false },
  is_recommended: { type: Boolean, default: false },
  days: { type: Number ,default: 1},

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Optional: Add pre-save hook to update `updated_at` on every save
ProductSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

const Product = mongoose.model('product', ProductSchema);
module.exports = Product;
