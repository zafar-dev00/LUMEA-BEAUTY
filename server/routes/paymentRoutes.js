const express = require('express');
const {
  createPaymentOrder,
  verifyPayment,
  getUPIPayment,
} = require('../controllers/paymentController');

const router = express.Router();

// Order creation (Dono aliases support karein)
router.post('/order', createPaymentOrder);
router.post('/razorpay-order', createPaymentOrder);

// Verification
router.post('/verify', verifyPayment);
router.post('/verify-razorpay', verifyPayment);

// UPI
router.get('/upi', getUPIPayment);

module.exports = router;