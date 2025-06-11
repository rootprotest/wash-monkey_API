const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  offeramount: { type: Number, required: true },
  images: [String], // Array to store multiple image URLs
  color: String,
  weight: String,
  dimensions: String,
  sku: String,
  availability: String,
  qty: { type: Number },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true }, // Assuming you have a User model
  category: { type: String, required: true }, // Assuming you have a Category model
  brand_id: { type: String, required: true }, // Assuming you have a Category model
  createdAt: { type: Date, default: Date.now },
  lang: { type: String },
  delivered_type:{ type: String }
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
