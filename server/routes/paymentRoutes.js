const express = require('express');
const {
  createPaymentOrder,
  verifyPayment,
  getUPIPayment,
} = require('../controllers/paymentController');

const router = express.Router();

// Razorpay Order Creation (Support both /order and /razorpay-order)
router.post('/order', createPaymentOrder);
router.post('/razorpay-order', createPaymentOrder);

// Cryptographic Payment Verification (Support both /verify and /verify-razorpay)
router.post('/verify', verifyPayment);
router.post('/verify-razorpay', verifyPayment);

// UPI QR Generator
router.get('/upi', getUPIPayment);

module.exports = router;