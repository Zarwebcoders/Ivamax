const User = require('../models/User');
const Income = require('../models/Income');

/**
 * Process Daily ROI (Daily Fix Return - DFR)
 * Calculates 0.125% of investmentAmount for all active users
 */
const processDailyROI = async () => {
    try {
        console.log('[ROI-SERVICE] Starting Daily ROI processing...');

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

        let processedCount = 0;
        let totalDistributed = 0;

        for (const user of activeUsers) {
            // Calculate ROI (0.125% of investment)
            const roiAmount = user.investmentAmount * 0.00125;

            if (roiAmount <= 0) continue;

            // Check if already processed for today (to avoid duplicates if scheduler runs twice)
            const existing = await Income.findOne({
                userId: user.userId,
                incomeType: 'DFR',
                description: { $regex: dateStr }
            });

            if (existing) {
                console.log(`[ROI-SERVICE] ROI already processed for user ${user.userId} on ${dateStr}`);
                continue;
            }

            // Create Income Record
            await Income.create({
                userId: user.userId,
                incomeType: 'DFR',
                royaltyAmount: roiAmount,
                netAmount: roiAmount,
                month,
                year,
                status: 'paid',
                autoProcessed: true,
                triggeredBy: 'daily_roi_scheduler',
                processedAt: now,
                description: `Daily Fix Return (0.125%) for ${dateStr} on capital $${user.investmentAmount}`
            });

            // Credit User Wallet
            user.walletBalance += roiAmount;
            user.totalEarnings += roiAmount;
            await user.save();

            processedCount++;
            totalDistributed += roiAmount;
        }

        console.log(`[ROI-SERVICE] ROI distribution complete. Processed ${processedCount} users, Total: $${totalDistributed.toFixed(4)}`);
        return { success: true, processedCount, totalDistributed };

    } catch (error) {
        console.error('[ROI-SERVICE] Error during ROI processing:', error);
        throw error;
    }
};

module.exports = {
    processDailyROI
};
