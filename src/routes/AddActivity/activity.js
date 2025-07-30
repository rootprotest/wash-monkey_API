// routes/activity.js
const express = require("express");
const router = express.Router();
const activityController = require("../../controllers/activityController/activityController");

// POST /api/activity/login
router.post("/login", activityController.login);

// POST /api/activity/logout
router.post("/logout", activityController.logout);

// POST /api/activity/task
router.post("/task", activityController.addTask);

// PATCH /api/activity/task/status
router.patch("/task/status", activityController.updateTaskStatus);

// GET /api/activity/today?userType=2
router.get("/today", activityController.getTodayActivity);

module.exports = router;
