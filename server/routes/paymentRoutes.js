const express = require('express');
const { createPaymentOrder, verifyPayment, getUPIPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.get('/upi', protect, getUPIPayment);

module.exports = router;