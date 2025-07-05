const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  productId:{
    type: String
  },
  userId:{
    type: String
  },
  rating: {
    type: Number,
    required: true
  },
  comment: {
    type: String
  }
}, { timestamps: true });

const Rating = mongoose.model('Ratings', ratingSchema);

module.exports = Rating;
