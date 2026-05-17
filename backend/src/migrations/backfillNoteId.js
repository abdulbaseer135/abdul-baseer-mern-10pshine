/**
 * Migration Script: Backfill noteId for existing notes
 * 
 * This script ensures all existing notes have a unique noteId field.
 * It should be run once after deploying the noteId schema change.
 * 
 * Usage: node src/migrations/backfillNoteId.js
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

// Dynamically load the Note model
const Note = require('../models/Note.model');

// ═════════════════════════════════════════════════════════════════════
// BACKFILL MIGRATION
// ═════════════════════════════════════════════════════════════════════

const backfillNoteIds = async () => {
  try {
    // Find all notes that don't have a noteId
    const notesWithoutNoteId = await Note.find({ noteId: null });

    if (notesWithoutNoteId.length === 0) {
      logger.info('No notes without noteId found. Migration already complete.');
      return { alreadyComplete: true, updated: 0 };
    }

    logger.info(
      `Found ${notesWithoutNoteId.length} notes without noteId. Starting backfill...`
    );

    let updated = 0;
    const errors = [];

    for (const note of notesWithoutNoteId) {
      try {
        // Generate unique noteId using UUID
        note.noteId = uuidv4();
        await note.save();
        updated++;

        if (updated % 100 === 0) {
          logger.info(`Backfilled ${updated}/${notesWithoutNoteId.length} notes...`);
        }
      } catch (error) {
        errors.push({
          noteId: note._id,
          error: error.message,
        });
        logger.error(`Failed to backfill note ${note._id}: ${error.message}`);
      }
    }

    logger.info(
      `Migration complete. Updated: ${updated}, Errors: ${errors.length}`
    );

    return { updated, errors, success: errors.length === 0 };
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
};

// ═════════════════════════════════════════════════════════════════════
// MAIN EXECUTION (if run directly)
// ═════════════════════════════════════════════════════════════════════

if (require.main === module) {
  (async () => {
    try {
      // Connect to MongoDB
      const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app';
      await mongoose.connect(dbUri);
      logger.info('Connected to MongoDB');

      // Run migration
      const result = await backfillNoteIds();

      // Log result
      if (result.alreadyComplete) {
        console.log('✅ No migration needed. All notes already have noteId.');
      } else {
        console.log(
          `✅ Migration complete: ${result.updated} notes updated, ${result.errors.length} errors`
        );
        if (result.errors.length > 0) {
          console.error('Errors:', result.errors);
        }
      }

      process.exit(result.success ? 0 : 1);
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    } finally {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
    }
  })();
}

module.exports = { backfillNoteIds };
