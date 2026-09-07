const express = require('express');
const { createOrder, getOrderById, updatePaymentStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Order tracking can be public for guests and logged-in shoppers. The server
// still keeps authenticated orders available under the user's account.
router.get('/:id', getOrderById);

// Placing an order requires an account so it can be tied to a user and
// shown back under "My Orders" / managed by admins. Guest checkout remains
// fully client-side (see client/src/pages/Checkout.jsx) and never hits this route.
router.post('/', protect, createOrder);

// Update payment status after UPI payment
router.patch('/:id/payment-status', protect, updatePaymentStatus);

module.exports = router;

