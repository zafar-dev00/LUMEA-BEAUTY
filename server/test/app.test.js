process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "integration-test-secret";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const request = require("supertest");
const app = require("../app");

test("GET / returns the API root response", async () => {
  const response = await request(app).get("/");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    success: true,
    message: "LUMÉA BEAUTY API root",
  });
});

test("GET /api/health returns a healthy API response", async () => {
  const response = await request(app).get("/api/health");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    success: true,
    message: "LUMÉA BEAUTY API is running",
  });
});

test("API responses allow credentialed requests from the configured client", async () => {
  const response = await request(app)
    .get("/api/health")
    .set("Origin", "http://localhost:5173");

  assert.equal(response.status, 200);
  assert.equal(response.headers["access-control-allow-credentials"], "true");
});

test("API responses include security and rate-limit headers", async () => {
  const response = await request(app).get("/api/health");

  assert.equal(response.headers["x-content-type-options"], "nosniff");
  assert.equal(response.headers["x-frame-options"], "SAMEORIGIN");
  assert.match(response.headers["ratelimit"], /300-in-15min/);
});

test("unknown routes return the standard JSON 404 response", async () => {
  const response = await request(app).get("/api/does-not-exist");

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: "Route not found - /api/does-not-exist",
  });
});

test("registration rejects missing required fields", async () => {
  const response = await request(app).post("/api/auth/register").send({});

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    success: false,
    message: "Name is required",
  });
});

test("login rejects incomplete credentials", async () => {
  const response = await request(app).post("/api/auth/login").send({ email: "" });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    success: false,
    message: "Email and password are required",
  });
});

test("coupon validation rejects an empty code", async () => {
  const response = await request(app).post("/api/coupons/validate").send({ code: " " });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    success: false,
    message: "Coupon code is required",
  });
});

test("protected order and admin routes require authentication", async () => {
  const orderResponse = await request(app).post("/api/orders").send({});
  const adminResponse = await request(app).get("/api/admin/dashboard");
  const paymentResponse = await request(app).post("/api/payments/order").send({ amount: 100 });

  assert.equal(orderResponse.status, 401);
  assert.equal(orderResponse.body.message, "Authentication required");
  assert.equal(adminResponse.status, 401);
  assert.equal(adminResponse.body.message, "Authentication required");
  assert.equal(paymentResponse.status, 401);
  assert.equal(paymentResponse.body.message, "Authentication required");
});

test("protected routes reject invalid JWTs before database access", async () => {
  const response = await request(app)
    .get("/api/auth/me")
    .set("Authorization", "Bearer definitely-not-a-token");

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, {
    success: false,
    message: "Invalid authentication token",
  });
});
