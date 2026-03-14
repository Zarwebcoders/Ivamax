const User = require('../models/User');
const Income = require('../models/Income');

/**
 * Process Daily ROI (Daily Fix Return - DFR)
 * Calculates 0.130% of investmentAmount for all active users ($0.325 for $250)
 */
const processDailyROI = async () => {
    try {
        console.log('[ROI-SERVICE] Starting Daily ROI (DFR) processing...');

        // Find all active users with an investment
        const activeUsers = await User.find({
            isActive: true,
            investmentAmount: { $gt: 0 }
        });

        if (activeUsers.length === 0) {
            console.log('[ROI-SERVICE] No active users with investments found.');
            return;
        }

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const dateStr = now.toISOString().split('T')[0];
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

        let processedCount = 0;
        let totalDistributed = 0;

        for (const user of activeUsers) {
            // 7-day delay after activation/investment
            const activationDate = user.investmentDate || user.createdAt;
            const timeDiff = Date.now() - new Date(activationDate).getTime();

            if (timeDiff < sevenDaysInMs) {
                console.log(`[ROI-SERVICE] Skipping User ${user.userId}: Within 7-day delay`);
                continue;
            }

            // Calculate ROI (0.130% of investment = $0.325 daily for $250 package)
            const roiAmount = user.investmentAmount * 0.00130;

            if (roiAmount <= 0) continue;

            // Check if already processed for today
            const existing = await Income.findOne({
                userId: user.userId,
                incomeType: 'DFR',
                description: { $regex: dateStr }
            });

            if (existing) {
                console.log(`[ROI-SERVICE] DFR already processed for user ${user.userId} on ${dateStr}`);
                continue;
            }

            // Create Income Record (as PAID - Credits Daily)
            await Income.create({
                userId: user.userId,
                incomeType: 'DFR',
                royaltyAmount: roiAmount,
                netAmount: roiAmount,
                month,
                year,
                status: 'paid', // Changed to paid as it's credited daily
                autoProcessed: true,
                triggeredBy: 'daily_roi_scheduler',
                processedAt: now,
                description: `Daily Fix Return ($0.325) for ${dateStr} on capital $${user.investmentAmount}`
            });

            // UPDATE WALLET: CREDIT DAILY INCOME ON DAILY BASIS IN PROFIT WALLET
            user.walletBalance += roiAmount;
            user.totalEarnings += roiAmount;
            user.lastIncomeUpdate = now;
            await user.save();

            processedCount++;
            totalDistributed += roiAmount;
        }

        console.log(`[ROI-SERVICE] DFR processing (Pending) complete. Processed ${processedCount} users, Total: $${totalDistributed.toFixed(4)}`);
        return { success: true, processedCount, totalDistributed };

    } catch (error) {
        console.error('[ROI-SERVICE] Error during DFR processing:', error);
        throw error;
    }
};

module.exports = {
    processDailyROI
};
