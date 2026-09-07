const express = require('express');
const { register, login, requestOtp, verifyOtp, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', protect, getMe);
router.post('/logout', logout);

module.exports = router;
