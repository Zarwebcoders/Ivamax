const User = require('../models/User');
const Tree = require('../models/Tree');
const Income = require('../models/Income');
const Withdrawal = require('../models/Withdrawal');

// @desc    Get Dashboard Statistics
// @route   GET /api/user/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        // 1. Fetch User Basics
        const user = await User.findOne({ userId }).select('rank createdAt fullName');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 2. Fetch Tree Stats (Network Size & Business Volume)
        const treeBase = await Tree.findOne({ userId });
        const networkSize = (treeBase?.totalLeftMembers || 0) + (treeBase?.totalRightMembers || 0);
        const leftPairs = treeBase?.leftPairs || 0;
        const rightPairs = treeBase?.rightPairs || 0;
        const matchingCompleted = treeBase?.matchingCompleted || 0;

        // 3. Aggregate Incomes
        const incomeStats = await Income.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: '$incomeType',
                    total: { $sum: '$netAmount' }
                }
            }
        ]);

        // Transform array to object
        let pmrIncome = 0, drrIncome = 0, fcrIncome = 0, totalIncome = 0;
        incomeStats.forEach(stat => {
            totalIncome += stat.total;
            if (stat._id === 'PMR') pmrIncome = stat.total;
            if (stat._id === 'DRR') drrIncome = stat.total;
            if (stat._id === 'FCR') fcrIncome = stat.total;
        });

        // 4. Aggregate Withdrawals
        const withdrawalStats = await Withdrawal.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        let pendingWithdrawals = 0;
        let totalWithdrawn = 0;

        withdrawalStats.forEach(stat => {
            if (stat._id === 'pending') pendingWithdrawals = stat.count;
            if (stat._id === 'approved' || stat._id === 'paid') totalWithdrawn += stat.totalAmount;
        });

        // 5. Calculate Progress to Next Rank (Mock Logic based on Pairs)
        // Silver -> Gold requirement (Example: 500 pairs)
        // This is a placeholder logic. You should replace with real business logic.
        const nextRankTarget = 500;
        const maxLeg = Math.max(leftPairs, rightPairs);
        // Using pairs/BV for progress
        const rankProgress = Math.min(100, Math.round((maxLeg / nextRankTarget) * 100));


        // Response matches Frontend State shape
        res.json({
            success: true,
            data: {
                memberSince: user.createdAt,
                networkSize,
                totalIncome,
                pmrIncome,
                drrIncome,
                fcrIncome,
                pendingWithdrawals,
                totalWithdrawn,
                leftPairs,
                rightPairs,
                matchingCompleted,
                currentRank: user.rank || 'Member',
                royaltyPercentage: 10, // Dynamic based on rank in future
                rankProgress: rankProgress // Frontend expects just % maybe?
            }
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Server error fetching dashboard stats' });
    }
};

module.exports = {
    getDashboardStats
};
