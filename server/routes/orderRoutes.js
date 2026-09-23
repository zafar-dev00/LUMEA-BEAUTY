const express = require('express');
const { createOrder, getOrderById, updatePaymentStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:id', getOrderById);
router.post('/', protect, createOrder);
router.patch('/:id/payment-status', protect, updatePaymentStatus);

module.exports = router;