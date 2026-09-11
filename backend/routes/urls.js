const express = require('express');
const router = express.Router();
const {
  createUrl,
  getUserUrls,
  getUrlById,
  updateUrl,
  deleteUrl,
  getQRCode,
  verifyPassword,
} = require('../controllers/urlController');
const { protect } = require('../middleware/auth');
const { urlCreateLimiter } = require('../middleware/rateLimiter');
const { createUrlValidator, updateUrlValidator, verifyPasswordValidator } = require('../utils/validators');

// All URL management routes require authentication
router.use(protect);

router.post('/', urlCreateLimiter, createUrlValidator, createUrl);
router.get('/', getUserUrls);
router.get('/:id', getUrlById);
router.put('/:id', updateUrlValidator, updateUrl);
router.delete('/:id', deleteUrl);
router.get('/:id/qr', getQRCode);
router.post('/:shortCode/verify-password', verifyPasswordValidator, verifyPassword);

module.exports = router;
