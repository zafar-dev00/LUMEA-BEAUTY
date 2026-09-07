const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/jwt');
const crypto = require('crypto');
const { sendLoginOtp } = require('../services/mailService');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,15}$/;
const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, 'Name is required');
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    throw new ApiError(400, 'A valid email is required');
  }
  if (!phone || !PHONE_REGEX.test(phone)) {
    throw new ApiError(400, 'A valid phone number is required');
  }
  if (!password || password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }
  if (password !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match');
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  // role is never taken from the request body — always defaults to USER
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    password,
  });

  const token = signToken(user);

  res.status(201).json({
    success: true,
    token,
    user,
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated');
  }

  const token = signToken(user);
  user.password = undefined;

  res.status(200).json({
    success: true,
    token,
    user,
  });
});

// POST /api/auth/request-otp
const requestOtp = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  if (!EMAIL_REGEX.test(email)) {
    throw new ApiError(400, 'A valid email is required');
  }

  const user = await User.findOne({ email }).select('+loginOtpHash +loginOtpExpiresAt +loginOtpAttempts');
  if (!user || !user.isActive || user.role !== 'USER') {
    throw new ApiError(401, 'No active customer account found for this email');
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  user.loginOtpHash = hashOtp(otp);
  user.loginOtpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
  user.loginOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });
  await sendLoginOtp(user.email, otp);

  res.status(200).json({ success: true, message: 'A login code has been sent to your email' });
});

// POST /api/auth/verify-otp
const verifyOtp = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const otp = String(req.body.otp || '').trim();
  if (!EMAIL_REGEX.test(email) || !/^\d{6}$/.test(otp)) {
    throw new ApiError(400, 'Email and a valid 6-digit code are required');
  }

  const user = await User.findOne({ email }).select('+loginOtpHash +loginOtpExpiresAt +loginOtpAttempts');
  const invalid = !user || !user.isActive || user.role !== 'USER';
  if (invalid || !user.loginOtpHash || !user.loginOtpExpiresAt || user.loginOtpExpiresAt < new Date()) {
    throw new ApiError(401, 'This code is invalid or expired');
  }
  if (user.loginOtpAttempts >= MAX_OTP_ATTEMPTS) {
    throw new ApiError(429, 'Too many attempts. Request a new code');
  }

  user.loginOtpAttempts += 1;
  if (hashOtp(otp) !== user.loginOtpHash) {
    await user.save({ validateBeforeSave: false });
    throw new ApiError(401, 'This code is invalid or expired');
  }

  user.loginOtpHash = undefined;
  user.loginOtpExpiresAt = undefined;
  user.loginOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, token: signToken(user), user });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// POST /api/auth/logout
// Stateless JWT: nothing to invalidate server-side; client discards the token.
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

module.exports = { register, login, requestOtp, verifyOtp, getMe, logout };
