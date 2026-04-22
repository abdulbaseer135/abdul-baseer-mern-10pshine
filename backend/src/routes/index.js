const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const notesRoutes = require('./notes.routes');

router.use('/auth', authRoutes);
router.use('/notes', notesRoutes);

// Users routes will be added in Branch 3
// router.use('/users', require('./users.routes'));

module.exports = router;