const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, },
  description: { type: String,  },
  amount: { type: Number,  },
  offeramount: { type: Number,  },
  images: [String], // Array to store multiple image URLs
  color: String,
  weight: String,
  dimensions: String,
  sku: String,
  availability: String,
  qty: Number,
  isActive: { type: Boolean, default: true },
  createdBy: { type: String,}, // Assuming you have a User model
  category: { type: String, }, // Assuming you have a Category model
  brand_id: { type: String, }, // Assuming you have a Category model
  sub_brand_id: {type: String},
  category_id: { type: String},
  createdAt: { type: Date, default: Date.now },
  lang: { type: String },
  shipment:{ type: String },
  catalogueShoot:{ type: String },
  socialMedia:{ type: String },
  websiteInfographics: {type: String},
  key_word: String

});


const Product = mongoose.model('Fclientnewproducts', ProductSchema);

module.exports = Product;
