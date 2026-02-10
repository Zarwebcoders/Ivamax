const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
    requestWithdrawal,
    getWithdrawalHistory,
    getWithdrawalStats,
    getPendingWithdrawals,
    approveWithdrawal,
    rejectWithdrawal,
    getAllWithdrawals,
} = require('../controllers/withdrawalController');

// Protected user routes
router.use(protect);
router.post('/request', requestWithdrawal);
router.get('/history', getWithdrawalHistory);
router.get('/stats', getWithdrawalStats);

// Admin routes
router.get('/pending', admin, getPendingWithdrawals);
router.get('/all', admin, getAllWithdrawals);
router.put('/:id/approve', admin, approveWithdrawal);
router.put('/:id/reject', admin, rejectWithdrawal);

module.exports = router;
