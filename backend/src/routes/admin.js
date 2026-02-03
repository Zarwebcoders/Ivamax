const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
    getAdminStats,
    getAllUsers,
    approveWalletChange,
    getWalletRequests
} = require('../controllers/adminController');

// Protect all admin routes
router.use(protect);
router.use(admin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.get('/wallet/requests', getWalletRequests);
router.put('/wallet/approve/:requestId', approveWalletChange);

module.exports = router;
