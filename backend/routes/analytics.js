const express = require('express');
const router = express.Router();
const { getDashboard, getUrlAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/:urlId', getUrlAnalytics);

module.exports = router;
