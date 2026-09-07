require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';

// A missing JWT secret would mean every token gets signed/verified with an
// empty string — trivially forgeable. Fail fast at boot instead of silently
// running in an insecure state. Skipped under NODE_ENV=test so a future
// test harness can inject its own secret without booting the real server.
if (!process.env.JWT_SECRET && nodeEnv !== 'test') {
  console.error(
    '✖ Missing required environment variable: JWT_SECRET. Set it in your .env file (see .env.example) before starting the server.'
  );
  process.exit(1);
}

const weakJwtSecrets = new Set(['yoursecret', 'yoursupersecretjwtkey123', 'changeme']);
if (
  nodeEnv !== 'test' &&
  (process.env.JWT_SECRET.length < 32 || weakJwtSecrets.has(process.env.JWT_SECRET.toLowerCase()))
) {
  console.error(
    '✖ JWT_SECRET must be at least 32 characters and must not use a predictable default value.'
  );
  process.exit(1);
}

module.exports = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  onlinePaymentsEnabled: process.env.ONLINE_PAYMENTS_ENABLED === 'true',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  nodeEnv,
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE !== 'false',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
  },
  // Single source of truth for what counts as "low stock" across the admin
  // dashboard (cards, inventory table, product status badges) so it's never
  // hardcoded in more than one place.
  lowStockThreshold: parseInt(process.env.LOW_STOCK_THRESHOLD, 10) || 10,
  upi: {
    enabled: process.env.UPI_ENABLED === 'true',
    id: process.env.UPI_ID || '',
    merchantName: process.env.UPI_MERCHANT_NAME || 'LUMEA BEAUTY',
  },
};
