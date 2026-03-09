const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const Wallet = require('../models/Wallet');

// Constants
const MIN_WITHDRAWAL = 10;
const WITHDRAWAL_FEE_PERCENT = 0;

// Request withdrawal
const requestWithdrawal = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { amount, walletAddress, method } = req.body;

        // Validate input
        if (!amount || !walletAddress) {
            return res.status(400).json({ message: 'Amount and wallet address are required' });
        }

        const withdrawalAmount = parseFloat(amount);

        // Check minimum amount
        if (withdrawalAmount < MIN_WITHDRAWAL) {
            return res.status(400).json({
                message: `Minimum withdrawal amount is $${MIN_WITHDRAWAL}`
            });
        }

        // Get user
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }



        // Check for pending withdrawals
        const pendingWithdrawal = await Withdrawal.findOne({
            userId,
            status: 'pending'
        });
        if (pendingWithdrawal) {
            return res.status(400).json({
                message: 'You already have a pending withdrawal request'
            });
        }

        // Calculate fee and net amount
        // Calculate fee and net amount
        const fee = 0;
        const totalDeduction = withdrawalAmount;

        // Check sufficient balance
        if (user.walletBalance < totalDeduction) {
            return res.status(400).json({
                message: `Insufficient balance. Required: $${totalDeduction.toFixed(2)} (Amount: $${withdrawalAmount} + Fee: $${fee.toFixed(2)})`,
                available: user.walletBalance
            });
        }

        // Calculate payable amount (1 USD = 10 IMAX, plus 15% bonus for IMAX Token)
        const isImax = method === 'IMAX Token (BEP-20)';
        const payableAmount = isImax ? (withdrawalAmount * 10 * 1.15) : withdrawalAmount;

        // Create withdrawal request
        const withdrawal = new Withdrawal({
            userId,
            amount: withdrawalAmount,
            walletAddress: walletAddress,
            status: 'pending',
            method: method || 'USDT (BEP-20)',
            payableAmount: payableAmount
        });

        await withdrawal.save();

        // Deduct from wallet balance (hold)
        await User.updateOne(
            { userId },
            { $inc: { walletBalance: -totalDeduction } }
        );

        res.json({
            success: true,
            message: 'Withdrawal request submitted successfully',
            data: {
                withdrawalId: withdrawal._id,
                amount: withdrawalAmount,
                method: withdrawal.method,
                payableAmount: withdrawal.payableAmount,
                fee,
                totalDeduction,
                status: 'pending'
            }
        });

    } catch (error) {
        console.error('Error requesting withdrawal:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get withdrawal history
const getWithdrawalHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { limit = 20, page = 1, status } = req.query;

        const filter = { userId };
        if (status && status !== 'All') {
            filter.status = status.toLowerCase();
        }

        const withdrawals = await Withdrawal.find(filter)
            .sort({ requestDate: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Withdrawal.countDocuments(filter);

        res.json({
            success: true,
            data: withdrawals,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error fetching withdrawal history:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get withdrawal statistics
const getWithdrawalStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Calculate total withdrawn (approved only)
        const approvedWithdrawals = await Withdrawal.find({
            userId,
            status: 'approved'
        });
        const totalWithdrawn = approvedWithdrawals.reduce((sum, w) => sum + w.amount, 0);

        // Calculate pending amount
        const pendingWithdrawals = await Withdrawal.find({
            userId,
            status: 'pending'
        });
        const pendingAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

        res.json({
            success: true,
            data: {
                availableBalance: user.walletBalance,
                totalWithdrawn,
                pendingAmount,
                totalEarnings: user.totalEarnings || 0
            }
        });

    } catch (error) {
        console.error('Error fetching withdrawal stats:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get pending withdrawals (Admin)
const getPendingWithdrawals = async (req, res) => {
    try {
        const { status = 'pending' } = req.query;

        const withdrawals = await Withdrawal.find({ status })
            .sort({ requestDate: 1 })
            .lean();

        // Populate user details
        const withdrawalsWithUsers = await Promise.all(
            withdrawals.map(async (withdrawal) => {
                const user = await User.findOne({ userId: withdrawal.userId })
                    .select('userId fullName email mobile walletBalance');
                return {
                    ...withdrawal,
                    user
                };
            })
        );

        res.json({
            success: true,
            data: withdrawalsWithUsers,
            count: withdrawalsWithUsers.length
        });

    } catch (error) {
        console.error('Error fetching pending withdrawals:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Approve withdrawal (Admin)
const approveWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const { transactionHash, notes } = req.body;
        const adminId = req.user.userId;

        const withdrawal = await Withdrawal.findById(id);
        if (!withdrawal) {
            return res.status(404).json({ message: 'Withdrawal not found' });
        }

        if (withdrawal.status !== 'pending') {
            return res.status(400).json({
                message: `Withdrawal already ${withdrawal.status}`
            });
        }

        // Update withdrawal
        withdrawal.status = 'approved';
        withdrawal.processedDate = new Date();
        withdrawal.processedBy = adminId;
        withdrawal.transactionHash = transactionHash || '';
        withdrawal.adminNotes = notes || 'Approved';
        await withdrawal.save();

        res.json({
            success: true,
            message: 'Withdrawal approved successfully',
            data: withdrawal
        });

    } catch (error) {
        console.error('Error approving withdrawal:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Reject withdrawal (Admin)
const rejectWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = req.user.userId;

        if (!reason) {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }

        const withdrawal = await Withdrawal.findById(id);
        if (!withdrawal) {
            return res.status(404).json({ message: 'Withdrawal not found' });
        }

        if (withdrawal.status !== 'pending') {
            return res.status(400).json({
                message: `Withdrawal already ${withdrawal.status}`
            });
        }

        // Calculate refund amount (amount + fee)
        const fee = (withdrawal.amount * WITHDRAWAL_FEE_PERCENT) / 100;
        const refundAmount = withdrawal.amount + fee;

        // Refund to wallet balance
        await User.updateOne(
            { userId: withdrawal.userId },
            { $inc: { walletBalance: refundAmount } }
        );

        // Update withdrawal
        withdrawal.status = 'rejected';
        withdrawal.processedDate = new Date();
        withdrawal.processedBy = adminId;
        withdrawal.adminNotes = reason;
        await withdrawal.save();

        res.json({
            success: true,
            message: 'Withdrawal rejected and amount refunded',
            data: withdrawal,
            refundAmount
        });

    } catch (error) {
        console.error('Error rejecting withdrawal:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all withdrawals (Admin)
const getAllWithdrawals = async (req, res) => {
    try {
        const { limit = 50, page = 1, status } = req.query;

        const filter = status ? { status } : {};

        const withdrawals = await Withdrawal.find(filter)
            .sort({ requestDate: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        // Populate user details
        const withdrawalsWithUsers = await Promise.all(
            withdrawals.map(async (withdrawal) => {
                const user = await User.findOne({ userId: withdrawal.userId })
                    .select('userId fullName email');
                return {
                    ...withdrawal,
                    user
                };
            })
        );

        const total = await Withdrawal.countDocuments(filter);

        res.json({
            success: true,
            data: withdrawalsWithUsers,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error fetching all withdrawals:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    requestWithdrawal,
    getWithdrawalHistory,
    getWithdrawalStats,
    getPendingWithdrawals,
    approveWithdrawal,
    rejectWithdrawal,
    getAllWithdrawals,
};
