const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    addedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    // Add any other relevant fields you may need for a wishlist item
});

const Wishlist = mongoose.model('Wishlist', WishlistSchema);

module.exports = Wishlist;
