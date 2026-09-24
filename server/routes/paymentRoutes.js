const express = require('express');
const {
  createPaymentOrder,
  verifyPayment,
  getUPIPayment,
} = require('../controllers/paymentController');

const router = express.Router();

// POST /api/payment/order
router.post('/order', createPaymentOrder);
router.post('/razorpay-order', createPaymentOrder);

// POST /api/payment/verify
router.post('/verify', verifyPayment);
router.post('/verify-razorpay', verifyPayment);

// GET /api/payment/upi
router.get('/upi', getUPIPayment);

module.exports = router;