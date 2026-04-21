const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const notesService = require('../services/notes.service');

const createNote = asyncHandler(async (req, res) => {
  const note = await notesService.create(req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, note, 'Note created successfully'));
});

const getAllNotes = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const result = await notesService.getAll(req.user._id, page, limit);
  return res.status(200).json(new ApiResponse(200, result, 'Notes fetched successfully'));
});

const getNoteById = asyncHandler(async (req, res) => {
  const note = await notesService.getOne(req.params.id, req.user._id);
  return res.status(200).json(new ApiResponse(200, note, 'Note fetched successfully'));
});

const updateNote = asyncHandler(async (req, res) => {
  const note = await notesService.update(req.params.id, req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, note, 'Note updated successfully'));
});

const deleteNote = asyncHandler(async (req, res) => {
  await notesService.remove(req.params.id, req.user._id);
  return res.status(200).json(new ApiResponse(200, null, 'Note deleted successfully'));
});

module.exports = { createNote, getAllNotes, getNoteById, updateNote, deleteNote };