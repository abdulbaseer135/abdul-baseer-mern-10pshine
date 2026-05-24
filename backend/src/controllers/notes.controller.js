const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const notesService = require('../services/notes.service');
const { getIO } = require('../config/socket');
const crypto = require('node:crypto');

const createNote = asyncHandler(async (req, res) => {
  console.log('[DEBUG createNote] userId:', req.user._id.toString(), 'body:', req.body);

  const note = await notesService.create(req.user._id, req.body);

  console.log('[DEBUG createNote] SUCCESS - created note mongoId:', note._id.toString(), 'noteId:', note.noteId);

  getIO().to(req.user._id.toString()).emit('note:created', note);
  return res.status(201).json(new ApiResponse(201, note, 'Note created successfully'));
});

const getAllNotes = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const search = req.query.search?.trim() || '';

  console.log('[DEBUG getAllNotes] userId:', req.user._id.toString(), 'page:', page, 'limit:', limit, 'search:', search);

  const result = await notesService.getAll(req.user._id, page, limit, search);

  console.log('[DEBUG getAllNotes] fetched notes count:', result?.notes?.length || 0, 'totalPages:', result?.totalPages);

  return res.status(200).json(new ApiResponse(200, result, 'Notes fetched successfully'));
});

const getNoteById = asyncHandler(async (req, res) => {
  const note = await notesService.getOne(req.params.id, req.user._id);
  return res.status(200).json(new ApiResponse(200, note, 'Note fetched successfully'));
});

const updateNote = asyncHandler(async (req, res) => {
  console.log('[DEBUG updateNote] userId:', req.user._id.toString(), 'noteId:', req.params.id);

  const note = await notesService.update(req.params.id, req.user._id, req.body);
  getIO().to(req.user._id.toString()).emit('note:updated', note);

  return res.status(200).json(new ApiResponse(200, note, 'Note updated successfully'));
});

const deleteNote = asyncHandler(async (req, res) => {
  await notesService.remove(req.params.id, req.user._id);
  getIO().to(req.user._id.toString()).emit('note:deleted', { id: req.params.id });

  return res.status(200).json(new ApiResponse(200, null, 'Note deleted successfully'));
});

const exportNotes = asyncHandler(async (req, res) => {
  const result = await notesService.getAll(req.user._id, 1, 1000, '');
  const notes = result.notes ?? result;

  const exportData = notes.map(
    ({
      _id,
      noteId,
      title,
      content,
      category,
      taskStatus,
      isPinned,
      isPublic,
      shareToken,
      createdAt,
      updatedAt,
    }) => ({
      _id,
      noteId,
      title,
      content,
      category,
      taskStatus,
      isPinned,
      isPublic,
      shareToken,
      createdAt,
      updatedAt,
    })
  );

  const payload = JSON.stringify(
    { exported_at: new Date(), notes: exportData },
    null,
    2
  );

  res.setHeader('Content-Disposition', 'attachment; filename="notes.json"');
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).send(payload);
});

const importNotes = asyncHandler(async (req, res) => {
  const { notes } = req.body;
  const userId = req.user._id.toString();

  console.log('[DEBUG importNotes] userId:', userId, 'totalNotes to import:', notes?.length || 0);

  if (!Array.isArray(notes) || notes.length === 0) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, 'Invalid import file — notes array required'));
  }

  const validNotes = notes.filter((n) => n.title?.trim());

  if (validNotes.length === 0) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, 'No valid notes found in import file'));
  }

  const importedNotes = [];
  const skippedNotes = [];

  for (const n of validNotes) {
    const noteTitle = n.title.trim();

    const noteToCreate = {
      title: noteTitle,
      content: n.content || '',
      userId: req.user._id,
      category: n.category || 'general',
      taskStatus: n.taskStatus || null,
      isPinned: n.isPinned || false,
    };

    // ✅ Check for duplicate ONLY for current user with same noteId
    if (n.noteId && typeof n.noteId === 'string') {
      const existingNote = await notesService.getByNoteId(n.noteId, req.user._id);
      if (existingNote) {
        console.log('[DEBUG importNotes] SKIP - duplicate noteId for user:', n.noteId);
        skippedNotes.push({
          noteId: n.noteId,
          title: noteTitle,
          reason: 'Note with this ID already exists for you',
        });
        continue;
      }

      noteToCreate.noteId = n.noteId;
    }

    try {
      const created = await notesService.create(req.user._id, noteToCreate);
      console.log('[DEBUG importNotes] IMPORTED - noteId:', created.noteId, '_id:', created._id.toString());
      importedNotes.push(created);
      getIO().to(userId).emit('note:created', created);
    } catch (error) {
      console.error('[DEBUG importNotes] FAILED to import note:', error.message);
      skippedNotes.push({
        title: noteTitle,
        reason: error.message || 'Failed to import note',
      });
    }
  }

  const message = `${importedNotes.length} note(s) imported successfully, ${skippedNotes.length} skipped`;
  console.log('[DEBUG importNotes] COMPLETE:', message);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        importedCount: importedNotes.length,
        skippedCount: skippedNotes.length,
        skipped: skippedNotes,
        imported: importedNotes,
      },
      message
    )
  );
});

const toggleShare = asyncHandler(async (req, res) => {
  const note = await notesService.getOne(req.params.id, req.user._id);

  if (note.isPublic) {
    note.isPublic = false;
    note.shareToken = null;
  } else {
    note.isPublic = true;
    note.shareToken = crypto.randomBytes(32).toString('hex');
  }

  await note.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      note,
      note.isPublic ? 'Note sharing enabled' : 'Note sharing disabled'
    )
  );
});

const getSharedNote = asyncHandler(async (req, res) => {
  const note = await notesService.getByShareToken(req.params.token);

  if (!note) {
    return res.status(404).json(
      new ApiResponse(404, null, 'Note not found or sharing has been disabled')
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, 'Shared note fetched successfully'));
});

const togglePin = asyncHandler(async (req, res) => {
  const note = await notesService.getOne(req.params.id, req.user._id);

  note.isPinned = !note.isPinned;
  await note.save();

  getIO().to(req.user._id.toString()).emit('note:updated', note);

  return res.status(200).json(
    new ApiResponse(
      200,
      note,
      note.isPinned ? 'Note pinned successfully' : 'Note unpinned successfully'
    )
  );
});

module.exports = {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
  exportNotes,
  importNotes,
  toggleShare,
  getSharedNote,
  togglePin,
};