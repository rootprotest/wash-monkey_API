// models/Brand.js
const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  imageUrl: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lang: { type: String, required: true },

});

const Brand = mongoose.model('Event', BrandSchema);

module.exports = Brand;
