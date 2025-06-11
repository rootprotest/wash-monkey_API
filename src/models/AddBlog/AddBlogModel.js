// models/Brand.js
const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  imageUrl: String,
  blog_type: String,
  isActive: { type: Boolean },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  lang: { type: String },

});

const Brand = mongoose.model('Blogs', BrandSchema);

module.exports = Brand;
