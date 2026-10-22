const mongoose = require('mongoose');
const dns = require('node:dns');
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

const connectDB = async (retries = 3, delay = 2000) => {
  assertRequiredEnv();

  if (cached.conn) {
    return cached.conn;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    if (!cached.promise) {
      const uri = process.env.MONGO_URI;
      cached.promise = mongoose
        .connect(uri, {
          bufferCommands: false,
          serverSelectionTimeoutMS: 5000,
        })
        .then((conn) => {
          logger.info(`MongoDB connected: ${conn.connection.host}`);
          logger.info(`MongoDB database name: ${conn.connection.name}`);
          return conn;
        })
        .catch(async (err) => {
          // If SRV lookup DNS error on Windows, set public DNS servers and retry once
          if (err?.code === 'ECONNREFUSED' && err?.syscall === 'querySrv') {
            console.warn('[DB] SRV DNS lookup failed. Attempting fallback DNS (8.8.8.8, 1.1.1.1)...');
            try {
              dns.setServers(['8.8.8.8', '1.1.1.1']);
            } catch (dnsErr) {
              console.error('[DB] Could not set fallback DNS servers:', dnsErr.message);
            }
          }
          throw err;
        });
    }

    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (error) {
      cached.promise = null;
      logger.error({ ...(process.env.NODE_ENV === 'production' ? {} : { err: error }), attempt }, `MongoDB connection attempt ${attempt}/${retries} failed`);

      if (attempt === retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = connectDB;
