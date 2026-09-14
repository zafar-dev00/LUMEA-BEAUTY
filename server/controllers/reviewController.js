const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const REVIEW_STATUSES = ['pending', 'approved', 'hidden'];

// GET /api/admin/reviews
// Aggregates embedded reviews from all products for the admin table
const getReviews = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const pipeline = [
    { $unwind: '$reviews' },
    {
      $project: {
        _id: '$reviews._id',
        name: '$reviews.name',
        rating: '$reviews.rating',
        comment: '$reviews.comment',
        status: { $ifNull: ['$reviews.status', 'approved'] },
        isVerifiedPurchase: '$reviews.isVerifiedPurchase',
        createdAt: '$reviews.createdAt',
        product: {
          _id: '$_id',
          name: '$name',
          thumbnail: '$thumbnail',
        },
      },
    },
    { $sort: { createdAt: -1 } },
  ];

  if (status && status !== 'All') {
    pipeline.push({ $match: { status } });
  }

  const reviews = await Product.aggregate(pipeline);

  res.status(200).json({ success: true, reviews });
});

// PUT /api/admin/reviews/:id/status
const updateReviewStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const reviewId = req.params.id;

  if (!REVIEW_STATUSES.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${REVIEW_STATUSES.join(', ')}`);
  }

  const product = await Product.findOneAndUpdate(
    { 'reviews._id': reviewId },
    { $set: { 'reviews.$.status': status } },
    { new: true }
  );

  if (!product) {
    throw new ApiError(404, 'Review not found');
  }

  const updatedReview = product.reviews.id(reviewId);

  res.status(200).json({
    success: true,
    review: {
      _id: updatedReview._id,
      name: updatedReview.name,
      rating: updatedReview.rating,
      comment: updatedReview.comment,
      status: updatedReview.status,
      isVerifiedPurchase: updatedReview.isVerifiedPurchase,
      createdAt: updatedReview.createdAt,
      product: {
        _id: product._id,
        name: product.name,
      },
    },
  });
});

// DELETE /api/admin/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const reviewId = req.params.id;

  const product = await Product.findOne({ 'reviews._id': reviewId });
  if (!product) {
    throw new ApiError(404, 'Review not found');
  }

  product.reviews.pull({ _id: reviewId });
  product.reviewCount = product.reviews.length;

  product.rating =
    product.reviews.length > 0
      ? Number(
          (
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length
          ).toFixed(1)
        )
      : 0;

  await product.save();

  res.status(200).json({ success: true, message: 'Review deleted successfully' });
});

module.exports = {
  getReviews,
  updateReviewStatus,
  deleteReview,
  REVIEW_STATUSES,
};