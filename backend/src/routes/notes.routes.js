const express = require('express');
const router = express.Router();
const {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
} = require('../controllers/notes.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect); // all notes routes are protected

router.post('/', createNote);
router.get('/', getAllNotes);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;