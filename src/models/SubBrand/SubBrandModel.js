// models/Brand.js
const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  imageUrl: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
  category_id: { type: String, required: true },
  brand_id: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lang: { type: String, required: true },

});

const Brand = mongoose.model('Brand_Sub', BrandSchema);

module.exports = Brand;
