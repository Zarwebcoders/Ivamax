const User = require('../models/User');
const Income = require('../models/Income');
const Tree = require('../models/Tree');
const { calculateUserRank } = require('./rankController');
const {
    calculatePairMatchingRoyalty,
    calculateDirectReferralRoyalty,
    calculateFounderClubRoyalty
} = require('./incomeController');

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

        // 1. Update user's rank first
        const rankData = await calculateUserRank(userId);
        await User.updateOne(
            { userId },
            {
                rank: rankData.rank,
                rankName: rankData.rankName
            }
        );

        console.log(`   Rank updated: ${rankData.rankName} (${rankData.rank})`);

        // 2. Calculate all three income types
        const pmr = await calculatePairMatchingRoyalty(userId, month, year);
        const drr = await calculateDirectReferralRoyalty(userId, month, year);
        const fcr = await calculateFounderClubRoyalty(userId, month, year);

        // 3. Calculate total income
        const totalIncome = (pmr.amount || 0) + (drr.totalAmount || 0) + (fcr.amount || 0);

        console.log(`   PMR: $${pmr.amount || 0}`);
        console.log(`   DRR: $${drr.totalAmount || 0}`);
        console.log(`   FCR: $${fcr.amount || 0}`);
        console.log(`   Total: $${totalIncome}`);

        if (totalIncome > 0) {
            // 4. Check if income already credited this month
            const existingIncome = await Income.findOne({
                userId,
                month,
                year,
                autoProcessed: true
            });

            if (existingIncome) {
                // Update existing income record
                const incrementalIncome = totalIncome - existingIncome.totalAmount;

                if (incrementalIncome > 0) {
                    await Income.updateOne(
                        { _id: existingIncome._id },
                        {
                            $set: {
                                pmrAmount: pmr.amount || 0,
                                drrAmount: drr.totalAmount || 0,
                                fcrAmount: fcr.amount || 0,
                                totalAmount: totalIncome,
                                lastUpdated: new Date()
                            },
                            $inc: {
                                updateCount: 1
                            }
                        }
                    );

                    // Credit incremental income to wallet
                    await creditToWallet(userId, incrementalIncome);
                    console.log(`   ✅ Incremental income credited: $${incrementalIncome}`);
                }
            } else {
                // Create new income record
                await Income.create({
                    userId,
                    month,
                    year,
                    pmrAmount: pmr.amount || 0,
                    drrAmount: drr.totalAmount || 0,
                    fcrAmount: fcr.amount || 0,
                    totalAmount: totalIncome,
                    autoProcessed: true,
                    triggeredBy,
                    triggeredAt: new Date(),
                    status: 'credited',
                    metadata: {
                        pmr: {
                            rank: pmr.rank,
                            rankName: pmr.rankName,
                            leftCount: pmr.leftCount,
                            rightCount: pmr.rightCount,
                            totalId: pmr.totalId
                        },
                        drr: {
                            referralCount: drr.referralDetails?.length || 0,
                            amountUSDT: drr.amountUSDT || 0,
                            amountToken: drr.amountToken || 0
                        },
                        fcr: {
                            qualified: fcr.qualified || false,
                            founderMembers: fcr.founderMembers || []
                        }
                    }
                });

                // Credit to wallet
                await creditToWallet(userId, totalIncome);
                console.log(`   ✅ New income credited: $${totalIncome}`);
            }
        } else {
            console.log(`   ℹ️  No income to credit`);
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
