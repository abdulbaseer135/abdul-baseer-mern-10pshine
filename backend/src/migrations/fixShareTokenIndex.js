/**
 * Migration script to fix the E11000 duplicate key error on shareToken
 * Run this once with: node src/migrations/fixShareTokenIndex.js
 */

const mongoose = require('mongoose');
const logger = require('../config/logger');
const { MONGO_URI } = require('../config/env');

const fixShareTokenIndex = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB');

    // Get the notes collection
    const db = mongoose.connection.db;
    const collection = db.collection('notes');

    // Drop the old unique index if it exists
    try {
      await collection.dropIndex('shareToken_1');
      logger.info('✅ Dropped old shareToken_1 index');
    } catch (err) {
      if (err.code === 27) {
        logger.info('ℹ️  Index shareToken_1 does not exist (already dropped)');
      } else {
        throw err;
      }
    }

    // The new index will be created automatically when Mongoose loads the model
    require('../models/Note.model');
    logger.info('✅ Migration complete. New sparse index will be created on next app start');

    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Migration failed');
    process.exit(1);
  }
};

// Run the migration
fixShareTokenIndex();
