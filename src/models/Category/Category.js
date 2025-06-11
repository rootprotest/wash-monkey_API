// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String },
  description: String,
  // Add new fields below
  imageUrl: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  lang: { type: String},


});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
