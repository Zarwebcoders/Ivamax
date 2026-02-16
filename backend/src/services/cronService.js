const cron = require('node-cron');
const { triggerMonthlyClosing } = require('../controllers/incomeController');

// Helper to check if today is the last day of the month
const isLastDayOfMonth = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.getDate() === 1;
};

// Initialize Cron Jobs
const initCronJobs = () => {
    console.log('⏰ Initializing Cron Jobs...');

    // Run every day at 23:55 (11:55 PM)
    cron.schedule('55 23 * * *', async () => {
        console.log('⏰ Running Daily Cron Job at 23:55...');

        if (isLastDayOfMonth()) {
            console.log('📅 Today is the LAST DAY of the month. Triggering Monthly Closing...');
            try {
                // Mock request and response objects since controller expects them
                const req = {};
                const res = {
                    json: (data) => console.log('✅ Auto-Closing Result:', data),
                    status: (code) => ({
                        json: (err) => console.error(`❌ Auto-Closing Failed (Status ${code}):`, err)
                    })
                };

                // 1. Run Rank Closing (Update Closing Rank)
                const { runMonthlyClosing } = require('../utils/closingLogic');
                await runMonthlyClosing();

                // 2. Run Income Closing
                await triggerMonthlyClosing(req, res);
            } catch (error) {
                console.error('❌ Error in Auto-Closing Cron:', error);
            }
        } else {
            console.log('ℹ️ Today is NOT the last day of the month. Skipping closing.');
        }
    });

    console.log('✅ Cron Jobs Scheduled: Daily Check for Month-End at 23:55');
};

module.exports = initCronJobs;
