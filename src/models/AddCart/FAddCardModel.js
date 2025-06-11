const mongoose = require('mongoose');

const AddCartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 },
    addedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    savelater: { type: Boolean, default: true },
    // Add any other relevant fields you may need
});

const AddCart = mongoose.model('FAddCart', AddCartSchema);

module.exports = AddCart;
