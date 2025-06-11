// routes/WishlistRoutes.js
const express = require('express');
const router = express.Router();
const WishlistController = require('../../controllers/FWishlistController/FwishlistController');

// Create a new item in the wishlist
router.post('/createWishlistItem', WishlistController.createWishlistItem);

// Get all items in the wishlist based on user
router.get('/wishlistUser/:id', WishlistController.getWishlist);

// Update quantity of an item in the wishlist
// router.put('/updateWishlistItem/:id', WishlistController.updateWishlistItem);

// Delete an item from the wishlist
router.delete('/deleteWishlistItem/:id', WishlistController.deleteWishlistItem);

module.exports = router;
