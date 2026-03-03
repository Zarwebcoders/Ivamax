const User = require('../models/User');
const Deposit = require('../models/Deposit');
const { incrementUplineCounts } = require('../services/treeService');

/**
 * Activate a package for a user after a successful deposit
 * @param {string} depositId - The ID of the deposit record
 * @param {string} processedBy - Who processed it ('SYSTEM' or admin userId)
 */
const activatePackage = async (depositId, processedBy = 'SYSTEM') => {
    try {
        const deposit = await Deposit.findById(depositId);
        if (!deposit) throw new Error('Deposit not found');
        if (deposit.status !== 'pending') throw new Error('Deposit already processed');

        const user = await User.findOne({ userId: deposit.userId });
        if (!user) throw new Error('User not found');

        // 1. Update Deposit Status
        deposit.status = 'approved';
        deposit.processedBy = processedBy;
        deposit.processedDate = Date.now();
        await deposit.save();

        // 2. Update User Investment & Active Status
        user.investmentAmount += deposit.amount;
        user.investmentDate = Date.now();
        user.packageType = deposit.packageName;
        user.isActive = true; // Ensure user is active
        await user.save();

        // 3. Update Upline Counts (Now that user is Active)
        try {
            await incrementUplineCounts(user.userId);
            console.log(`[SYSTEM] Upline counts incremented for ${user.userId}`);
        } catch (err) {
            console.error('[SYSTEM] Failed to increment upline counts:', err);
        }

        // 4. Calculate DFR (Direct Fast Referral) Bonus for Sponsor
        // DFR = 5% of package amount
        if (user.referralId) {
            try {
                const sponsor = await User.findOne({ userId: user.referralId });
                if (sponsor) {
                    const dfrAmount = deposit.amount * 0.05;
                    const Income = require('../models/Income');

                    const now = new Date();
                    await Income.create({
                        userId: sponsor.userId,
                        incomeType: 'DIR',
                        royaltyAmount: dfrAmount,
                        netAmount: dfrAmount,
                        month: now.getMonth() + 1,
                        year: now.getFullYear(),
                        status: 'paid',
                        autoProcessed: true,
                        triggeredBy: 'new_activation',
                        processedAt: now,
                        description: `Direct Referral Bonus from ${user.userId} package activation ($${deposit.amount})`
                    });

                    // Credit Sponsor Wallet immediately
                    sponsor.walletBalance += dfrAmount;
                    sponsor.totalEarnings += dfrAmount;
                    await sponsor.save();

                    console.log(`[SYSTEM] Direct Referral Bonus of $${dfrAmount} credited to sponsor ${sponsor.userId}`);
                }
            } catch (dfrError) {
                console.error('[SYSTEM] Failed to calculate DFR bonus:', dfrError.message);
            }
        }

        return { success: true, message: 'Package activated successfully' };
    } catch (error) {
        console.error('[SYSTEM] Activation Failed:', error.message);
        throw error;
    }
};

module.exports = activatePackage;
