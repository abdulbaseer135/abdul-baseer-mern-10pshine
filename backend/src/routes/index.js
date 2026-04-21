const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');

router.use('/auth', authRoutes);

// Notes and Users routes will be added in future branches
// router.use('/notes', require('./notes.routes'));
// router.use('/users', require('./users.routes'));

module.exports = router;