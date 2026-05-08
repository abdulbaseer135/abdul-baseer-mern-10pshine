const express = require('express');
const router  = express.Router();
const {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
  exportNotes,
  importNotes,
  toggleShare,    // ✅
  getSharedNote,  // ✅
} = require('../controllers/notes.controller');
const { protect } = require('../middleware/auth.middleware');


// ─── Public Route — MUST be BEFORE router.use(protect) ─────────────────
// Anyone with the token can view — no login required
router.get('/shared/:token', getSharedNote);  // ✅ GET /api/v1/notes/shared/:token


// ─── All routes below this line require auth ────────────────────────────
router.use(protect);


// ─── Export / Import — MUST be BEFORE /:id ─────────────────────────────
router.get('/export',  exportNotes);   // GET  /api/v1/notes/export
router.post('/import', importNotes);   // POST /api/v1/notes/import


// ─── Share Toggle ───────────────────────────────────────────────────────
router.patch('/:id/share', toggleShare); // ✅ PATCH /api/v1/notes/:id/share


// ─── Standard CRUD ─────────────────────────────────────────────────────
router.post('/',      createNote);
router.get('/',       getAllNotes);
router.get('/:id',    getNoteById);  // ⚠️ wildcard — must be LAST among GETs
router.put('/:id',    updateNote);
router.delete('/:id', deleteNote);


module.exports = router;