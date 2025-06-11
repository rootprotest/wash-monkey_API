const express = require('express');
const router = express.Router();
const ratingController = require('../../controllers/AddRatingController/RatingController');

// Create a new rating
router.post('/CreateReviews', ratingController.createRating);

// Get all ratings
router.get('/GetAllReviews', ratingController.getAllRatings);

// Get a rating by ID
router.get('/GetReviewByID/:id', ratingController.getRatingById);

router.get('/GetProductByID/:id', ratingController.getProductById);

// Update a rating by ID
router.put('/UpdateReviewByID/:id', ratingController.updateRating);

// Delete a rating by ID
router.delete('/DeleteReviewByID/:id', ratingController.deleteRating);

module.exports = router;
