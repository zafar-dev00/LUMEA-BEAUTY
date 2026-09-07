process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "integration-test-secret";
process.env.ONLINE_PAYMENTS_ENABLED = "false";

const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");
const mongoose = require("mongoose");
const { MongoMemoryReplSet } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../app");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

let mongoServer;

before(async () => {
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
  });
  await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
  await User.deleteMany({});
  await Coupon.deleteMany({});
  await Order.deleteMany({});
  await Product.deleteMany({});
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

const registration = {
  name: "Test Customer",
  email: "CUSTOMER@EXAMPLE.COM",
  phone: "+919876543210",
  password: "secure-pass-123",
  confirmPassword: "secure-pass-123",
};

test("registration persists a user with a hashed password", async () => {
  const response = await request(app).post("/api/auth/register").send(registration);

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.match(response.body.token, /^ey/);
  assert.equal(response.body.user.email, "customer@example.com");
  assert.equal(response.body.user.password, undefined);

  const user = await User.findOne({ email: "customer@example.com" }).select("+password");
  assert.ok(user);
  assert.notEqual(user.password, registration.password);
  assert.equal(await user.comparePassword(registration.password), true);
});

test("login authenticates the persisted user and rejects a wrong password", async () => {
  await request(app).post("/api/auth/register").send(registration);

  const loginResponse = await request(app).post("/api/auth/login").send({
    email: "customer@example.com",
    password: registration.password,
  });
  const wrongPasswordResponse = await request(app).post("/api/auth/login").send({
    email: "customer@example.com",
    password: "wrong-password",
  });

  assert.equal(loginResponse.status, 200);
  assert.equal(loginResponse.body.success, true);
  assert.match(loginResponse.body.token, /^ey/);
  assert.equal(loginResponse.body.user.email, "customer@example.com");
  assert.equal(loginResponse.body.user.password, undefined);
  assert.equal(wrongPasswordResponse.status, 401);
  assert.equal(wrongPasswordResponse.body.message, "Invalid email or password");
});

test("registration rejects a duplicate email", async () => {
  await request(app).post("/api/auth/register").send(registration);

  const response = await request(app).post("/api/auth/register").send({
    ...registration,
    name: "Another Customer",
  });

  assert.equal(response.status, 409);
  assert.equal(response.body.message, "An account with this email already exists");
});

test("coupon validation enforces the minimum order and returns the discount", async () => {
  await Coupon.create({
    code: "SAVE20",
    discountPercentage: 20,
    minOrder: 100,
    maxDiscount: 50,
    expiryDate: new Date(Date.now() + 60 * 60 * 1000),
  });

  const belowMinimum = await request(app).post("/api/coupons/validate").send({
    code: "save20",
    subtotal: 80,
  });
  const valid = await request(app).post("/api/coupons/validate").send({
    code: "save20",
    subtotal: 200,
  });

  assert.equal(belowMinimum.status, 400);
  assert.equal(belowMinimum.body.message, "Add items worth \u20b9100 or more to use this coupon");
  assert.equal(valid.status, 200);
  assert.deepEqual(valid.body.coupon, {
    code: "SAVE20",
    discountPercentage: 20,
    minOrder: 100,
    maxDiscount: 50,
  });
});

test("authenticated order creation persists the order for the customer", async () => {
  const registrationResponse = await request(app).post("/api/auth/register").send(registration);
  const token = registrationResponse.body.token;
  const product = await Product.create({
    name: "Radiance Serum",
    slug: "radiance-serum",
    brand: "LUMEA",
    category: "Skincare",
    description: "A test serum",
    price: 40,
    thumbnail: "/serum.jpg",
    stock: 5,
    sku: "SERUM-TEST-001",
  });
  const orderPayload = {
    items: [{ id: product._id.toString(), name: "Forged Name", price: 999, qty: 1 }],
    customer: {
      fullName: "Test Customer",
      email: "customer@example.com",
      phone: "+919876543210",
    },
    address: {
      house: "10",
      street: "Beauty Avenue",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    },
    delivery: { id: "standard", label: "Standard Delivery", price: 0 },
    payment: { method: "cod" },
    subtotal: 40,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 40,
  };

  const response = await request(app)
    .post("/api/orders")
    .set("Authorization", `Bearer ${token}`)
    .send(orderPayload);

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.match(response.body.order.orderId, /^LUMEA-/);
  assert.equal(response.body.order.status, "Pending");

  const savedOrder = await Order.findOne({ orderId: response.body.order.orderId });
  assert.ok(savedOrder);
  assert.equal(savedOrder.customer.email, "customer@example.com");
  assert.equal(savedOrder.total, 40);
  assert.equal(savedOrder.items[0].product.toString(), product._id.toString());
  assert.equal(savedOrder.items[0].name, "Radiance Serum");
  assert.equal(savedOrder.items[0].price, 40);
  assert.equal(savedOrder.user.toString(), registrationResponse.body.user._id);
  const savedProduct = await Product.findById(product._id);
  assert.equal(savedProduct.stock, 4);
});

test("order creation rejects tampered totals and unsupported payment methods", async () => {
  const registrationResponse = await request(app).post("/api/auth/register").send(registration);
  const token = registrationResponse.body.token;
  const product = await Product.create({
    name: "Radiance Serum",
    slug: "radiance-serum",
    brand: "LUMEA",
    category: "Skincare",
    description: "A test serum",
    price: 40,
    thumbnail: "/serum.jpg",
    stock: 5,
    sku: "SERUM-TEST-001",
  });
  const validOrder = {
    items: [{ id: product._id.toString(), name: "Radiance Serum", price: 40, qty: 1 }],
    customer: {
      fullName: "Test Customer",
      email: "customer@example.com",
      phone: "+919876543210",
    },
    address: {
      house: "10",
      street: "Beauty Avenue",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    },
    payment: { method: "cod" },
    subtotal: 40,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 999,
  };

  const tamperedTotal = await request(app)
    .post("/api/orders")
    .set("Authorization", `Bearer ${token}`)
    .send(validOrder);
  const unsupportedPayment = await request(app)
    .post("/api/orders")
    .set("Authorization", `Bearer ${token}`)
    .send({ ...validOrder, total: 40, payment: { method: "bitcoin" } });
  const unconfiguredOnlinePayment = await request(app)
    .post("/api/orders")
    .set("Authorization", `Bearer ${token}`)
    .send({
      ...validOrder,
      total: 40,
      payment: { method: "card", transactionId: "unverified-reference" },
    });

  assert.equal(tamperedTotal.status, 400);
  assert.equal(tamperedTotal.body.message, "Order total does not match the supplied amounts");
  assert.equal(unsupportedPayment.status, 400);
  assert.equal(unsupportedPayment.body.message, "Unsupported payment method");
  assert.equal(unconfiguredOnlinePayment.status, 503);
  assert.equal(
    unconfiguredOnlinePayment.body.message,
    "Online payments are not configured; please use cash on delivery"
  );
  assert.equal(await Order.countDocuments(), 0);
});

test("concurrent orders cannot oversell the last unit", async () => {
  const registrationResponse = await request(app).post("/api/auth/register").send(registration);
  const token = registrationResponse.body.token;
  const product = await Product.create({
    name: "Last Unit Serum",
    slug: "last-unit-serum",
    brand: "LUMEA",
    category: "Skincare",
    description: "A one-unit test product",
    price: 40,
    thumbnail: "/serum.jpg",
    stock: 1,
    sku: "SERUM-TEST-LAST-001",
  });
  const orderPayload = {
    items: [{ id: product._id.toString(), name: "Last Unit Serum", price: 40, qty: 1 }],
    customer: {
      fullName: "Test Customer",
      email: "customer@example.com",
      phone: "+919876543210",
    },
    address: {
      house: "10",
      street: "Beauty Avenue",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    },
    payment: { method: "cod" },
    subtotal: 40,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 40,
  };

  const responses = await Promise.all([
    request(app).post("/api/orders").set("Authorization", `Bearer ${token}`).send(orderPayload),
    request(app).post("/api/orders").set("Authorization", `Bearer ${token}`).send(orderPayload),
  ]);
  const statuses = responses.map((response) => response.status).sort();
  const savedProduct = await Product.findById(product._id);

  assert.deepEqual(statuses, [201, 400]);
  assert.equal(await Order.countDocuments(), 1);
  assert.equal(savedProduct.stock, 0);
});

test("payment endpoints reject invalid or unconfigured payments safely", async () => {
  const registrationResponse = await request(app).post("/api/auth/register").send(registration);
  const token = registrationResponse.body.token;

  const invalidAmount = await request(app)
    .post("/api/payments/order")
    .set("Authorization", `Bearer ${token}`)
    .send({ amount: 0 });
  const unconfigured = await request(app)
    .post("/api/payments/order")
    .set("Authorization", `Bearer ${token}`)
    .send({ amount: 100 });
  const missingVerification = await request(app)
    .post("/api/payments/verify")
    .set("Authorization", `Bearer ${token}`)
    .send({});

  assert.equal(invalidAmount.status, 400);
  assert.equal(invalidAmount.body.message, "A valid payment amount is required");
  assert.equal(unconfigured.status, 503);
  assert.equal(unconfigured.body.message, "Online payments are not configured");
  assert.equal(missingVerification.status, 400);
  assert.equal(missingVerification.body.message, "Payment verification details are required");
});
