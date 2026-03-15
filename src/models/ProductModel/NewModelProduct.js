const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number }, // Converted from string to number
  offeramount: { type: Number }, // Converted from string to number
  image: { type: String }, // Main image URL
  color: { type: String }, // Main image URL
  sku: { type: String }, // Main image URL
  dimensions: { type: String }, // Main image URL
  isActive: { type: String }, // Main image URL
  availability: { type: String }, // Main image URL
  quantity: { type: String, default: null }, // Can be used for stock
  weight: { type: String, default: null },
  marirty: { type: String }, // New field as per your request

  tags: { type: [String], default: [] }, // e.g. ["Today Cleaning", "Week End"]
  category: { type: [String], default: [] }, // e.g. ["Basic Wash"]
  category_id:{ type: String },

  is_new: { type: Boolean, default: false },
  is_hot: { type: Boolean, default: false },
  is_recommended: { type: Boolean, default: false },
  days: { type: Number ,default: 1},
  interior: { type: Number ,default: 0},
  exterior: { type: Number ,default: 0},
  formwash: { type: Number ,default: 0},
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
