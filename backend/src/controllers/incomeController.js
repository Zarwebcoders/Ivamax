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
                totalId: 0,
                leftCount: 0,
                rightCount: 0,
                rankName: 'Member',
            };
        }

        return {
            amount: rankData.income,
            rank: rankData.rank,
            totalId: rankData.totalId,
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
        console.log(`\n🔍 DRR Calculation for ${userId}:`);

        // Find all direct referrals
        const directReferrals = await User.find({
            referralLink: { $regex: userId, $options: 'i' }
        });

        console.log(`   Found ${directReferrals.length} direct referrals`);

        let totalUSDT = 0;
        let totalToken = 0;
        const referralDetails = [];

        // Rank income mapping (from RANK_STRUCTURE)
        const RANK_INCOME = {
            0: 0, 1: 2.5, 2: 5, 3: 10, 4: 20, 5: 37.5,
            6: 75, 7: 150, 8: 312.5, 9: 625, 10: 1250, 11: 2500
        };

        // TESTING MODE: Use database rank instead of calculated rank
        const TESTING_MODE = true;

        for (const referral of directReferrals) {
            let referralRank, referralIncome;

            if (TESTING_MODE) {
                // Use database currentRank field directly
                referralRank = referral.currentRank || 0;
                referralIncome = RANK_INCOME[referralRank] || 0;
            } else {
                // Calculate rank from tree structure
                const referralRankData = await calculateUserRank(referral.userId);
                referralRank = referralRankData.rank;
                referralIncome = referralRankData.income;
            }

            console.log(`   - ${referral.userId}: currentRank=${referral.currentRank}, usedRank=${referralRank}, income=$${referralIncome}`);

            // Only calculate if referral has rank 5 or higher
            if (referralRank >= 5 && referralRank <= 11) {
                // 10% USDT for ranks 5-11
                const usdtAmount = referralIncome * 0.10;
                totalUSDT += usdtAmount;

                console.log(`     ✅ Qualifies for DRR! USDT: $${usdtAmount}`);

                // 20% Token for ranks 8-11
                if (referralRank >= 8) {
                    const tokenAmount = referralIncome * 0.20;
                    totalToken += tokenAmount;
                    console.log(`     ✅ Qualifies for Token! Amount: $${tokenAmount}`);
                }

                referralDetails.push({
                    userId: referral.userId,
                    rank: referralRank,
                    income: referralIncome,
                });
            } else {
                console.log(`     ❌ Does not qualify (rank < 5)`);
            }
        }

        console.log(`   DRR Total: USDT=$${totalUSDT}, Token=$${totalToken}, Combined=$${totalUSDT + totalToken}\n`);

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
        console.log(`\n🔍 FCR Calculation for ${userId}:`);

        // Get first two direct referrals (by registration date)
        const firstTwoReferrals = await User.find({
            referralLink: { $regex: userId, $options: 'i' }
        }).sort({ registrationDate: 1 }).limit(2);

        console.log(`   Found ${firstTwoReferrals.length} referrals (need 2)`);

        if (firstTwoReferrals.length < 2) {
            console.log(`   ❌ Not enough referrals for FCR\n`);
            return {
                amount: 0,
                qualified: false,
                founderMembers: [],
            };
        }

        let rank1, rank2;

        // TESTING MODE: Use database rank instead of calculated rank
        const TESTING_MODE = true;

        if (TESTING_MODE) {
            // Use database currentRank field directly
            rank1 = { rank: firstTwoReferrals[0].currentRank || 0 };
            rank2 = { rank: firstTwoReferrals[1].currentRank || 0 };
        } else {
            // Calculate rank from tree structure
            rank1 = await calculateUserRank(firstTwoReferrals[0].userId);
            rank2 = await calculateUserRank(firstTwoReferrals[1].userId);
        }

        console.log(`   - ${firstTwoReferrals[0].userId}: currentRank=${firstTwoReferrals[0].currentRank}, usedRank=${rank1.rank}`);
        console.log(`   - ${firstTwoReferrals[1].userId}: currentRank=${firstTwoReferrals[1].currentRank}, usedRank=${rank2.rank}`);

        const qualified = (rank1.rank === 11 && rank2.rank === 11);

        if (qualified) {
            console.log(`   ✅ Both are FOUNDER! FCR: $2500\n`);
        } else {
            console.log(`   ❌ Not both FOUNDER (need rank=11)\n`);
        }

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
        const user = await User.findOne({ userId });
        if (!user) return { message: 'User not found', userId };

        // Check 1-month waiting period (Income starts 1 month after investment/joining)
        if (user.investmentDate) {
            const oneMonthAfter = new Date(user.investmentDate);
            oneMonthAfter.setMonth(oneMonthAfter.getMonth() + 1);

            // End of the processing month
            // month is 1-12, Date month is 0-11. (year, month, 0) gives last day of 'month' (1-indexed)
            const processingMonthEnd = new Date(year, month, 0);

            if (oneMonthAfter > processingMonthEnd) {
                return { message: 'Waiting period (1 month) not completed', userId, skipped: true };
            }
        }

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
                    totalId: pmr.totalId,
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

        console.log(`Total users with packages: ${users.length}`);

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

// 4. Get Daily Matching History
const getMatchingHistory = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Fetch PMR (Pair Matching Royalty) incomes
        const incomes = await Income.find({
            userId,
            incomeType: 'PMR'
        }).sort({ createdAt: -1 }); // Changed 'date' to 'createdAt' as per Income model structure

        const history = incomes.map(income => ({
            date: income.createdAt.toISOString().split('T')[0], // Changed 'date' to 'createdAt'
            leftBV: income.leftCount || 0,
            rightBV: income.rightCount || 0,
            matched: Math.min(income.leftCount || 0, income.rightCount || 0), // Assuming matched is min of left/right used
            flush: 0, // Flush out data not currently stored in Income model
            income: income.netAmount
        }));

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Get Matching History Error:', error);
        res.status(500).json({ message: 'Server error fetching matching history' });
    }
};

// 5. Trigger Monthly Closing (Deferred Payout)
// Run this on the 1st of every month
const triggerMonthlyClosing = async (req, res) => {
    try {
        const closingDate = new Date(); // e.g., March 1st
        console.log(`\n🔒 Tiggering Monthly Closing for: ${closingDate.toISOString().split('T')[0]}`);

        // --- PART 1: PROCESS DUE PAYMENTS (The "3rd Month" Payout) ---
        // Find all pending incomes that are due now or in the past
        const dueIncomes = await Income.find({
            status: 'pending',
            paymentDueDate: { $lte: closingDate }
        });

        console.log(`   Found ${dueIncomes.length} pending incomes due for payment.`);

        let paidCount = 0;
        for (const income of dueIncomes) {
            try {
                // Credit to wallet
                await User.updateOne(
                    { userId: income.userId },
                    {
                        $inc: {
                            walletBalance: income.netAmount,
                            totalEarnings: income.netAmount
                        },
                        lastIncomeUpdate: new Date()
                    }
                );

                // Update Income Status
                income.status = 'paid';
                income.processedAt = new Date();
                await income.save();

                // Notification
                // (Optional: Add notification logic here if needed)

                paidCount++;
            } catch (err) {
                console.error(`   Failed to pay ${income._id}:`, err.message);
            }
        }
        console.log(`   ✅ Successfully paid ${paidCount} records.`);


        // --- PART 2: CALCULATE PREVIOUS MONTH INCOME (The "1st Month" Calculation) ---
        // If we run on March 1st, we calculate for February
        const previousMonthDate = new Date(closingDate);
        previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);

        const targetMonth = previousMonthDate.getMonth() + 1; // 1-12
        const targetYear = previousMonthDate.getFullYear();

        // Payment Due Date = Closing Date + 1 Month (e.g., April 1st)
        const paymentDueDate = new Date(closingDate);
        paymentDueDate.setMonth(paymentDueDate.getMonth() + 1);

        console.log(`   Calculating Income for: ${targetMonth}/${targetYear}`);
        console.log(`   Payment will be due on: ${paymentDueDate.toISOString().split('T')[0]}`);

        // Get active users
        const users = await User.find({ isActive: true, packageType: { $ne: null } });
        let calculatedCount = 0;

        for (const user of users) {
            // Check if already calculated for this month/year to avoid duplicates
            const existing = await Income.findOne({
                userId: user.userId,
                month: targetMonth,
                year: targetYear
            });

            if (existing) continue; // Skip if already exists

            // Calculate based on CURRENT Rank (as per user request: "last date pe rank check hoga")
            // We use the same calculation functions but save differently
            const pmr = await calculatePairMatchingRoyalty(user.userId, targetMonth, targetYear);
            const drr = await calculateDirectReferralRoyalty(user.userId, targetMonth, targetYear);
            const fcr = await calculateFounderClubRoyalty(user.userId, targetMonth, targetYear);

            const newIncomes = [];

            // Helper to create pending income object
            const createPendingIncome = (type, amount, meta) => ({
                userId: user.userId,
                incomeType: type,
                royaltyAmount: amount,
                netAmount: amount, // Deductions can be added here if needed
                rank: pmr.rankName, // Use current rank
                month: targetMonth,
                year: targetYear,
                status: 'pending', // DEFERRED
                paymentDueDate: paymentDueDate,
                closingDate: closingDate,
                metadata: meta,
                autoProcessed: true,
                triggeredBy: 'manual' // Triggered by closing API
            });

            if (pmr.amount > 0) newIncomes.push(createPendingIncome('PMR', pmr.amount, { totalId: pmr.totalId, left: pmr.leftCount, right: pmr.rightCount }));
            if (drr.totalAmount > 0) newIncomes.push(createPendingIncome('DRR', drr.totalAmount, { details: drr.referralDetails }));
            if (fcr.amount > 0) newIncomes.push(createPendingIncome('FCR', fcr.amount, { qualified: fcr.qualified }));

            if (newIncomes.length > 0) {
                await Income.insertMany(newIncomes);
                calculatedCount++;
            }
        }

        console.log(`   ✅ Calculated income for ${calculatedCount} users.`);

        res.json({
            success: true,
            message: 'Monthly closing completed successfully',
            paidCount,
            calculatedCount,
            targetMonth,
            targetYear,
            paymentDueDate
        });

    } catch (error) {
        console.error('Closing Error:', error);
        res.status(500).json({ message: 'Closing failed', error: error.message });
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
    getMatchingHistory,
    triggerMonthlyClosing
};
