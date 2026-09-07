const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, 'Coupon code must be at least 3 characters'],
      maxlength: [20, 'Coupon code cannot exceed 20 characters'],
    },
    discountPercentage: {
      type: Number,
      required: [true, 'Discount percentage is required'],
      min: [1, 'Discount percentage must be at least 1'],
      max: [100, 'Discount percentage cannot exceed 100'],
    },
    minOrder: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order cannot be negative'],
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: [0, 'Maximum discount cannot be negative'],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    usageLimit: {
      type: Number,
      default: null,
      min: [1, 'Usage limit must be at least 1'],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

couponSchema.pre('validate', function validateDates(next) {
  if (this.startDate && this.expiryDate && this.expiryDate <= this.startDate) {
    next(new Error('Expiry date must be after the start date'));
    return;
  }
  next();
});

module.exports = mongoose.model('Coupon', couponSchema);
