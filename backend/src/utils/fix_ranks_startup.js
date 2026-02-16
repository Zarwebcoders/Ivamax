const User = require('../models/User');

const fixRanksOnStartup = async () => {
    console.log('🔄 [SYSTEM] Checking for Rank Corrections...');
    try {
        // Find users with 'ASSOCIATE' in closing rank (case insensitive)
        const users = await User.find({ closingRank: { $regex: /ASSOCIATE/i } });

        if (users.length > 0) {
            console.log(`⚠️ Found ${users.length} users with 'ASSOCIATE' closing rank. Fixing...`);
            for (const user of users) {
                console.log(`   - Fixing User: ${user.email} (${user.userId})`);
                user.closingRank = 'No Rank';
                if (user.rank && user.rank.toUpperCase().includes('ASSOCIATE')) {
                    user.rank = 'No Rank';
                    user.currentRank = 0;
                }
                await user.save();
            }
            console.log('✅ Rank Correction Complete.');
        } else {
            console.log('✅ No Rank Corrections Needed.');
        }
    } catch (error) {
        console.error('❌ Rank Correction Failed:', error);
    }
};

module.exports = fixRanksOnStartup;
