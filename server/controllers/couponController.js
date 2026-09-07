const Coupon = require('../models/Coupon');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/admin/coupons
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, coupons });
});

// GET /api/admin/coupons/:id
const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }
  res.status(200).json({ success: true, coupon });
});

// POST /api/admin/coupons
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

const ALLOWED_COUPON_FIELDS = [
  'code',
  'discountPercentage',
  'minOrder',
  'maxDiscount',
  'startDate',
  'expiryDate',
  'usageLimit',
  'isActive',
];

// PUT /api/admin/coupons/:id
// Uses findById + .save() rather than findByIdAndUpdate: Mongoose's
// `pre('validate')` document middleware (the expiryDate > startDate check
// in models/Coupon.js) only runs on .save()/.create(), NOT on query methods
// like findByIdAndUpdate even with runValidators — so this is what makes
// that check actually apply on edits, not just on creation.
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }

  ALLOWED_COUPON_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) {
      coupon[field] = req.body[field];
    }
  });

  await coupon.save();
  res.status(200).json({ success: true, coupon });
});

// DELETE /api/admin/coupons/:id
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }
  res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
});

// POST /api/coupons/validate — public (guests can apply coupons too).
// Looks up a real Coupon document and checks it's active, within its date
// window, under its usage limit, and the order meets minOrder — this is
// what makes admin-created coupons (see adminOnly /api/admin/coupons)
// actually usable at checkout, instead of the cart trusting a hardcoded list.
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;

  if (!code || !code.trim()) {
    throw new ApiError(400, 'Coupon code is required');
  }

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (!coupon || !coupon.isActive) {
    throw new ApiError(404, 'Invalid coupon code');
  }

  const now = new Date();
  if (coupon.startDate && now < coupon.startDate) {
    throw new ApiError(400, 'This coupon is not active yet');
  }
  if (coupon.expiryDate && now > coupon.expiryDate) {
    throw new ApiError(400, 'This coupon has expired');
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, 'This coupon has reached its usage limit');
  }
  if (coupon.minOrder && Number(subtotal || 0) < coupon.minOrder) {
    throw new ApiError(400, `Add items worth ₹${coupon.minOrder} or more to use this coupon`);
  }

  res.status(200).json({
    success: true,
    coupon: {
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      minOrder: coupon.minOrder,
      maxDiscount: coupon.maxDiscount,
    },
  });
});

module.exports = {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};
