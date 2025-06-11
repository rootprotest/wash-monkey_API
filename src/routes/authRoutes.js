// authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/get-new-token', authController.getNewToken);

module.exports = router;
