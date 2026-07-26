const DeletedAccount = require('../models/DeletedAccount.model');

const normalizeEmail = (email) => String(email || '').toLowerCase().trim();

const recordDeletedEmail = async (email) => {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  return DeletedAccount.findOneAndUpdate(
    { email: normalized },
    { email: normalized, deletedAt: new Date() },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );
};

const findDeletedByEmail = async (email) => {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  return DeletedAccount.findOne({ email: normalized }).lean();
};

const removeDeletedEmail = async (email) => {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  return DeletedAccount.findOneAndDelete({ email: normalized });
};

module.exports = {
  recordDeletedEmail,
  findDeletedByEmail,
  removeDeletedEmail,
};
