// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const { uploadHandler } = require("../../Image/multerSetup")
const SubBrandController = require('../../controllers/SubBrandController/SubBrandController');

// Create a new Sub Brand
router.post('/addsubbrand', uploadHandler, SubBrandController.createSubBrand);

// Get all sub brands
router.get('/allsubbrands', SubBrandController.getAllSubBrands);

// Get a specific sub brand by ID
router.get('/subbrand/:id', SubBrandController.getSubBrandById);

// Update a specific sub brand by ID
router.put('/subbrand/:id', uploadHandler, SubBrandController.updateSubBrandById);

// Delete a specific sub brand by ID
router.delete('/subbrand/:id', SubBrandController.deleteSubBrandById);

module.exports = router;
