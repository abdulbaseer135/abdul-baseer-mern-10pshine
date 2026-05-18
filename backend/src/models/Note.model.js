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

    // ─── Note Features (PR 2) ───────────────────────────
    isPinned: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ['general', 'idea', 'task'],
      default: 'general',
    },
    taskStatus: {
      type: String,
      enum: ['todo', 'doing', 'done'],
      default: null,
    },
  },
  { timestamps: true }
);

// ═════════════════════════════════════════════════════════════════════
// ✅ MIDDLEWARE: Normalize taskStatus based on category
// When category is not 'task', clear taskStatus to null
// When category is 'task' and taskStatus is missing, default to 'todo'
// ═════════════════════════════════════════════════════════════════════
noteSchema.pre('save', function() {
  // If category is not 'task', always clear taskStatus
  if (this.category !== 'task') {
    this.taskStatus = null;
  } else if (this.category === 'task') {
    // If category IS 'task' but taskStatus is missing/null/invalid
    if (!this.taskStatus || !['todo', 'doing', 'done'].includes(this.taskStatus)) {
      this.taskStatus = 'todo';
    }
  }
});

// ✅ Indexes for performance and uniqueness

// User's notes sorted by creation date
noteSchema.index({ userId: 1, createdAt: -1 });

// ✅ NEW: For efficient pinned/unpinned sorting
noteSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });

// ✅ NEW: For category filtering
noteSchema.index({ userId: 1, category: 1, isPinned: -1, updatedAt: -1 });

// Unique index for noteId (moved from field-level unique to index-level)
noteSchema.index({ noteId: 1 }, { unique: true });

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