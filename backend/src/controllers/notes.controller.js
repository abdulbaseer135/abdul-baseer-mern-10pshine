const asyncHandler = require('../utils/asyncHandler');
const ApiResponse  = require('../utils/ApiResponse');
const notesService = require('../services/notes.service');
const { getIO }    = require('../config/socket');
const crypto       = require('crypto'); // ✅ for generating share token


const createNote = asyncHandler(async (req, res) => {
  const note = await notesService.create(req.user._id, req.body);
  getIO().to(req.user._id.toString()).emit('note:created', note);
  return res.status(201).json(new ApiResponse(201, note, 'Note created successfully'));
});


const getAllNotes = asyncHandler(async (req, res) => {
  const page   = parseInt(req.query.page)  || 1;
  const limit  = parseInt(req.query.limit) || 10;
  const search = req.query.search?.trim()  || '';
  const result = await notesService.getAll(req.user._id, page, limit, search);
  return res.status(200).json(new ApiResponse(200, result, 'Notes fetched successfully'));
});


const getNoteById = asyncHandler(async (req, res) => {
  const note = await notesService.getOne(req.params.id, req.user._id);
  return res.status(200).json(new ApiResponse(200, note, 'Note fetched successfully'));
});


const updateNote = asyncHandler(async (req, res) => {
  const note = await notesService.update(req.params.id, req.user._id, req.body);
  getIO().to(req.user._id.toString()).emit('note:updated', note);
  return res.status(200).json(new ApiResponse(200, note, 'Note updated successfully'));
});


const deleteNote = asyncHandler(async (req, res) => {
  await notesService.remove(req.params.id, req.user._id);
  getIO().to(req.user._id.toString()).emit('note:deleted', { id: req.params.id });
  return res.status(200).json(new ApiResponse(200, null, 'Note deleted successfully'));
});


// ─── Export ────────────────────────────────────────────────────────────
const exportNotes = asyncHandler(async (req, res) => {
  const result = await notesService.getAll(req.user._id, 1, 1000, '');
  const notes  = result.notes ?? result;

  // ✅ Include noteId in export for portable identity
  const exportData = notes.map(({ _id, noteId, title, content, createdAt, updatedAt }) => ({
    _id,           // Include MongoDB _id for reference
    noteId,        // Include portable noteId for re-import
    title,
    content,
    createdAt,
    updatedAt,
  }));

  const payload = JSON.stringify({ exported_at: new Date(), notes: exportData }, null, 2);

  res.setHeader('Content-Disposition', 'attachment; filename="notes.json"');
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).send(payload);
});


// ─── Import ────────────────────────────────────────────────────────────
const importNotes = asyncHandler(async (req, res) => {
  const { notes } = req.body;

  if (!Array.isArray(notes) || notes.length === 0) {
    return res.status(400).json(new ApiResponse(400, null, 'Invalid import file — notes array required'));
  }

  const validNotes = notes.filter((n) => n.title?.trim());
  if (validNotes.length === 0) {
    return res.status(400).json(new ApiResponse(400, null, 'No valid notes found in import file'));
  }

  // ═════════════════════════════════════════════════════════════════════
  // ✅ IMPORT STRATEGY - OPTION B: Skip duplicates and report
  // Preserve noteId if provided, otherwise generate new one
  // Do NOT trust incoming userId from uploaded JSON
  // ═════════════════════════════════════════════════════════════════════

  const importedNotes = [];
  const skippedNotes = [];

  for (const n of validNotes) {
    const noteTitle = n.title.trim();
    let noteToCreate = {
      title: noteTitle,
      content: n.content || '',
      userId: req.user._id,  // ✅ Force userId to authenticated user
    };

    // If noteId is provided in import file and has valid format, try to preserve it
    if (n.noteId && typeof n.noteId === 'string') {
      const existingNote = await notesService.getByNoteId(n.noteId);
      if (existingNote) {
        // ✅ Skip if this noteId already exists for this user
        skippedNotes.push({
          noteId: n.noteId,
          title: noteTitle,
          reason: 'Note with this ID already exists',
        });
        continue;
      }
      // ✅ Use the provided noteId (preserve identity)
      noteToCreate.noteId = n.noteId;
    }
    // If no noteId provided, the model will generate one automatically

    try {
      const created = await notesService.create(req.user._id, noteToCreate);
      importedNotes.push(created);
      getIO().to(req.user._id.toString()).emit('note:created', created);
    } catch (error) {
      skippedNotes.push({
        title: noteTitle,
        reason: error.message || 'Failed to import note',
      });
    }
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        importedCount: importedNotes.length,
        skippedCount: skippedNotes.length,
        skipped: skippedNotes,
        imported: importedNotes,
      },
      `${importedNotes.length} note(s) imported, ${skippedNotes.length} skipped`
    )
  );
});


// ─── Toggle Share ───────────────────────────────────────────────────────
const toggleShare = asyncHandler(async (req, res) => {
  const note = await notesService.getOne(req.params.id, req.user._id);

  if (note.isPublic) {
    // ✅ Turn OFF sharing — clear token
    note.isPublic   = false;
    note.shareToken = null;
  } else {
    // ✅ Turn ON sharing — generate a secure unique token
    note.isPublic   = true;
    note.shareToken = crypto.randomBytes(32).toString('hex');
  }

  await note.save();

  return res.status(200).json(
    new ApiResponse(200, note, note.isPublic ? 'Note sharing enabled' : 'Note sharing disabled')
  );
});


// ─── Get Shared Note (public — no auth) ────────────────────────────────
const getSharedNote = asyncHandler(async (req, res) => {
  const note = await notesService.getByShareToken(req.params.token);

  if (!note) {
    return res.status(404).json(
      new ApiResponse(404, null, 'Note not found or sharing has been disabled')
    );
  }

  return res.status(200).json(new ApiResponse(200, note, 'Shared note fetched successfully'));
});


// ─── Toggle Pin (PR 2) ──────────────────────────────────────────────────
const togglePin = asyncHandler(async (req, res) => {
  const note = await notesService.getOne(req.params.id, req.user._id);

  // Toggle isPinned
  note.isPinned = !note.isPinned;
  await note.save();

  getIO().to(req.user._id.toString()).emit('note:updated', note);

  return res.status(200).json(
    new ApiResponse(200, note, note.isPinned ? 'Note pinned successfully' : 'Note unpinned successfully')
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
  toggleShare,   // ✅
  getSharedNote, // ✅
  togglePin,     // ✅ PR 2
};