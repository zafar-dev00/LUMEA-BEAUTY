const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { lowStockThreshold } = require('../config/env');

// GET /api/admin/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    revenueAgg,
    totalOrders,
    totalCustomers,
    totalProducts,
    pendingOrders,
    lowStockProducts,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.countDocuments(),
    User.countDocuments({ role: 'USER' }),
    Product.countDocuments(),
    Order.countDocuments({ status: 'Pending' }),
    Product.countDocuments({ stock: { $lte: lowStockThreshold } }),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalRevenue: revenueAgg[0]?.total || 0,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      lowStockProducts,
      lowStockThreshold,
    },
  });
});

const RANGE_CONFIG = {
  today: () => ({
    start: new Date(new Date().setHours(0, 0, 0, 0)),
    format: '%H:00',
  }),
  '7d': () => ({
    start: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0),
    format: '%Y-%m-%d',
  }),
  '30d': () => ({
    start: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0),
    format: '%Y-%m-%d',
  }),
  year: () => ({
    start: new Date(new Date().getFullYear(), 0, 1),
    format: '%Y-%m',
  }),
};

// GET /api/admin/analytics?range=today|7d|30d|year
const getAnalytics = asyncHandler(async (req, res) => {
  const range = RANGE_CONFIG[req.query.range] ? req.query.range : '7d';
  const { start, format } = RANGE_CONFIG[range]();
  const startDate = new Date(start);

  const [revenueByPeriod, customersByPeriod, topProducts] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format, date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: startDate }, role: 'USER' } },
      {
        $group: {
          _id: { $dateToString: { format, date: '$createdAt' } },
          customers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          unitsSold: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
    ]),
  ]);

  res.status(200).json({
    success: true,
    range,
    series: {
      revenue: revenueByPeriod.map((p) => ({ label: p._id, value: p.revenue })),
      orders: revenueByPeriod.map((p) => ({ label: p._id, value: p.orders })),
      customers: customersByPeriod.map((p) => ({ label: p._id, value: p.customers })),
    },
    topProducts: topProducts.map((p) => ({
      name: p._id,
      unitsSold: p.unitsSold,
      revenue: p.revenue,
    })),
  });
});

// GET /api/admin/customers
const getCustomers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);
  const skip = (pageNum - 1) * limitNum;

  const [customers, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    customers,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 0,
    },
  });
});

// GET /api/admin/customers/:id
const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.params.id);
  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  const [orders, spendAgg] = await Promise.all([
    Order.find({ user: customer._id }).sort({ createdAt: -1 }),
    Order.aggregate([
      { $match: { user: customer._id, status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    customer,
    orders,
    orderCount: orders.length,
    totalSpent: spendAgg[0]?.total || 0,
  });
});

// PUT /api/admin/customers/:id/status
const updateCustomerStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  if (typeof isActive !== 'boolean') {
    throw new ApiError(400, 'isActive must be a boolean');
  }

  const customer = await User.findById(req.params.id);
  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }
  if (customer.role === 'ADMIN') {
    throw new ApiError(403, 'Admin accounts cannot be deactivated from here');
  }

  customer.isActive = isActive;
  await customer.save();

  res.status(200).json({ success: true, customer });
});

module.exports = {
  getDashboardStats,
  getAnalytics,
  getCustomers,
  getCustomerById,
  updateCustomerStatus,
};
