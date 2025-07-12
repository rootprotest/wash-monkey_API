const express = require('express');
const router = express.Router();
const vehicleController = require('../../controllers/AddvehicleController/vehicleController');


// Create a vehicle
router.post('/createvehicle', vehicleController.createVehicle);

// Get all vehicles
router.get('/getvehicle', vehicleController.getAllVehicles);

// Get vehicles by userId
router.get('/getvehicle/:userId', vehicleController.getVehiclesByUserId);

// Update vehicle by ID
router.put('/vehicle/:id', vehicleController.updateVehicleById);

// Delete vehicle by ID
router.delete('/getvehicle/:id', vehicleController.deleteVehicleById);

module.exports = router;
