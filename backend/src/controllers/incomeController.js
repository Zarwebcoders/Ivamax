const User = require('../models/User');
const Tree = require('../models/Tree');
const Income = require('../models/Income');
const { calculateUserRank, getRankIncome } = require('./rankController');

// 1. Calculate Pair Matching Royalty (PMR)
const calculatePairMatchingRoyalty = async (userId, month, year) => {
    try {
        const rankData = await calculateUserRank(userId);

        if (rankData.rank === 0) {
            return {
                amount: 0,
                rank: 0,
                pairs: 0,
                leftCount: 0,
                rightCount: 0,
                rankName: 'Member',
            };
        }

        return {
            amount: rankData.income,
            rank: rankData.rank,
            pairs: rankData.pairs,
            leftCount: rankData.leftCount,
            rightCount: rankData.rightCount,
            rankName: rankData.rankName,
        };
    } catch (error) {
        console.error('Error calculating PMR:', error);
        throw error;
    }
};

// 2. Calculate Direct Referral Royalty (DRR)
const calculateDirectReferralRoyalty = async (userId, month, year) => {
    try {
        // Find all direct referrals
        const directReferrals = await User.find({
            referralLink: { $regex: userId, $options: 'i' }
        });

        let totalUSDT = 0;
        let totalToken = 0;
        const referralDetails = [];

        for (const referral of directReferrals) {
            const referralRankData = await calculateUserRank(referral.userId);
            const referralRank = referralRankData.rank;
            const referralIncome = referralRankData.income;

            // Only calculate if referral has rank 5 or higher
            if (referralRank >= 5 && referralRank <= 11) {
                // 10% USDT for ranks 5-11
                const usdtAmount = referralIncome * 0.10;
                totalUSDT += usdtAmount;

                // 20% Token for ranks 8-11
                if (referralRank >= 8) {
                    const tokenAmount = referralIncome * 0.20;
                    totalToken += tokenAmount;
                }

                referralDetails.push({
                    userId: referral.userId,
                    rank: referralRank,
                    income: referralIncome,
                });
            }
        }

        return {
            amountUSDT: totalUSDT,
            amountToken: totalToken,
            totalAmount: totalUSDT + totalToken,
            referralDetails,
        };
    } catch (error) {
        console.error('Error calculating DRR:', error);
        throw error;
    }
};

// 3. Calculate Founder Club Royalty (FCR)
const calculateFounderClubRoyalty = async (userId, month, year) => {
    try {
        // Get first two direct referrals (by registration date)
        const firstTwoReferrals = await User.find({
            referralLink: { $regex: userId, $options: 'i' }
        }).sort({ registrationDate: 1 }).limit(2);

        if (firstTwoReferrals.length < 2) {
            return {
                amount: 0,
                qualified: false,
                founderMembers: [],
            };
        }

        // Check if both have Founder rank (rank 11)
        const rank1 = await calculateUserRank(firstTwoReferrals[0].userId);
        const rank2 = await calculateUserRank(firstTwoReferrals[1].userId);

        const qualified = (rank1.rank === 11 && rank2.rank === 11);

        return {
            amount: qualified ? 2500 : 0,
            qualified,
            founderMembers: qualified ? [
                firstTwoReferrals[0].userId,
                firstTwoReferrals[1].userId
            ] : [],
        };
    } catch (error) {
        console.error('Error calculating FCR:', error);
        throw error;
    }
};

// Process monthly income for a single user
const processUserMonthlyIncome = async (userId, month, year) => {
    try {
        // Check if already processed
        const existing = await Income.findOne({
            userId,
            month,
            year,
            status: { $in: ['processed', 'paid'] }
        });

        if (existing) {
            return { message: 'Already processed', userId };
        }

        // Calculate all three income types
        const pmr = await calculatePairMatchingRoyalty(userId, month, year);
        const drr = await calculateDirectReferralRoyalty(userId, month, year);
        const fcr = await calculateFounderClubRoyalty(userId, month, year);

        // Create income records
        const incomes = [];

        // 1. Pair Matching Royalty
        if (pmr.amount > 0) {
            incomes.push({
                userId,
                incomeType: 'PMR',
                royaltyAmount: pmr.amount,
                netAmount: pmr.amount,
                rank: pmr.rankName,
                month,
                year,
                status: 'processed',
                leftCount: pmr.leftCount,
                rightCount: pmr.rightCount,
                metadata: {
                    pairs: pmr.pairs,
                    leftCount: pmr.leftCount,
                    rightCount: pmr.rightCount,
                },
                processedAt: new Date(),
            });
        }

        // 2. Direct Referral Royalty
        if (drr.totalAmount > 0) {
            incomes.push({
                userId,
                incomeType: 'DRR',
                royaltyAmount: drr.amountUSDT,
                tokenAmount: drr.amountToken,
                netAmount: drr.totalAmount,
                month,
                year,
                status: 'processed',
                metadata: {
                    referralDetails: drr.referralDetails,
                },
                processedAt: new Date(),
            });
        }

        // 3. Founder Club Royalty
        if (fcr.amount > 0) {
            incomes.push({
                userId,
                incomeType: 'FCR',
                royaltyAmount: fcr.amount,
                netAmount: fcr.amount,
                month,
                year,
                status: 'processed',
                metadata: {
                    founderMembers: fcr.founderMembers,
                },
                processedAt: new Date(),
            });
        }

        // Save all income records
        if (incomes.length > 0) {
            await Income.insertMany(incomes);

            // Update user's monthly income and total earnings
            const totalMonthlyIncome = incomes.reduce((sum, inc) => sum + inc.netAmount, 0);
            await User.updateOne(
                { userId },
                {
                    $inc: {
                        totalEarnings: totalMonthlyIncome,
                        walletBalance: totalMonthlyIncome,
                    },
                    monthlyIncome: totalMonthlyIncome,
                }
            );
        }

        return {
            userId,
            totalIncome: incomes.reduce((sum, inc) => sum + inc.netAmount, 0),
            incomeCount: incomes.length,
            details: { pmr, drr, fcr },
        };
    } catch (error) {
        console.error(`Error processing income for ${userId}:`, error);
        throw error;
    }
};

// Process monthly income for all users
const processMonthlyIncome = async (req, res) => {
    try {
        const currentDate = new Date();
        const month = req.body.month || currentDate.getMonth() + 1;
        const year = req.body.year || currentDate.getFullYear();

        console.log(`Processing monthly income for ${month}/${year}...`);

        // Get all active users with packages
        const users = await User.find({
            isActive: true,
            packageType: { $ne: null },
        });

        const results = [];
        let successCount = 0;
        let errorCount = 0;

        for (const user of users) {
            try {
                const result = await processUserMonthlyIncome(user.userId, month, year);
                results.push(result);
                successCount++;
            } catch (error) {
                console.error(`Failed for ${user.userId}:`, error.message);
                errorCount++;
            }
        }

        res.json({
            success: true,
            message: `Processed ${successCount} users successfully, ${errorCount} errors`,
            month,
            year,
            totalUsers: users.length,
            successCount,
            errorCount,
            results,
        });
    } catch (error) {
        console.error('Error processing monthly income:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user's income history
const getUserIncomeHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { limit = 12 } = req.query;

        const incomes = await Income.find({ userId })
            .sort({ year: -1, month: -1, createdAt: -1 })
            .limit(parseInt(limit));

        // Group by month/year
        const grouped = {};
        incomes.forEach(income => {
            const key = `${income.year}-${income.month}`;
            if (!grouped[key]) {
                grouped[key] = {
                    month: income.month,
                    year: income.year,
                    incomes: [],
                    total: 0,
                };
            }
            grouped[key].incomes.push(income);
            grouped[key].total += income.netAmount;
        });

        res.json({
            success: true,
            data: Object.values(grouped),
            totalRecords: incomes.length,
        });
    } catch (error) {
        console.error('Error fetching income history:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get current month income breakdown
const getCurrentIncome = async (req, res) => {
    try {
        const userId = req.user.userId;
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        // Calculate current income (even if not processed yet)
        const pmr = await calculatePairMatchingRoyalty(userId, month, year);
        const drr = await calculateDirectReferralRoyalty(userId, month, year);
        const fcr = await calculateFounderClubRoyalty(userId, month, year);

        const totalIncome = pmr.amount + drr.totalAmount + fcr.amount;

        res.json({
            success: true,
            data: {
                month,
                year,
                pairMatchingRoyalty: pmr,
                directReferralRoyalty: drr,
                founderClubRoyalty: fcr,
                totalIncome,
            },
        });
    } catch (error) {
        console.error('Error fetching current income:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    calculatePairMatchingRoyalty,
    calculateDirectReferralRoyalty,
    calculateFounderClubRoyalty,
    processUserMonthlyIncome,
    processMonthlyIncome,
    getUserIncomeHistory,
    getCurrentIncome,
};
