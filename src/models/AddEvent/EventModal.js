// models/Inventory.js
const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  qty: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lang: {
    type: String,
    required: true
  },
  trackingEmployees: [
    {
      employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
      },
      assignedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

const Inventory = mongoose.model('Inventory', InventorySchema);

module.exports = Inventory;
