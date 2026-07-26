const mongoose = require('mongoose');
const logger = require('./logger');
const { assertRequiredEnv } = require('./env');

/**
 * Cached connection for serverless (warm invocations reuse the same client).
 * Avoids process.exit — that kills the Vercel function permanently.
 */
let cached = global.__mongooseCache;

if (!cached) {
  cached = global.__mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
  assertRequiredEnv();

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
      })
      .then((conn) => {
        logger.info(`MongoDB connected: ${conn.connection.host}`);
        logger.info(`MongoDB database name: ${conn.connection.name}`);
        return conn;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    logger.error({ err: error }, 'MongoDB connection failed');
    console.error('[DB] MongoDB connection failed:', error.message);
    throw error;
  }
};

module.exports = connectDB;
