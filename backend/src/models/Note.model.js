const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ─── Note Identity ─────────────────────────────────
    // noteId: portable/export-safe unique identity
    // _id: internal database identity (handled by MongoDB)
    noteId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },

    // ─── Note Sharing ──────────────────────────────────
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareToken: {
      type: String,
      default: null,
      // ✅ NO unique/sparse here — index defined below with partialFilterExpression
    },
  },
  { timestamps: true }
);

// ✅ Indexes for performance and uniqueness

// User's notes sorted by creation date
noteSchema.index({ userId: 1, createdAt: -1 });

// Quick lookup by noteId (for export/import)
noteSchema.index({ noteId: 1 });

// Only enforces uniqueness when shareToken is an actual string (not null)
// sparse: true + partialFilterExpression prevents null values from being indexed
noteSchema.index(
  { shareToken: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { shareToken: { $type: 'string' } },
  }
);

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;