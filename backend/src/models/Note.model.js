const mongoose = require('mongoose');
const { randomUUID: uuidv4 } = require('node:crypto');

const TASK_STATUSES = ['todo', 'doing', 'done'];
const NOTE_CATEGORIES = ['general', 'idea', 'task'];

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
      trim: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    noteId: {
      type: String,
      required: true,
      default: uuidv4,
      immutable: true,
      trim: true,
    },

    isPublic: {
      type: Boolean,
      default: false,
    },

    shareToken: {
      type: String,
      default: null,
      trim: true,
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    category: {
      type: String,
      enum: NOTE_CATEGORIES,
      default: 'general',
      trim: true,
    },

    taskStatus: {
      type: String,
      enum: TASK_STATUSES,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

function normalizeTaskStatus(target) {
  if (!target) return;

  if (target.category !== undefined) {
    target.category = String(target.category).trim();
  }

  if (target.taskStatus !== undefined && target.taskStatus !== null) {
    target.taskStatus = String(target.taskStatus).trim();
  }

  if (target.category !== 'task') {
    target.taskStatus = null;
    return;
  }

  if (!target.taskStatus || !TASK_STATUSES.includes(target.taskStatus)) {
    target.taskStatus = 'todo';
  }
}

noteSchema.pre('save', async function () {
  normalizeTaskStatus(this);
});

noteSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate();
  if (!update) {
    return;
  }

  const payload = { ...update, ...update.$set };
  if (payload.category === undefined && payload.taskStatus === undefined) return;
  const existing = await this.model.findOne(this.getQuery()).lean();
  const state = { category: existing?.category, taskStatus: existing?.taskStatus, ...payload };
  if (payload.category === 'task' && existing?.category !== 'task' && payload.taskStatus === undefined) {
    state.taskStatus = 'todo';
  }
  normalizeTaskStatus(state);
  this.setUpdate({ ...update, $set: { ...update.$set, taskStatus: state.taskStatus } });
});

// ✅ Compound unique index: noteId must be unique per user, not globally
noteSchema.index({ userId: 1, noteId: 1 }, { unique: true, sparse: true });

// ✅ Lookup indexes for common queries
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });
noteSchema.index({ userId: 1, category: 1, isPinned: -1, updatedAt: -1 });

noteSchema.index(
  { shareToken: 1 },
  {
    unique: true,
    partialFilterExpression: { shareToken: { $type: 'string' } },
  }
);

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
