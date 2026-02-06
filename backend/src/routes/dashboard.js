const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/dashboardController');

// Protected Routes
router.use(protect);
router.get('/stats', getDashboardStats);

module.exports = router;
