const User = require('../models/User');
const Tree = require('../models/Tree');
const { getValidityDeadline } = require('../utils/userValidity');
const { decrementUplineCounts } = require('../services/treeService');
const { processDailyROI } = require('../services/roiService');

const initScheduler = () => {
    console.log('[SCHEDULER] Service initialized.');

    // Run cleanup every hour
    const CLEANUP_INTERVAL = 60 * 60 * 1000;
    setInterval(async () => {
        console.log('[SCHEDULER] Running cleanup job via setInterval...');
        await cleanupInvalidUsers();
    }, CLEANUP_INTERVAL);

    // Run Daily ROI (DFR) every 24 hours (86,400,000 ms)
    const ROI_INTERVAL = 24 * 60 * 60 * 1000;
    setInterval(async () => {
        console.log('[SCHEDULER] Running Daily ROI processing via setInterval...');
        await processDailyROI();
    }, ROI_INTERVAL);

    // Run once immediately on startup to catch up if Vercel was sleeping
    console.log('[SCHEDULER] Running immediate sync jobs on startup...');
    (async () => {
        try {
            await cleanupInvalidUsers();
            await processDailyROI();
        } catch (err) {
            console.error('[SCHEDULER] Startup jobs failed:', err);
        }
    })();
};

const cleanupInvalidUsers = async () => {
    try {
        const now = new Date();

        // Find users who are NOT Active
        // AND whose Deadline has passed
        // We can find them by iterating or complex query.
        // Let's iterate for safety first, or use the logic:
        // Deadline = CreatedAt + 1 Day (Midnight)
        // If Now > Deadline, then they are invalid.
        // So we look for users where: isActive == false AND ...
        // We can't query "Deadline" directly effortlessly.
        // But we can check: If Now is Wed 12:00 PM.
        // Users created on Mon are definitely invalid (Deadline was Tue Midnight).
        // Users created on Tue... Deadline is Wed Midnight (Active).
        // So we find users created BEFORE (Today - 2 Days) roughly to be safe?
        // Let's fetch all inactive users and check them individually with the helper for precision.
        // If dataset is huge, this is slow. But for IVAMAX context it's likely okay.

        // Optimization: Find users created before Yesterday Midnight.
        // If today is Friday.
        // Users created Wednesday: Deadline = Thursday Midnight. (Expired)
        // Users created Thursday: Deadline = Friday Midnight. (Valid)
        // So query: `createdAt < StartOfToday` (approx) or `createdAt < StartOfYesterday`?
        // Let's use a batch fetch of Inactive users.

        const inactiveUsers = await User.find({ isActive: false }).select('userId createdAt isActive');

        let deletedCount = 0;

        for (const user of inactiveUsers) {
            // Calculate Deadline
            const verboseDeadline = getValidityDeadline(user.createdAt);

            if (now > verboseDeadline) {
                // EXPIRED! DELETE!
                console.log(`[CLEANUP] Deleting expired user: ${user.userId} (Created: ${user.createdAt.toISOString()}, Deadline: ${verboseDeadline.toISOString()})`);

                await deleteUserByType(user.userId);
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            console.log(`[SCHEDULER] Cleanup complete. Deleted ${deletedCount} users.`);
        } else {
            console.log(`[SCHEDULER] Cleanup complete. No expired users found.`);
        }
    } catch (error) {
        console.error('[SCHEDULER] Error during cleanup:', error);
    }
};

const deleteUserByType = async (userId) => {
    try {
        // 1. Get Tree Node
        const treeNode = await Tree.findOne({ userId });

        if (treeNode) {
            // 1.5 Decrement Upline Counts (Only if they were counted - i.e., Active)
            // But scheduler only deletes Inactive users. 
            // Since we changed logic to NOT count inactive users, we don't need to decrement.
            // However, to be safe/robust (e.g. if an Active user is manually deleted via this function in future), 
            // we should check. But for now, scheduler users are Inactive -> Count was 0 -> No decrement needed.
            // WAIT! User requested: "Jab user delete ho, to upar walon ka count bhi kam ho jaye".
            // Since they are Inactive, they are ALREADY 0. Decrementing 0 makes it -1.
            // So we MUST NOT decrement for Inactive users who never activated.

            // To be totally safe, let's check if the user was considered "Active" / "Counted".
            // Implementation: We can check if they have a packageType or isActive.
            // But we know from caller `cleanupInvalidUsers` that `isActive` is false.
            // So we SKIP decrement here.

            // NOTE: If we ever use this function to delete an ACTIVE user, we MUST decrement.
            // I will add a check:
            const user = await User.findOne({ userId });
            if (user && user.isActive) {
                await decrementUplineCounts(userId);
            }

            // 2. Remove from Parent
            if (treeNode.parentId) {
                const parentNode = await Tree.findOne({ userId: treeNode.parentId });
                if (parentNode) {
                    if (parentNode.leftDirectId === userId) {
                        parentNode.leftDirectId = null;
                        await parentNode.save();
                    } else if (parentNode.rightDirectId === userId) {
                        parentNode.rightDirectId = null;
                        await parentNode.save();
                    }
                }
            }

            // 3. Delete Tree Node
            await Tree.deleteOne({ userId });
        }

        // 4. Delete User Data
        await User.deleteOne({ userId });

        // 5. Delete other related data? (Wallet, Income, etc.)
        // Assuming strict clean:
        const Wallet = require('../models/Wallet');
        const Income = require('../models/Income');
        const Withdrawal = require('../models/Withdrawal');

        await Wallet.deleteMany({ userId });
        await Income.deleteMany({ userId });
        await Withdrawal.deleteMany({ userId });

        console.log(`[CLEANUP] Successfully wiped data for ${userId}`);
    } catch (err) {
        console.error(`[CLEANUP] Failed to delete ${userId}:`, err);
    }
};

module.exports = { initScheduler, cleanupInvalidUsers };
