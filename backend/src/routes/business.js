const express = require('express');
const router = express.Router();
const { getDirectReferrals } = require('../controllers/businessController');
const { protect } = require('../middleware/auth');

router.get('/direct-referrals', protect, getDirectReferrals);

module.exports = router;
