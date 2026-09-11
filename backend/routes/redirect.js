const express = require('express');
const router = express.Router();
const { redirect } = require('../controllers/redirectController');
const { redirectLimiter } = require('../middleware/rateLimiter');

// Matches /:shortCode - must be mounted AFTER all /api routes
router.get('/:shortCode', redirectLimiter, redirect);

module.exports = router;
