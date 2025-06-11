// models/Brand.js
const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  imageUrl: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
  category_id: { type: String },
  createdAt: { type: Date, default: Date.now },
  lang: { type: String, required: true },
  banner_img: [String], // Array to store multiple image URLs
  banner_mob_img: [String], // Array to store multiple image URLs


});

const Brand = mongoose.model('Brand', BrandSchema);

module.exports = Brand;
