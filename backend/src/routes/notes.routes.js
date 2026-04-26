const express = require('express');
const router = express.Router();
const {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
  exportNotes,
  importNotes,
} = require('../controllers/notes.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect); // all notes routes are protected

// ─── Export / Import — MUST be BEFORE /:id ─────────────────────────────
router.get('/export',  exportNotes);   // ✅ GET  /api/v1/notes/export
router.post('/import', importNotes);   // ✅ POST /api/v1/notes/import

// ─── Standard CRUD ─────────────────────────────────────────────────────
router.post('/',       createNote);
router.get('/',        getAllNotes);
router.get('/:id',     getNoteById);   // ⚠️ wildcard — must be LAST among GETs
router.put('/:id',     updateNote);
router.delete('/:id',  deleteNote);

module.exports = router;