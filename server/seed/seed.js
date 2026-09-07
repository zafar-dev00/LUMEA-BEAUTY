require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const { categories, products } = require('./data');

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const seedAdmin = async () => {
  const email = (process.env.ADMIN_EMAIL || 'admin@lumeabeauty.com').toLowerCase().trim();
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'ADMIN') {
      existing.role = 'ADMIN';
      await existing.save();
    }
    console.log(`✔ Admin user ready: ${email}`);
    return;
  }

  await User.create({
    name: process.env.ADMIN_NAME || 'LUMÉA Admin',
    email,
    phone: process.env.ADMIN_PHONE || '9999999999',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
    role: 'ADMIN',
  });
  console.log(`✔ Admin user created: ${email}`);
};

const seedCoupons = async () => {
  const demoCoupons = [
    { code: 'LUMEA10', discountPercentage: 10, minOrder: 0, maxDiscount: null },
    { code: 'GLOW20', discountPercentage: 20, minOrder: 50, maxDiscount: 40 },
  ];
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  let count = 0;
  for (const c of demoCoupons) {
    await Coupon.findOneAndUpdate(
      { code: c.code },
      { $set: { ...c, expiryDate: oneYearFromNow, isActive: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );
    count += 1;
  }
  console.log(`✔ ${count} demo coupons upserted.`);
};

const seed = async () => {
  const connected = await connectDB();

  if (!connected) {
    console.error('Aborting seed: could not connect to MongoDB.');
    process.exit(1);
  }

  try {
    console.log('Clearing old categories and products to eliminate broken links...');
    await Product.deleteMany({});
    await Category.deleteMany({});

    console.log('Seeding categories...');
    let categoryCount = 0;
    for (const cat of categories) {
      await Category.create({
        ...cat,
        slug: slugify(cat.name),
      });
      categoryCount += 1;
    }
    console.log(`✔ ${categoryCount} categories inserted.`);

    console.log('Seeding products...');
    let productCount = 0;
    for (const prod of products) {
      await Product.create({
        ...prod,
        slug: slugify(prod.name),
      });
      productCount += 1;
    }
    console.log(`✔ ${productCount} products inserted.`);

    console.log('Seeding admin user...');
    await seedAdmin();

    console.log('Seeding demo coupons...');
    await seedCoupons();

    console.log('Seed complete successfully.');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

seed();