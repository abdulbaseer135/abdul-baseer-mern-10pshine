const mongoose = require('mongoose');
const logger = require('./logger');
const { MONGO_URI } = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);

    logger.info(`MongoDB connected: ${conn.connection.host}`);
    logger.info(`MongoDB database name: ${conn.connection.name}`);
    logger.info(`MongoDB readyState: ${mongoose.connection.readyState}`);
  } catch (error) {
    logger.error({ err: error }, 'MongoDB connection failed');
    process.exit(1);
  }
};

module.exports = connectDB;