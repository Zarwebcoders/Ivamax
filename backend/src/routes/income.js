const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
    getUserIncomeHistory,
    getCurrentIncome,
    getMatchingHistory,
    processMonthlyIncome,
    triggerMonthlyClosing,
} = require('../controllers/incomeController');

// Protected user routes
router.use(protect);
router.get('/history', getUserIncomeHistory);
router.get('/history/matching', getMatchingHistory);
router.get('/current', getCurrentIncome);

// Admin routes
router.post('/process', admin, processMonthlyIncome);
router.post('/closing', admin, triggerMonthlyClosing); // Manual Trigger for Deferred Payout

module.exports = router;
