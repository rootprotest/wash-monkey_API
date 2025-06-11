const Rating = require("../../models/AddRating/RatingModel");

// Create a new rating
exports.createRating = async (req, res) => {
  try {
    const { productId, userId, rating, comment } = req.body;

    // Check if required fields are provided
    if (!productId || !userId || !rating) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // Create a new rating
    const newRating = await Rating.create({
      productId,
      userId,
      rating,
      comment
    });

    res.status(200).json({ success: true, rating: newRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get all ratings
exports.getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find();
    res.status(200).json({ success: true, ratings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get a rating by ID
exports.getRatingById = async (req, res) => {
  try {
    const ratingId = req.params.id;
    const rating = await Rating.findById(ratingId);

    if (!rating) {
      return res.status(404).json({ success: false, message: "Rating not found" });
    }

    res.status(200).json({ success: true, rating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id; // Extract product ID from the URL parameters
    const ratings = await Rating.find({ productId }); // Find ratings for the given product ID

    if (!ratings || ratings.length === 0) {
      // If no ratings found, return a 404 response
      return res.status(404).json({ success: false, message: "No ratings found for the specified product ID" });
    }

    res.status(200).json({ success: true, ratings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Update a rating by ID
exports.updateRating = async (req, res) => {
  try {
    const ratingId = req.params.id;
    const { rating, comment } = req.body;

    // Check if rating exists
    const existingRating = await Rating.findById(ratingId);
    if (!existingRating) {
      return res.status(404).json({ success: false, message: "Rating not found" });
    }

    // Update the rating
    existingRating.rating = rating || existingRating.rating;
    existingRating.comment = comment || existingRating.comment;

    // Save the updated rating
    await existingRating.save();

    res.status(200).json({ success: true, rating: existingRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete a rating by ID
exports.deleteRating = async (req, res) => {
  try {
    const ratingId = req.params.id;

    // Check if rating exists
    const existingRating = await Rating.findById(ratingId);
    if (!existingRating) {
      return res.status(404).json({ success: false, message: "Rating not found" });
    }

    // Delete the rating
    await Rating.deleteOne({ _id: existingRating._id });

    res.status(200).json({ success: true, message: "Rating deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
