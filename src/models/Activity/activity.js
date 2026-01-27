const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  loginTime: { type: Date, required: true },
  logoutTime: { type: Date, default: null },
  latitude: String,
  longitude: String
});

const TaskSchema = new mongoose.Schema({
  taskId: String,
  title: { type: String, required: true },
  description: String,
  status: { type: String, default: "pending" },
  assignedAt: { type: Date, default: Date.now },
  completedAt: Date
});

const ActivityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: String, required: true },
  sessions: [SessionSchema],
  tasks: [TaskSchema]
});

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
