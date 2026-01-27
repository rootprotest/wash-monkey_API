const ActivityLog = require("../../models/Activity/activity");
const User = require("../../models/UserModel/User");
const moment = require("moment");

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { userId, latitude, longitude } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const date = moment().format("YYYY-MM-DD");

    let log = await ActivityLog.findOne({ userId, date });

    // ✅ FIX: create log if not exists
    if (!log) {
      log = new ActivityLog({
        userId,
        date,
        sessions: [],
        tasks: []
      });
    }

    // ✅ Always create a new session
    log.sessions.push({
      loginTime: new Date(),
      logoutTime: null,
      latitude,
      longitude
    });

    await log.save();

    res.json({
      success: true,
      message: "Login recorded successfully",
      log
    });
  } catch (error) {
    console.error("Login activity error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ================= LOGOUT ================= */
exports.logout = async (req, res) => {
  try {
    const { userId } = req.body;
    const date = moment().format("YYYY-MM-DD");

    const log = await ActivityLog.findOne({ userId, date });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "No activity record found"
      });
    }

    // ✅ find last open session
    const openSessions = log.sessions.filter(
      s => s.logoutTime === null
    );

    if (openSessions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No active session found"
      });
    }

    const lastSession = openSessions[openSessions.length - 1];
    lastSession.logoutTime = new Date();

    await log.save();

    res.json({
      success: true,
      message: "Logout recorded successfully",
      log
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ================= ADD TASK ================= */
exports.addTask = async (req, res) => {
  try {
    const { userId, taskId, title, description } = req.body;
    const date = moment().format("YYYY-MM-DD");

    const log = await ActivityLog.findOne({ userId, date });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "No activity record found for today"
      });
    }

    log.tasks.push({
      taskId,
      title,
      description
    });

    await log.save();

    res.json({
      success: true,
      message: "Task added successfully",
      log
    });
  } catch (error) {
    console.error("Add task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ================= UPDATE TASK STATUS ================= */
exports.updateTaskStatus = async (req, res) => {
  try {
    const { userId, taskId, status } = req.body;
    const date = moment().format("YYYY-MM-DD");

    const log = await ActivityLog.findOne({ userId, date });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "No activity log found"
      });
    }

    const task = log.tasks.find(t => t.taskId === taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    task.status = status;

    if (status === "completed") {
      task.completedAt = new Date();
    }

    await log.save();

    res.json({
      success: true,
      message: "Task status updated",
      task
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ================= GET TODAY ACTIVITY ================= */
exports.getTodayActivity = async (req, res) => {
  try {

    
    const date = moment().format("YYYY-MM-DD");
    const { userType } = req.query;

    const users = await User.find({ UserType: userType }).select("_id");

    const logs = await ActivityLog.find({
      date,
      userId: { $in: users.map(u => u._id) }
    }).populate("userId");

    res.json({
      success: true,
      message: "Today's activity fetched",
      logs
    });
  } catch (error) {
    console.error("Get activity error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
