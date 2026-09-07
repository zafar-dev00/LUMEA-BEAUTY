const Review = require('../models/Review');
const { REVIEW_STATUSES } = require('../models/Review');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/admin/reviews
const getReviews = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const reviews = await Review.find(filter)
    .sort({ createdAt: -1 })
    .populate('product', 'name thumbnail')
    .populate('user', 'name email');

  res.status(200).json({ success: true, reviews });
});

// PUT /api/admin/reviews/:id/status
const updateReviewStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!REVIEW_STATUSES.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${REVIEW_STATUSES.join(', ')}`);
  }

  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  res.status(200).json({ success: true, review });
});

// DELETE /api/admin/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }
  res.status(200).json({ success: true, message: 'Review deleted successfully' });
});

module.exports = { getReviews, updateReviewStatus, deleteReview };
