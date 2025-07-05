const express = require("express");
const router = express.Router();
const ratingController = require("../../controllers/AddRatingController/RatingController");

// Create a new rating
router.post("/createrating", ratingController.createRating);

// Get all ratings
router.get("/getallratings", ratingController.getAllRatings);

// Get a rating by ID
router.get("/getratingbyid/:id", ratingController.getRatingById);

// Get all ratings for a specific product
router.get("/getratingsbyproduct/:id", ratingController.getProductById);

// Update a rating by ID
router.put("/updaterating/:id", ratingController.updateRating);

// Delete a rating by ID
router.delete("/deleterating/:id", ratingController.deleteRating);

module.exports = router;
