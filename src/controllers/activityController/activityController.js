// controllers/activityController.js
const ActivityLog = require("../../models/Activity/activity");
  const User = require("../../models/UserModel/User");

const moment = require("moment");

// Login handler
exports.login = async (req, res) => {
  try {
    const { userId, latitude, longitude } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const date = moment().format("YYYY-MM-DD");

    // Find or create today's log for the user
    let log = await ActivityLog.findOne({ userId, date });
    if (!log) {
      log = new ActivityLog({ userId, date });
    }

    // Set login time and location
    log.loginTime = new Date();
        log.logoutTime = null;

   if(latitude) log.latitude = latitude;
    if(longitude) log.longitude = longitude;

    await log.save();

    res.json({
      success: true,
      message: "Login time and location recorded",
      log,
    });
  } catch (error) {
    console.error("Login activity error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Logout handler
exports.logout = async (req, res) => {
  const { userId } = req.body;
  const date = moment().format("YYYY-MM-DD");

  const log = await ActivityLog.findOne({ userId, date });
  if (!log) return res.status(404).json({ success: false, message: "No login record found" });

  log.logoutTime = new Date();
  await log.save();

  res.json({ success: true, message: "Logout time recorded", log });
};

// Add task to today's activity
exports.addTask = async (req, res) => {
  const { userId, taskId, title, description } = req.body;
  const date = moment().format("YYYY-MM-DD");

  const log = await ActivityLog.findOne({ userId, date });
  if (!log) return res.status(404).json({ success: false, message: "No activity record found for today" });

  log.tasks.push({ taskId, title, description });
  await log.save();

  res.json({ success: true, message: "Task added", log });
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
  const { userId, taskId, status } = req.body;
  const date = moment().format("YYYY-MM-DD");

  const log = await ActivityLog.findOne({ userId, date });
  if (!log) return res.status(404).json({ success: false, message: "No activity log found" });

  const task = log.tasks.find((t) => t.taskId === taskId);
  if (!task) return res.status(404).json({ success: false, message: "Task not found" });

  task.status = status;
  if (status === "completed") task.completedAt = new Date();

  await log.save();
  res.json({ success: true, message: "Task updated", task });
};

// Get today's activity logs by user type
exports.getTodayActivity = async (req, res) => {
  const date = moment().format("YYYY-MM-DD");
  const userType = req.query.userType;

  const users = await User.find({ UserType: userType });

  const logs = await ActivityLog.find({
    date,
    userId: { $in: users.map((u) => u._id) },
  }).populate("userId");
res.json({ success: true, message: "Task updated", logs });
};
