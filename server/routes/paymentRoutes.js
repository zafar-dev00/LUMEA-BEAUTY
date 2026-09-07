const express = require('express');
const { createPaymentOrder, verifyPayment, getUPIPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.post('/order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.get('/upi', getUPIPayment);

module.exports = router;