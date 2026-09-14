const Product = require('../models/Product');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const SORT_MAP = {
  'price-low': { price: 1 },
  'price-high': { price: -1 },
  rating: { rating: -1 },
  newest: { createdAt: -1 },
  'name-asc': { name: 1 },
  'name-desc': { name: -1 },
};

// GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  const filter = {};

  if (search) {
    filter.$text = { $search: search };
  }

  if (category) {
    filter.category = { $regex: `^${category}$`, $options: 'i' };
  }

  if (brand) {
    filter.brand = { $regex: `^${brand}$`, $options: 'i' };
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (rating) {
    filter.rating = { $gte: Number(rating) };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 12);
  const skip = (pageNum - 1) * limitNum;

  const sortOption = SORT_MAP[sort] || { createdAt: -1 };

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortOption).skip(skip).limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 0,
    },
  });
});

// GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json({ success: true, product });
});

// POST /api/products/:id/reviews
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;
  const userId = req.user._id;

  if (!rating || !comment) {
    throw new ApiError(400, 'Please provide both rating and comment');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Check if already reviewed
  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === userId.toString()
  );

  if (alreadyReviewed) {
    throw new ApiError(400, 'You have already reviewed this product');
  }

  // Verified Buyer check against orders
  const hasPurchased = await Order.findOne({
    user: userId,
    $or: [
      { 'items.product': productId },
      { 'items._id': productId },
    ],
  });

  if (!hasPurchased) {
    throw new ApiError(403, 'Only verified buyers who purchased this product can leave a review');
  }

  const review = {
    name: req.user.name || req.user.fullName || 'Verified Buyer',
    rating: Number(rating),
    comment: comment.trim(),
    user: userId,
    isVerifiedPurchase: true,
  };

  product.reviews.push(review);
  product.reviewCount = product.reviews.length;

  product.rating = Number(
    (
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length
    ).toFixed(1)
  );

  await product.save();

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    rating: product.rating,
    reviewCount: product.reviewCount,
    review,
  });
});

// POST /api/admin/products
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// PUT /api/admin/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json({ success: true, product });
});

// DELETE /api/admin/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json({ success: true, message: 'Product deleted successfully' });
});

module.exports = {
  getProducts,
  getProductById,
  createProductReview,
  createProduct,
  updateProduct,
  deleteProduct,
};