const mongoose = require('mongoose');

/**
 * Tombstone for hard-deleted accounts.
 * Lets login tell "deleted account" from "never registered"
 * without keeping the full user document.
 */
const deletedAccountSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

const DeletedAccount = mongoose.model('DeletedAccount', deletedAccountSchema);
module.exports = DeletedAccount;
