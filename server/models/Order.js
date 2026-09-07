const mongoose = require('mongoose');

const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: 'An order must contain at least one item',
      },
    },
    customer: {
      fullName: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
    },
    address: {
      house: { type: String, required: true, trim: true },
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
    },
    delivery: {
      id: { type: String, default: 'standard' },
      label: { type: String, default: 'Standard Delivery' },
      price: { type: Number, default: 0, min: 0 },
    },
    payment: {
      method: { type: String, default: 'cod' },
      providerOrderId: { type: String, trim: true, default: '' },
      transactionId: { type: String, trim: true, default: '' },
      status: { type: String, enum: PAYMENT_STATUSES, default: 'Pending' },
    },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    couponCode: { type: String, default: null, trim: true, uppercase: true },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'Pending',
      index: true,
    },
  },
  { timestamps: true }
);

function generateOrderId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LUMEA-${stamp}${rand}`;
}

orderSchema.pre('validate', function assignOrderId(next) {
  if (!this.orderId) {
    this.orderId = generateOrderId();
  }
  next();
});

// Note: admin order search (adminOrderController.getAllOrders) uses
// case-insensitive $regex matching on orderId/customer fields rather than
// $text, since partial/substring matches (e.g. searching "john" to find
// "John Smith") need regex, not full-text search. No text index needed here.

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
