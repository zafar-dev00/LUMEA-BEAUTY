const express = require('express');
const { adminOnly } = require('../middleware/authMiddleware');

const {
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const {
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const {
  getDashboardStats,
  getAnalytics,
  getCustomers,
  getCustomerById,
  updateCustomerStatus,
} = require('../controllers/adminController');
const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/adminOrderController');
const {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const {
  getReviews,
  updateReviewStatus,
  deleteReview,
} = require('../controllers/reviewController');

const router = express.Router();

// Every route below requires a valid JWT AND role === 'ADMIN'. The role is
// always read from req.user, loaded fresh from MongoDB by `protect` — never
// trusted from anything the client sends (see middleware/authMiddleware.js).
router.use(adminOnly);

// Dashboard & analytics
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);

// Products (list/detail reuse the public, read-only controller; only
// mutations are admin-only, mounted here)
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Categories (same pattern as products)
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Orders
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);

// Customers
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerById);
router.put('/customers/:id/status', updateCustomerStatus);

// Coupons
router.get('/coupons', getCoupons);
router.get('/coupons/:id', getCouponById);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Reviews
router.get('/reviews', getReviews);
router.put('/reviews/:id/status', updateReviewStatus);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
