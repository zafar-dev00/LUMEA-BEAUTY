const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { mongodbUri, nodeEnv } = require('./env');

let memoryServer;

mongoose.set('strictQuery', true);
mongoose.set('bufferCommands', false);

const connectWithMemoryFallback = async () => {
  if (nodeEnv === 'production') {
    return false;
  }

  try {
    memoryServer = memoryServer || (await MongoMemoryServer.create());
    const conn = await mongoose.connect(memoryServer.getUri(), {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 15000,
      maxPoolSize: 10,
      retryWrites: false,
    });

    console.warn('⚠️ Using an in-memory MongoDB instance because the configured MONGODB_URI is unavailable or invalid.');
    console.log(`✔ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (err) {
    console.error(`✖ MongoDB memory fallback failed: ${err.message}`);
    return false;
  }
};

/**
 * Connects to MongoDB using Mongoose.
 * Uses an in-memory fallback in development when the configured Atlas URI is
 * missing, malformed, or rejected so the app can still boot locally.
 */
const connectDB = async () => {
  if (!mongodbUri) {
    console.warn(
      '⚠️ MONGODB_URI is not set. Falling back to an in-memory MongoDB instance for local development.'
    );
    return connectWithMemoryFallback();
  }

  if (/[<>]/.test(mongodbUri)) {
    console.warn(
      '⚠️ MONGODB_URI is malformed. Falling back to an in-memory MongoDB instance for local development.'
    );
    return connectWithMemoryFallback();
  }

  try {
    const conn = await mongoose.connect(mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      maxPoolSize: 10,
      retryWrites: false,
    });
    console.log(`✔ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (err) {
    console.error(`✖ MongoDB connection failed: ${err.message}`);

    if (nodeEnv === 'production') {
      return false;
    }

    console.warn('⚠️ Falling back to an in-memory MongoDB instance for local development.');
    return connectWithMemoryFallback();
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err.message}`);
});

module.exports = connectDB;
