const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
    getAdminStats,
    getAllUsers,
    approveWalletChange,
    getWalletRequests,
    getDeposits,
    approveDeposit,
    createUser,
    updateUser,
    toggleUserStatus
} = require('../controllers/adminController');

// Protect all admin routes
router.use(protect);
router.use(admin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.post('/create-user', createUser); // NEW
router.put('/users/:id', updateUser); // NEW
router.put('/users/:id/toggle-status', toggleUserStatus); // NEW

router.get('/wallet/requests', getWalletRequests);
router.put('/wallet/approve/:requestId', approveWalletChange);

router.get('/deposits', getDeposits);
router.put('/deposit/approve/:id', approveDeposit);

module.exports = router;
