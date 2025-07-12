const Vehicle = require('../../models/AddVehicle/VehicleModel');

// Create a vehicle
exports.createVehicle = async (req, res) => {
    
  try {
    const { userId, vehicleType, brand, model, registrationNumber, color, fuelType } = req.body;
    const newVehicle = await Vehicle.create({
      userId, vehicleType, brand, model, registrationNumber, color, fuelType
    });
    res.status(200).json({ success: true, vehicle: newVehicle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get all vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicleList = await Vehicle.find();
    res.status(200).json({ success: true, vehicles: vehicleList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get vehicles by user ID
exports.getVehiclesByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const vehicles = await Vehicle.find({ userId });
    res.status(200).json({ success: true, vehicles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update vehicle
exports.updateVehicleById = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const updateData = req.body;
    const updatedVehicle = await Vehicle.findByIdAndUpdate(vehicleId, updateData, { new: true });
    if (!updatedVehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.status(200).json({ success: true, vehicle: updatedVehicle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete vehicle
exports.deleteVehicleById = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const deletedVehicle = await Vehicle.findByIdAndDelete(vehicleId);
    if (!deletedVehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.status(200).json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
