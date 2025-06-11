// controllers/WishlistController.js
const Wishlist = require('../../models/wishlist/FWishListModel');
const Product = require('../../models/ProductModel/FProduct');

// Create a new item in the wishlist
// Create or remove an item in the wishlist
exports.createWishlistItem = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // Check for missing fields
    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: 'User ID and Product ID are required' });
    }

    // Check for duplicate productId for the same userId
    const existingItem = await Wishlist.findOne({ userId, productId });
    if (existingItem) {
      // If the item exists, remove it from the wishlist
      await Wishlist.deleteOne({ userId, productId });
      return res.status(200).json({ success: true, message: 'Product removed from wishlist' });
    }

    // Create a new wishlist item
    const newWishlistItem = await Wishlist.create({ userId, productId });

    res.status(200).json({ success: true, wishlistItem: newWishlistItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};



// Get all wishlist items for a specific user
exports.getWishlist = async (req, res) => {
    try {
      const userId = req.params.id; 
  
      // Fetch all wishlist items for the user
      const wishlistItems = await Wishlist.find({ userId });
  
      // Create an array to store promises for fetching product details
      const productPromises = wishlistItems.map(async (item) => {
        // Fetch product details for each wishlist item
        const product = await Product.findById(item.productId);
        return { ...item._doc, product }; // Combine wishlist item and product details
      });
  
      // Wait for all promises to resolve
      const wishlistItemsWithProducts = await Promise.all(productPromises);
  
      res.status(200).json({ success: true, wishlistItems: wishlistItemsWithProducts });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  };

// Update quantity of an item in the wishlist
exports.updateWishlistItem = async (req, res) => {
  try {
    const wishlistItemId = req.params.id;
    const { savelater } = req.body;

    const existingWishlistItem = await Wishlist.findByIdAndUpdate(
      wishlistItemId,
      { savelater },
      { new: true }
    );

    if (!existingWishlistItem) {
      return res
        .status(404)
        .json({ success: false, message: 'Wishlist item not found' });
    }

    res.status(200).json({ success: true, wishlistItem: existingWishlistItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete an item from the wishlist
exports.deleteWishlistItem = async (req, res) => {
  try {
    const wishlistItemId = req.params.id;

    const existingWishlistItem = await Wishlist.findById(wishlistItemId);

    if (!existingWishlistItem) {
      return res
        .status(404)
        .json({ success: false, message: 'Wishlist item not found' });
    }

    // Remove the Wishlist item from the database
    await Wishlist.deleteOne({ _id: wishlistItemId });

    res.status(200).json({ success: true, message: 'Wishlist item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
