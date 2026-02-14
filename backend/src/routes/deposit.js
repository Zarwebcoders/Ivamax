const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Deposit = require('../models/Deposit');

// @desc    Submit a new deposit request
// @route   POST /api/deposit
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { amount, currency, transactionHash, packageId, packageName, type } = req.body;

        // Check for duplicate hash
        const existing = await Deposit.findOne({ transactionHash });
        if (existing) {
            return res.status(400).json({ message: 'Transaction hash already exists' });
        }

        const deposit = await Deposit.create({
            userId: req.user.userId,
            amount,
            currency,
            transactionHash,
            packageId,
            packageName,
            type: req.body.type || 'manual'
        });

        // 🟢 AUTOMATIC ACTIVATION: If type is 'auto', approve and activate immediately
        if (type === 'auto') {
            try {
                const activatePackage = require('../utils/activatePackage');
                await activatePackage(deposit._id, 'SYSTEM');
                return res.status(201).json({
                    success: true,
                    message: 'Payment verified and package activated automatically!',
                    data: deposit
                });
            } catch (actError) {
                console.error('Auto Activation Failed, but deposit saved:', actError);
                // We don't fail the response because the deposit is already saved
                return res.status(201).json({
                    success: true,
                    message: 'Deposit received. Auto-activation failed, admin will review.',
                    data: deposit
                });
            }
        }

        res.status(201).json({
            success: true,
            message: 'Deposit request submitted successfully',
            data: deposit
        });
    } catch (error) {
        console.error('Deposit Error:', error);
        res.status(500).json({ message: 'Server error submiting deposit' });
    }
});

// @desc    Get my deposit history
// @route   GET /api/deposit/my-history
// @access  Private
router.get('/my-history', protect, async (req, res) => {
    try {
        const deposits = await Deposit.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: deposits });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
