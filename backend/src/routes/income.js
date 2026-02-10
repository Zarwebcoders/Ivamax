const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
    getUserIncomeHistory,
    getCurrentIncome,
    processMonthlyIncome,
} = require('../controllers/incomeController');

// Protected user routes
router.use(protect);
router.get('/history', getUserIncomeHistory);
router.get('/current', getCurrentIncome);

// Admin routes
router.post('/process', admin, processMonthlyIncome);

module.exports = router;
