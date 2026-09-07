const Product = require('../models/Product');
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

// POST /api/admin/products — admin-only, see routes/adminRoutes.js
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// PUT /api/admin/products/:id — admin-only, see routes/adminRoutes.js
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

// DELETE /api/admin/products/:id — admin-only, see routes/adminRoutes.js
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
  createProduct,
  updateProduct,
  deleteProduct,
};
