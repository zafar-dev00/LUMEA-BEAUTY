const express = require('express');
const { getProfile, updateProfile } = require('../controllers/userController');
const { getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // every route below requires authentication

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/orders', getMyOrders);

module.exports = router;
