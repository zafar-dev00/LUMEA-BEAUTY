const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const PHONE_REGEX = /^[0-9+\-\s()]{7,15}$/;

// GET /api/users/profile
const getProfile = asyncHandler(async (req, res) => {
  // req.user is already the authenticated user's own document
  res.status(200).json({ success: true, user: req.user });
});

// PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;

  // Only ever update the authenticated user's own record (req.user._id),
  // never an id supplied by the client. Role/email/password are never
  // editable through this endpoint.
  const updates = {};

  if (name !== undefined) {
    if (!name.trim()) throw new ApiError(400, 'Name cannot be empty');
    updates.name = name.trim();
  }

  if (phone !== undefined) {
    if (!PHONE_REGEX.test(phone)) throw new ApiError(400, 'Please provide a valid phone number');
    updates.phone = phone.trim();
  }

  if (avatar !== undefined) {
    updates.avatar = avatar;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({ success: true, user });
});

module.exports = { getProfile, updateProfile };
