const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { onlinePaymentsEnabled, upi } = require('../config/env');
const { sendOrderConfirmation } = require('../services/mailService');

const normalizeMoney = (value) => Number(Number(value || 0).toFixed(2));
const getPaymentMethod = (payment) => payment?.id || payment?.method || 'cod';

// POST /api/orders
// Persists an order placed through checkout. Requires authentication —
// guest checkout continues to work entirely client-side (see
// client/src/pages/Checkout.jsx); only logged-in users get a server-side
// order record they can later see under "My Orders" / that admins can manage.
const createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    customer,
    address,
    delivery,
    payment,
    subtotal,
    discount,
    total,
    couponCode,
  } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Order must contain at least one item');
  }
  if (!customer || !customer.fullName || !customer.email || !customer.phone) {
    throw new ApiError(400, 'Customer details are required');
  }
  if (!address || !address.house || !address.street || !address.city || !address.state || !address.pincode) {
    throw new ApiError(400, 'A complete shipping address is required');
  }

  const paymentMethod = getPaymentMethod(payment);
  const supportedPaymentMethods = new Set(['cod', 'card', 'upi']);
  if (!supportedPaymentMethods.has(paymentMethod.toLowerCase())) {
    throw new ApiError(400, 'Unsupported payment method');
  }
  if (paymentMethod.toLowerCase() === 'card' && !onlinePaymentsEnabled) {
    throw new ApiError(503, 'Online payments are not configured; please use cash on delivery');
  }
  if (paymentMethod.toLowerCase() === 'upi' && !upi.enabled) {
    throw new ApiError(503, 'UPI payments are not configured; please use cash on delivery');
  }

  const seenProductIds = new Set();
  const productMap = new Map();

  for (const item of items) {
    const productId = item.id || item.product;
    if (!productId) {
      throw new ApiError(400, 'Each order item must include a valid product id');
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'One or more products could not be found');
    }

    const qty = Number(item.qty || 1);
    if (!Number.isFinite(qty) || qty < 1) {
      throw new ApiError(400, 'Each order item must have a valid quantity');
    }
    if (product.stock < qty) {
      throw new ApiError(400, 'Insufficient stock for requested quantity');
    }

    seenProductIds.add(productId.toString());
    productMap.set(productId.toString(), { product, qty, item });
  }

  const expectedSubtotal = Array.from(productMap.values()).reduce((sum, { product, qty }) => {
    const price = Number(product.price || 0);
    return sum + price * qty;
  }, 0);

  const normalizedSubtotal = normalizeMoney(subtotal);
  const normalizedDiscount = normalizeMoney(discount);
  const normalizedShipping = 0;
  const normalizedTax = 0;
  const normalizedTotal = normalizeMoney(total);

  const expectedTotal = normalizeMoney(expectedSubtotal - normalizedDiscount + normalizedShipping + normalizedTax);

  if (normalizedSubtotal !== normalizeMoney(expectedSubtotal)) {
    throw new ApiError(400, 'Order total does not match the supplied amounts');
  }
  if (normalizedTotal !== expectedTotal) {
    throw new ApiError(400, 'Order total does not match the supplied amounts');
  }

  const updates = [];
  for (const { product, qty } of productMap.values()) {
    const result = await Product.findOneAndUpdate(
      { _id: product._id, stock: { $gte: qty } },
      { $inc: { stock: -qty } },
      { new: true }
    );

    if (!result) {
      throw new ApiError(400, 'Insufficient stock for requested quantity');
    }
    updates.push(result);
  }

  const order = await Order.create({
    user: req.user._id,
    items: Array.from(productMap.values()).map(({ product, qty, item }) => ({
      product: product._id,
      name: product.name,
      image: product.thumbnail || item.image || '',
      price: product.price,
      qty,
    })),
    customer,
    address,
    delivery,
    payment: { method: paymentMethod, status: 'Pending' },
    subtotal: expectedSubtotal,
    discount: normalizedDiscount,
    shipping: normalizedShipping,
    tax: normalizedTax,
    total: expectedTotal,
    couponCode: couponCode || null,
  });

  if (couponCode) {
    // Best-effort — a failure here shouldn't fail an already-placed order.
    Coupon.updateOne({ code: couponCode.toUpperCase() }, { $inc: { usedCount: 1 } }).catch(() => {});
  }

  sendOrderConfirmation(order).catch((error) => {
    console.error(`Could not send order email for ${order.orderId}:`, error);
  });

  res.status(201).json({ success: true, order });
});

// GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lookup = mongoose.isValidObjectId(id)
    ? { $or: [{ _id: id }, { orderId: id }] }
    : { orderId: id };

  const order = await Order.findOne(lookup);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (req.user && order.user && order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have access to this order');
  }

  res.status(200).json({ success: true, order });
});

// GET /api/users/orders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, orders });
});

// PATCH /api/orders/:id/payment-status
// Update payment status after successful UPI payment
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, transactionId } = req.body;

  if (!status) {
    throw new ApiError(400, 'Payment status is required');
  }

  const validStatuses = ['Pending', 'Paid', 'Failed', 'Refunded'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid payment status');
  }

  const lookup = mongoose.isValidObjectId(id)
    ? { $or: [{ _id: id }, { orderId: id }] }
    : { orderId: id };

  const order = await Order.findOne(lookup);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Verify the user owns this order
  if (order.user && order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have access to this order');
  }

  // Update payment status
  order.payment.status = status;
  if (transactionId) {
    order.payment.transactionId = transactionId;
  }

  

  // Auto-confirm order if payment is successful
  if (status === 'Paid' && order.status === 'Pending') {
    order.status = 'Confirmed';
  }

  await order.save();

  res.status(200).json({ success: true, order });
});

module.exports = { createOrder, getMyOrders, getOrderById, updatePaymentStatus };
