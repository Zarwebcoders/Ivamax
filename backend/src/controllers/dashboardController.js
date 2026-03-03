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
        const user = await User.findOne({ userId }).select('rank closingRank createdAt fullName');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 2. Fetch Tree Stats (Network Size & Business Volume)
        const treeBase = await Tree.findOne({ userId });
        const networkSize = (treeBase?.totalLeftMembers || 0) + (treeBase?.totalRightMembers || 0);
        const leftPairs = treeBase?.leftPairs || 0;
        const rightPairs = treeBase?.rightPairs || 0;
        const matchingCompleted = treeBase?.matchingCompleted || 0;

        // 3. Aggregate Incomes (Current Month)
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        // Get last month
        const lastMonthDate = new Date(currentYear, currentMonth - 2, 1); // -2 because month is 1-indexed
        const lastMonth = lastMonthDate.getMonth() + 1;
        const lastYear = lastMonthDate.getFullYear();

        // Current month income
        const currentMonthIncome = await Income.aggregate([
            {
                $match: {
                    userId,
                    month: currentMonth,
                    year: currentYear
                }
            },
            {
                $group: {
                    _id: '$incomeType',
                    total: { $sum: '$netAmount' }
                }
            }
        ]);

        // Last month income
        const lastMonthIncome = await Income.aggregate([
            {
                $match: {
                    userId,
                    month: lastMonth,
                    year: lastYear
                }
            },
            {
                $group: {
                    _id: '$incomeType',
                    total: { $sum: '$netAmount' }
                }
            }
        ]);

        // Transform current month income
        let currentPMR = 0, currentDRR = 0, currentFCR = 0, currentDFR = 0, currentDIR = 0, currentTotal = 0;
        currentMonthIncome.forEach(stat => {
            currentTotal += stat.total;
            if (stat._id === 'PMR') currentPMR = stat.total;
            if (stat._id === 'DRR') currentDRR = stat.total;
            if (stat._id === 'FCR') currentFCR = stat.total;
            if (stat._id === 'DFR') currentDFR = stat.total;
            if (stat._id === 'DIR') currentDIR = stat.total;
        });

        // Transform last month income
        let lastPMR = 0, lastDRR = 0, lastFCR = 0, lastDFR = 0, lastDIR = 0, lastTotal = 0;
        lastMonthIncome.forEach(stat => {
            lastTotal += stat.total;
            if (stat._id === 'PMR') lastPMR = stat.total;
            if (stat._id === 'DRR') lastDRR = stat.total;
            if (stat._id === 'FCR') lastFCR = stat.total;
            if (stat._id === 'DFR') lastDFR = stat.total;
            if (stat._id === 'DIR') lastDIR = stat.total;
        });

        // Calculate percentage changes
        const calculatePercentageChange = (current, last) => {
            if (last === 0) {
                return current > 0 ? 100 : 0; // If no last month income, show 100% if current exists
            }
            return ((current - last) / last) * 100;
        };

        const totalIncomeChange = calculatePercentageChange(currentTotal, lastTotal);
        const pmrIncomeChange = calculatePercentageChange(currentPMR, lastPMR);
        const drrIncomeChange = calculatePercentageChange(currentDRR, lastDRR);
        const fcrIncomeChange = calculatePercentageChange(currentFCR, lastFCR);
        const dfrIncomeChange = calculatePercentageChange(currentDFR, lastDFR);
        const dirIncomeChange = calculatePercentageChange(currentDIR, lastDIR);

        // All-time income totals
        const allTimeIncome = await Income.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: '$incomeType',
                    total: { $sum: '$netAmount' }
                }
            }
        ]);

        console.log(`📊 Dashboard Stats for ${userId}:`);
        console.log('   All-Time Income Aggregation:', JSON.stringify(allTimeIncome, null, 2));

        let pmrIncome = 0, drrIncome = 0, fcrIncome = 0, dfrIncome = 0, dirIncome = 0, totalIncome = 0;
        allTimeIncome.forEach(stat => {
            totalIncome += stat.total;
            if (stat._id === 'PMR') pmrIncome = stat.total;
            if (stat._id === 'DRR') drrIncome = stat.total;
            if (stat._id === 'FCR') fcrIncome = stat.total;
            if (stat._id === 'DFR') dfrIncome = stat.total;
            if (stat._id === 'DIR') dirIncome = stat.total;
        });

        console.log(`   Calculated: Total=${totalIncome}, PMR=${pmrIncome}, DRR=${drrIncome}, FCR=${fcrIncome}`);

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

        // 5. Calculate Rank Progress with Next Rank
        const { calculateUserRank } = require('../controllers/rankController');
        const rankData = await calculateUserRank(userId);

        let nextRankName = 'FOUNDER'; // Default if already at max rank
        let rankProgress = 100; // Default if already at max rank

        if (rankData.nextRank) {
            nextRankName = rankData.nextRank.name;

            // Calculate progress based on the limiting factor (left or right)
            const leftProgress = (rankData.leftCount / rankData.nextRank.left) * 100;
            const rightProgress = (rankData.rightCount / rankData.nextRank.right) * 100;

            // Progress is limited by the weaker leg (1:1 ratio requirement)
            rankProgress = Math.min(leftProgress, rightProgress, 100);
        }


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
                dfrIncome,
                dirIncome,
                // Current month incomes
                currentMonthIncome: currentTotal,
                currentPMR,
                currentDRR,
                currentFCR,
                currentDFR,
                currentDIR,
                // Percentage changes
                totalIncomeChange: parseFloat(totalIncomeChange.toFixed(1)),
                pmrIncomeChange: parseFloat(pmrIncomeChange.toFixed(1)),
                drrIncomeChange: parseFloat(drrIncomeChange.toFixed(1)),
                fcrIncomeChange: parseFloat(fcrIncomeChange.toFixed(1)),
                dfrIncomeChange: parseFloat(dfrIncomeChange.toFixed(1)),
                dirIncomeChange: parseFloat(dirIncomeChange.toFixed(1)),
                pendingWithdrawals,
                totalWithdrawn,
                leftPairs: rankData.leftCount,
                rightPairs: rankData.rightCount,
                matchingCompleted,
                currentRank: rankData.rankName || 'No Rank',
                closingRank: user.closingRank || 'No Rank',
                royaltyPercentage: rankData.income || 0, // Dynamic based on actual rank
                nextRankName: nextRankName,
                rankProgress: Math.round(rankProgress), // Rounded percentage
                // Referral Link Constraints
                isLeftDirectFilled: !!treeBase?.leftDirectId,
                isRightDirectFilled: !!treeBase?.rightDirectId,
                isActive: user.isActive ?? true // Default to true if not specified
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
