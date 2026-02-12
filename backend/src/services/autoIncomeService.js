const User = require('../models/User');
const Income = require('../models/Income');
const Tree = require('../models/Tree');
const { calculateUserRank } = require('../controllers/rankController');
const {
    calculatePairMatchingRoyalty,
    calculateDirectReferralRoyalty,
    calculateFounderClubRoyalty
} = require('../controllers/incomeController');

/**
 * Auto-calculate and credit income to user
 * Triggered when: New referral, Tree update, Rank change
 */
const autoCalculateAndCreditIncome = async (userId, triggeredBy = 'auto') => {
    try {
        console.log(`🔄 Auto-calculating income for ${userId} (triggered by: ${triggeredBy})`);

        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        // Get current user data
        const currentUser = await User.findOne({ userId });
        const oldRank = currentUser?.currentRank || 0; // Number field
        const oldRankName = currentUser?.rank || 'Member'; // String field

        /* 
           TESTING MODE: Skip rank recalculation, use DB rank as-is
           This allows manual rank setting in DB for testing
        */
        const TESTING_MODE = true;

        let rankData;
        if (TESTING_MODE) {
            // Use existing rank from database (no recalculation)
            rankData = {
                rank: currentUser?.currentRank || 0,      // Number: 0-11
                rankName: currentUser?.rank || 'Member'   // String: "FOUNDER", "ASSOCIATE", etc.
            };
            console.log(`   Using DB Rank: ${rankData.rankName} (${rankData.rank}) [TESTING MODE]`);
        } else {
            // 1. Update user's rank (Production Mode)
            rankData = await calculateUserRank(userId);
            await User.updateOne(
                { userId },
                {
                    rank: rankData.rank,
                    rankName: rankData.rankName
                }
            );
            console.log(`   Rank updated: ${rankData.rankName} (${rankData.rank})`);
        }

        // Check if rank increased
        const rankIncreased = rankData.rank > oldRank;

        /* 
           DEFERRED INCOME IMPLEMENTATION:
           By default, Real-time income calculation is DISABLED (Deferred).
           Income is calculated via 'Monthly Closing'.
           
           *** TESTING MODE ***
           TESTING_MODE is already set above (skip rank recalculation + immediate income credit)
        */

        // Initialize variables with defaults for Deferred Mode
        let pmr = { amount: 0, rankName: 'Member', rank: 0 };
        let drr = { totalAmount: 0, amountUSDT: 0, amountToken: 0 };
        let fcr = { amount: 0, qualified: false };
        let totalIncome = 0;

        if (TESTING_MODE) {
            // 2. Calculate all three income types (Enabled for Testing)
            pmr = await calculatePairMatchingRoyalty(userId, month, year);
            drr = await calculateDirectReferralRoyalty(userId, month, year);
            fcr = await calculateFounderClubRoyalty(userId, month, year);

            // 3. Calculate total income
            totalIncome = (pmr.amount || 0) + (drr.totalAmount || 0) + (fcr.amount || 0);

            console.log(`   PMR: $${pmr.amount || 0}`);
            console.log(`   DRR: $${drr.totalAmount || 0}`);
            console.log(`   FCR: $${fcr.amount || 0}`);
            console.log(`   Total: $${totalIncome}`);

            if (totalIncome > 0) {
                let incrementalWalletCredit = 0;

                // Helper function to process income type
                const processIncomeType = async (type, amount, extraFields = {}) => {
                    if (amount <= 0) return;

                    const query = {
                        userId,
                        month,
                        year,
                        incomeType: type,
                        autoProcessed: true
                    };

                    const existing = await Income.findOne(query);

                    if (existing) {
                        const diff = amount - existing.netAmount;
                        if (diff > 0.01) { // Use small threshold for float comparison
                            await Income.updateOne(
                                { _id: existing._id },
                                {
                                    $set: {
                                        netAmount: amount,
                                        royaltyAmount: amount,
                                        lastUpdated: new Date(),
                                        ...extraFields
                                    },
                                    $inc: { updateCount: 1 }
                                }
                            );
                            incrementalWalletCredit += diff;
                            console.log(`   Detailed ${type}: Updated amount from ${existing.netAmount} to ${amount}. Credit: ${diff}`);
                        }
                    } else {
                        // Create new record
                        await Income.create({
                            userId,
                            incomeType: type,
                            month,
                            year,
                            royaltyAmount: amount,
                            netAmount: amount,
                            rank: pmr.rankName || 'Member',
                            autoProcessed: true,
                            status: 'paid', // Mark as paid immediately for testing/deferred
                            triggeredBy: triggeredBy === 'manual_test' ? 'manual' : triggeredBy,
                            triggeredAt: new Date(),
                            ...extraFields
                        });
                        incrementalWalletCredit += amount;
                        console.log(`   Detailed ${type}: New record created. Credit: ${amount}`);
                    }
                };

                // Process PMR
                await processIncomeType('PMR', pmr.amount || 0, {
                    leftCount: pmr.leftCount || 0,
                    rightCount: pmr.rightCount || 0,
                    metadata: {
                        pairs: pmr.totalId || 0,
                        leftCount: pmr.leftCount || 0,
                        rightCount: pmr.rightCount || 0
                    }
                });

                // Process DRR
                await processIncomeType('DRR', drr.totalAmount || 0, {
                    tokenAmount: drr.amountToken || 0,
                    metadata: {
                        referralDetails: drr.referralDetails || []
                    }
                });

                // Process FCR
                await processIncomeType('FCR', fcr.amount || 0, {
                    metadata: {
                        founderMembers: fcr.founderMembers || []
                    }
                });

                // Wallet Credit & Notification
                if (incrementalWalletCredit > 0) {
                    await creditToWallet(userId, incrementalWalletCredit);
                    console.log(`   ✅ Incremental income credited: $${incrementalWalletCredit}`);

                    try {
                        const { createNotification } = require('../controllers/notificationController');
                        await createNotification({
                            userId,
                            type: 'PAYMENT_GENERATED',
                            title: 'Income Credited!',
                            message: `$${incrementalWalletCredit.toFixed(2)} has been credited to your wallet.`,
                            link: '/income'
                        });
                    } catch (err) {
                        console.error('Failed to create payment notification:', err);
                    }
                } else {
                    console.log(`   ℹ️  No new incremental income to credit.`);
                }
            } else {
                console.log(`   ℹ️  No income to credit (Testing Mode)`);
            }
        }

        // Notify about rank achievement
        if (rankIncreased) {
            try {
                const { createNotification } = require('../controllers/notificationController');
                await createNotification({
                    userId,
                    type: 'RANK_ACHIEVED',
                    title: 'Rank Upgraded!',
                    message: `Congratulations! You achieved ${rankData.rankName} rank (Level ${rankData.rank}).`,
                    link: '/profile'
                });
                console.log(`   🏆 Rank achievement notification sent`);
            } catch (err) {
                console.error('Failed to create rank notification:', err);
            }
        }

        return {
            success: true,
            userId,
            totalIncome,
            breakdown: {
                pmr: pmr.amount || 0,
                drr: drr.totalAmount || 0,
                fcr: fcr.amount || 0
            },
            rank: rankData.rankName
        };

    } catch (error) {
        console.error(`❌ Error auto-calculating income for ${userId}:`, error);
        throw error;
    }
};

/**
 * Credit income to user's wallet
 */
const creditToWallet = async (userId, amount) => {
    try {
        await User.updateOne(
            { userId },
            {
                $inc: {
                    walletBalance: amount,
                    totalEarnings: amount
                },
                lastIncomeUpdate: new Date()
            }
        );

        console.log(`   💰 Wallet credited: $${amount} for ${userId}`);
        return true;
    } catch (error) {
        console.error(`Error crediting wallet for ${userId}:`, error);
        throw error;
    }
};

/**
 * Auto-calculate income for upline (all parents in tree)
 * Called when new member joins or tree updates
 */
const autoCalculateIncomeForUpline = async (userId) => {
    try {
        console.log(`\n🌳 Auto-calculating income for upline of ${userId}`);

        const treeNode = await Tree.findOne({ userId });
        if (!treeNode || !treeNode.parentId) {
            console.log(`   No parent found for ${userId}`);
            return;
        }

        // Get all upline members
        const uplineMembers = [];
        let currentParentId = treeNode.parentId;

        while (currentParentId) {
            uplineMembers.push(currentParentId);
            const parentNode = await Tree.findOne({ userId: currentParentId });
            currentParentId = parentNode?.parentId;

            // Limit to 10 levels to prevent infinite loops
            if (uplineMembers.length >= 10) break;
        }

        console.log(`   Found ${uplineMembers.length} upline members`);

        // Calculate income for each upline member
        for (const uplineUserId of uplineMembers) {
            try {
                await autoCalculateAndCreditIncome(uplineUserId, 'tree_update');
            } catch (error) {
                console.error(`   Error for upline ${uplineUserId}:`, error.message);
            }
        }

        console.log(`   ✅ Upline income calculation completed\n`);
    } catch (error) {
        console.error('Error calculating upline income:', error);
    }
};

/**
 * Auto-calculate income for direct referrer
 * Called immediately after new user registration
 */
const autoCalculateIncomeForReferrer = async (referrerId) => {
    try {
        if (!referrerId) return;

        console.log(`\n👥 Auto-calculating income for referrer: ${referrerId}`);
        await autoCalculateAndCreditIncome(referrerId, 'new_referral');
        console.log(`   ✅ Referrer income calculation completed\n`);
    } catch (error) {
        console.error('Error calculating referrer income:', error);
    }
};

module.exports = {
    autoCalculateAndCreditIncome,
    autoCalculateIncomeForUpline,
    autoCalculateIncomeForReferrer,
    creditToWallet
};
