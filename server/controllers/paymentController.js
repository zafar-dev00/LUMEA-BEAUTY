const crypto = require('crypto');
const Razorpay = require('razorpay');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { onlinePaymentsEnabled, razorpayKeyId, razorpayKeySecret, upi } = require('../config/env');

const getRazorpay = () => {
  if (!onlinePaymentsEnabled || !razorpayKeyId || !razorpayKeySecret) {
    throw new ApiError(503, 'Online payments are not configured in server environment');
  }
  return new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret });
};

const verifyRazorpayPayment = (orderId, paymentId, signature) => {
  if (!orderId || !paymentId || !signature) {
    throw new ApiError(400, 'Payment verification details are required');
  }
  if (!onlinePaymentsEnabled || !razorpayKeySecret) {
    throw new ApiError(503, 'Online payments are not configured');
  }

  const expectedSignature = crypto
    .createHmac('sha256', razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const signaturesMatch =
    signature.length === expectedSignature.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

  if (!signaturesMatch) {
    throw new ApiError(400, 'Payment signature could not be verified');
  }
  return true;
};

// POST /api/payment/order (or /api/payments/order)
const createPaymentOrder = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, 'A valid payment amount is required');
  }

  // Safe receipt generation (Guest checkout support)
  const userIdentifier = req.user?._id ? String(req.user._id) : 'guest';
  const receiptId = `rcpt_${userIdentifier}_${Date.now().toString(36)}`;

  const paymentOrder = await getRazorpay().orders.create({
    amount: Math.round(amount * 100), // INR to paise conversion
    currency: 'INR',
    receipt: receiptId,
  });

  res.status(201).json({
    success: true,
    // order & paymentOrder dono keys return taaki koi bhi frontend contract match ho sake
    order: paymentOrder,
    paymentOrder: {
      id: paymentOrder.id,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
    },
    keyId: razorpayKeyId,
  });
});

// POST /api/payment/verify (or /api/payments/verify)
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
  
  verifyRazorpayPayment(orderId, paymentId, signature);

  res.status(200).json({
    success: true,
    verified: true,
    message: 'Payment verified successfully',
    orderId,
    paymentId,
  });
});

// GET /api/payment/upi (or /api/payments/upi)
const getUPIPayment = asyncHandler(async (req, res) => {
  if (!upi?.enabled) {
    throw new ApiError(503, 'UPI payments are not configured');
  }

  const { amount, orderId } = req.query;

  if (!amount || !orderId) {
    throw new ApiError(400, 'Amount and orderId are required');
  }

  const upiString = `upi://pay?pa=${upi.id}&pn=${encodeURIComponent(upi.merchantName)}&am=${amount}&tn=LUMEA%20Order%20${encodeURIComponent(orderId)}&tr=${encodeURIComponent(orderId)}`;

  res.status(200).json({
    success: true,
    upiString,
    amount: Number(amount),
    orderId,
    upiId: upi.id,
    merchantName: upi.merchantName,
  });
});

module.exports = {
  createPaymentOrder,
  verifyPayment,
  verifyRazorpayPayment,
  getUPIPayment,
};