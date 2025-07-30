// models/ActivityLog.js
const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  taskId: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  status: {
    type: String,
    default: "pending",
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
 
  completedAt: Date,
});

const ActivityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  date: {
    type: String, // Format: 'YYYY-MM-DD'
    required: true,
  },
   latitude: {
    type: String
  },
  longitude: {
    type: String
  },
  loginTime: {
    type: Date,
  },
  logoutTime: {
    type: Date,
  },
  tasks: [TaskSchema], // Embedded array of task objects
});

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
