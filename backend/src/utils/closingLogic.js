const User = require('../models/User');

/**
 * Runs the monthly closing process.
 * Updates user.closingRank to match their current rank.
 */
const runMonthlyClosing = async () => {
    console.log('[CRON] Starting Monthly Closing Process...');
    try {
        const users = await User.find({});
        let count = 0;

        for (const user of users) {
            // Only update if they differ, or just force update to be sure
            if (user.rank !== user.closingRank) {
                user.closingRank = user.rank;
                await user.save();
                count++;
            }
        }

        console.log(`[CRON] Monthly Closing Completed. Updated ${count} users.`);
        return { success: true, updatedCount: count };
    } catch (error) {
        console.error('[CRON] Monthly Closing Failed:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { runMonthlyClosing };
