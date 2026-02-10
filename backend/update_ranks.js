const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Tree = require('./src/models/Tree');
const { calculateUserRank, updateUserRank } = require('./src/controllers/rankController');

const updateAllUserRanks = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to database\n');

        // Get all users
        const users = await User.find({});
        console.log(`Found ${users.length} users\n`);

        let updated = 0;
        let skipped = 0;

        for (const user of users) {
            try {
                // Calculate current rank based on tree
                const rankData = await calculateUserRank(user.userId);

                // Update user rank in database
                await User.updateOne(
                    { userId: user.userId },
                    {
                        currentRank: rankData.rank,
                        rank: rankData.rankName,
                    }
                );

                console.log(`✓ ${user.userId}: ${user.rank} → ${rankData.rankName} (Rank ${rankData.rank}, Pairs: ${rankData.pairs})`);
                updated++;
            } catch (error) {
                console.log(`✗ ${user.userId}: Error - ${error.message}`);
                skipped++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log(`✅ Updated: ${updated} users`);
        console.log(`⚠️  Skipped: ${skipped} users`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✓ Disconnected from database');
    }
};

updateAllUserRanks();
