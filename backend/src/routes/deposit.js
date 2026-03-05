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

// @desc    Buy package using profit wallet (walletBalance)
// @route   POST /api/deposit/buy-profit
// @access  Private
router.post('/buy-profit', protect, async (req, res) => {
    try {
        const { packageId, packageName, price } = req.body;
        const User = require('../models/User');
        const Income = require('../models/Income');
        const user = await User.findOne({ userId: req.user.userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 1. Check Monthly Closing Status
        // If there are ANY pending incomes with a due date in the past, it means closing hasn't run yet.
        const pendingPayouts = await Income.exists({
            userId: user.userId,
            status: 'pending',
            paymentDueDate: { $lte: new Date() }
        });

        if (pendingPayouts) {
            return res.status(400).json({
                message: 'Buy with Profit is locked! Monthly closing for the previous period is pending. Please wait for admin to process. Once closing is complete and your profit is released, you can buy again.'
            });
        }

        // 2. Check Balance
        if (user.walletBalance < price) {
            return res.status(400).json({ message: 'Insufficient balance in Profit Wallet' });
        }

        // 3. Create Deposit Record
        const deposit = await Deposit.create({
            userId: user.userId,
            amount: price,
            currency: 'PROFIT_WALLET',
            transactionHash: `PROFIT_${Date.now()}`,
            packageId,
            packageName,
            type: 'profit',
            status: 'approved' // Auto-approve since balance is already checked
        });

        // 4. Deduct Balance and Activate
        user.walletBalance -= price;
        await user.save();

        const activatePackage = require('../utils/activatePackage');
        await activatePackage(deposit._id, 'SYSTEM');

        res.json({
            success: true,
            message: 'Package purchased successfully using Profit Wallet!',
            data: {
                balance: user.walletBalance,
                deposit
            }
        });

    } catch (error) {
        console.error('Buy Profit Error:', error);
        res.status(500).json({ message: 'Server error processing profit purchase' });
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
