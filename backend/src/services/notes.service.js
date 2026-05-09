const {
  createNote,
  getNotesByUser,
  getNoteById,
  updateNote,
  deleteNote,
  getNoteByShareToken, // ✅ new DAL function we'll add next
} = require('../dal/notes.dal');
const ApiError = require('../utils/ApiError');
const logger   = require('../config/logger');


const create = async (userId, { title, content }) => {
  logger.info({ userId, title }, 'Creating new note');
  const note = await createNote({ title, content, userId });
  logger.info({ userId, noteId: note._id }, 'Note created successfully');
  return note;
};


const getAll = async (userId, page, limit, search = '') => {
  logger.info({ userId, page, limit, search }, 'Fetching all notes for user');
  const result = await getNotesByUser(userId, page, limit, search);
  logger.info({ userId, count: result?.notes?.length ?? 0 }, 'Notes fetched successfully');
  return result;
};


const getOne = async (noteId, userId) => {
  logger.info({ userId, noteId }, 'Fetching single note');
  const note = await getNoteById(noteId);
  if (!note) {
    logger.warn({ userId, noteId }, 'Note not found');
    throw new ApiError(404, 'Note not found');
  }
  if (note.userId.toString() !== userId.toString()) {
    logger.warn({ userId, noteId }, 'Unauthorized access attempt on note');
    throw new ApiError(403, 'Not authorized to access this note');
  }
  logger.info({ userId, noteId }, 'Note fetched successfully');
  return note;
};


const update = async (noteId, userId, updateData) => {
  logger.info({ userId, noteId }, 'Updating note');
  const note = await getNoteById(noteId);
  if (!note) {
    logger.warn({ userId, noteId }, 'Update failed — note not found');
    throw new ApiError(404, 'Note not found');
  }
  if (note.userId.toString() !== userId.toString()) {
    logger.warn({ userId, noteId }, 'Unauthorized update attempt on note');
    throw new ApiError(403, 'Not authorized to update this note');
  }
  const updated = await updateNote(noteId, updateData);
  logger.info({ userId, noteId }, 'Note updated successfully');
  return updated;
};


const remove = async (noteId, userId) => {
  logger.info({ userId, noteId }, 'Deleting note');
  const note = await getNoteById(noteId);
  if (!note) {
    logger.warn({ userId, noteId }, 'Delete failed — note not found');
    throw new ApiError(404, 'Note not found');
  }
  if (note.userId.toString() !== userId.toString()) {
    logger.warn({ userId, noteId }, 'Unauthorized delete attempt on note');
    throw new ApiError(403, 'Not authorized to delete this note');
  }
  const result = await deleteNote(noteId);
  logger.info({ userId, noteId }, 'Note deleted successfully');
  return result;
};


// ─── Get Shared Note by Token (public) ─────────────────────────────────
const getByShareToken = async (token) => {
  logger.info({ token }, 'Fetching shared note by token');

  const note = await getNoteByShareToken(token);

  if (!note) {
    logger.warn({ token }, 'Shared note not found or sharing disabled');
    throw new ApiError(404, 'Note not found or sharing has been disabled');
  }

  logger.info({ noteId: note._id }, 'Shared note fetched successfully');
  return note;
};


module.exports = { create, getAll, getOne, update, remove, getByShareToken }; // ✅