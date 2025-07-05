const express = require('express');
const router = express.Router();

// Import your controller
const InventoryController = require('../../controllers/AddEventContoller/EventContoller');

// Create a new Inventory item
router.post('/addinventory', InventoryController.createInventory);

// Get all Inventory items
router.get('/allinventories', InventoryController.getAllInventories);

// Get a specific Inventory item by ID
router.get('/inventory/:id', InventoryController.getInventoryById);

// Update a specific Inventory item by ID
router.put('/inventory/:id', InventoryController.updateInventoryById);

// Delete a specific Inventory item by ID
router.delete('/inventory/:id', InventoryController.deleteInventoryById);

module.exports = router;
