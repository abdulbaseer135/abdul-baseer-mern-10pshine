const mongoose = require('mongoose');

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

// ✅ Only enforces uniqueness when shareToken is an actual string (not null)
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