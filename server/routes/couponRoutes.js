const express = require('express');
const { validateCoupon } = require('../controllers/couponController');

const router = express.Router();

// Public — guests can apply coupons in the cart too. Creating/editing/
// deleting coupons is admin-only (see routes/adminRoutes.js).
router.post('/validate', validateCoupon);

module.exports = router;
