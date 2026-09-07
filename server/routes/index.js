const express = require('express');
const healthRoutes = require('./health.routes');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const orderRoutes = require('./orderRoutes');
const couponRoutes = require('./couponRoutes');
const adminRoutes = require('./adminRoutes');
const paymentRoutes = require('./paymentRoutes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/orders', orderRoutes);
router.use('/coupons', couponRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes); // every route here requires JWT + ADMIN role

// Future route modules (payments, etc.) will be mounted here in later phases.

module.exports = router;
