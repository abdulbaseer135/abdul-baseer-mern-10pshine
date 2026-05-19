const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,   // ← this must be here
    },
    profileImage: {
      type: String,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: {
        type: String,
        default: null,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
      purpose: {
        type: String,
        enum: ['verify', 'reset'],
        default: null,
      },
    },
  },
  { timestamps: true }
);

// ✅ FIXED: removed next parameter, using async/await directly
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ═════════════════════════════════════════════════════════════════════
// ✅ CASCADE DELETE: When a user is deleted, delete all their notes
// ═════════════════════════════════════════════════════════════════════
// Note: Using async middleware without 'next' parameter
// Mongoose automatically waits for the promise to resolve
userSchema.pre('deleteOne', { document: true, query: false }, async function () {
  try {
    const Note = mongoose.model('Note');
    const result = await Note.deleteMany({ userId: this._id });
    // Log deletion for debugging
    console.log(`Deleted ${result.deletedCount} notes for user ${this._id}`);
  } catch (error) {
    console.error('Error deleting user notes:', error);
    throw error;
  }
  // No need to call next() with async middleware
  // Mongoose automatically continues after this returns
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;