// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const couponController = require('../../controllers/AddCouponController/CouponController');

// Create a new coupon
router.post('/createCoupon', couponController.createCoupon);

// Check the coupon
router.post("/applyCoupon", couponController.applyCoupon);

// Get all coupon
router.get('/GetCoupon', couponController.getAllCoupons);

// Get a specific coupon by ID
router.get('/Coupons/:id', couponController.getCouponById);

// Updated a specific coupon by ID
router.put('/Coupons/:id', couponController.updateCouponById);

router.delete('/Coupons/:id', couponController.deleteCouponById);

module.exports = router;
