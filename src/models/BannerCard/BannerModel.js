// models/Brand.js
const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  name: { type: String},
  description: String,
  imageUrl: String,
  banner_img_mob: String,
  link_brand: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  lang: { type: String,},

});

const Banner = mongoose.model('Banner', BannerSchema);

module.exports = Banner;
