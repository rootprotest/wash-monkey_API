const Inventory = require("../../models/AddEvent/EventModal");

// Create a new inventory item
exports.createInventory = async (req, res) => {
  try {
    const { itemName, description, qty, isActive, createdBy, lang, trackingEmployees } = req.body;

    const newInventory = await Inventory.create({
      itemName,
      description,
      qty,
      isActive,
      createdBy,
      lang,
      trackingEmployees, // optional
    });

    res.status(200).json({ success: true, inventory: newInventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get all inventory items
exports.getAllInventories = async (req, res) => {
  try {
    const inventories = await Inventory.find().populate('trackingEmployees.employeeId');

    res.status(200).json({ success: true, inventories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get a specific inventory item by ID
exports.getInventoryById = async (req, res) => {
  try {
    const inventoryId = req.params.id;
    const inventory = await Inventory.findById(inventoryId).populate('trackingEmployees.employeeId');

    if (!inventory) {
      return res.status(404).json({ success: false, message: "Inventory item not found" });
    }

    res.status(200).json({ success: true, inventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Update a specific inventory item by ID
exports.updateInventoryById = async (req, res) => {
  try {
    const inventoryId = req.params.id;
    const { itemName, description, qty, isActive, createdBy, lang, trackingEmployees } = req.body;

    const existingInventory = await Inventory.findById(inventoryId);

    if (!existingInventory) {
      return res.status(404).json({ success: false, message: "Inventory item not found" });
    }

    // Update the fields
    existingInventory.itemName = itemName;
    existingInventory.description = description;
    existingInventory.qty = qty;
    existingInventory.isActive = isActive;
    existingInventory.createdBy = createdBy;
    existingInventory.lang = lang;
    existingInventory.trackingEmployees = trackingEmployees || [];

    const updatedInventory = await existingInventory.save();

    res.status(200).json({ success: true, inventory: updatedInventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete a specific inventory item by ID
exports.deleteInventoryById = async (req, res) => {
  try {
    const inventoryId = req.params.id;

    const existingInventory = await Inventory.findById(inventoryId);

    if (!existingInventory) {
      return res.status(404).json({ success: false, message: "Inventory item not found" });
    }

    await Inventory.deleteOne({ _id: inventoryId });

    res.status(200).json({ success: true, message: "Inventory item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
