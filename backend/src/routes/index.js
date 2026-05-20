const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const notesRoutes = require('./notes.routes');
const usersRoutes = require('./users.routes');
const profileRoutes = require('./profile.routes');

router.use('/auth', authRoutes);
router.use('/notes', notesRoutes);
router.use('/users', usersRoutes);
router.use('/profile', profileRoutes);

module.exports = router;
