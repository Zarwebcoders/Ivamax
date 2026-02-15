const User = require('../models/User');
const Deposit = require('../models/Deposit');

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

        // 3. Auto-process first income for current month (PMR) - REMOVED per requirement
        // "Income 1 month bad milegi" - Income should start after 1 month
        /*
        try {
            const { processUserMonthlyIncome } = require('../controllers/incomeController');
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();

            await processUserMonthlyIncome(deposit.userId, currentMonth, currentYear);
            console.log(`[SYSTEM] Auto-processed first income for ${deposit.userId}`);
        } catch (incomeError) {
            console.error('[SYSTEM] Error auto-processing income:', incomeError.message);
        }
        */

        return { success: true, message: 'Package activated successfully' };
    } catch (error) {
        console.error('[SYSTEM] Activation Failed:', error.message);
        throw error;
    }
};

module.exports = activatePackage;
