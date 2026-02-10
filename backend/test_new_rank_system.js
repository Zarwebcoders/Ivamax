const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Tree = require('./src/models/Tree');
const { calculateUserRank, RANK_STRUCTURE } = require('./src/controllers/rankController');

const testNewRankSystem = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to database\n');

        console.log('='.repeat(70));
        console.log('NEW RANK SYSTEM - 1:1 RATIO STRUCTURE');
        console.log('='.repeat(70));
        console.log('\nRank Requirements:');
        console.log('-'.repeat(70));

        for (let rank = 1; rank <= 11; rank++) {
            const req = RANK_STRUCTURE[rank];
            console.log(`Rank ${rank.toString().padStart(2)}: ${req.name.padEnd(20)} | Left: ${req.left.toString().padStart(4)} | Right: ${req.right.toString().padStart(4)} | Total: ${req.totalId.toString().padStart(4)} | Income: $${req.income}`);
        }

        console.log('\n' + '='.repeat(70));
        console.log('TESTING USER RANKS');
        console.log('='.repeat(70) + '\n');

        // Get all users
        const users = await User.find({});
        console.log(`Found ${users.length} users\n`);

        let updated = 0;
        let skipped = 0;

        for (const user of users) {
            try {
                // Calculate current rank based on new structure
                const rankData = await calculateUserRank(user.userId);

                // Update user rank in database
                await User.updateOne(
                    { userId },
                    {
                        currentRank: rankData.rank,
                        rank: rankData.rankName,
                    }
                );

                const status = rankData.rank > 0 ? '✅' : '⚪';
                console.log(`${status} ${user.userId}:`);
                console.log(`   Old Rank: ${user.rank}`);
                console.log(`   New Rank: ${rankData.rankName} (Rank ${rankData.rank})`);
                console.log(`   Left: ${rankData.leftCount} | Right: ${rankData.rightCount} | Total ID: ${rankData.totalId}`);
                console.log(`   Income: $${rankData.income}`);

                if (rankData.nextRank) {
                    const needed = {
                        left: Math.max(0, rankData.nextRank.left - rankData.leftCount),
                        right: Math.max(0, rankData.nextRank.right - rankData.rightCount),
                        total: Math.max(0, rankData.nextRank.totalId - rankData.totalId)
                    };
                    console.log(`   Next Rank: ${rankData.nextRank.name} (Need ${needed.left} more left, ${needed.right} more right, ${needed.total} more total)`);
                }
                console.log('');

                updated++;
            } catch (error) {
                console.log(`✗ ${user.userId}: Error - ${error.message}\n`);
                skipped++;
            }
        }

        console.log('='.repeat(70));
        console.log(`✅ Updated: ${updated} users`);
        console.log(`⚠️  Skipped: ${skipped} users`);
        console.log('='.repeat(70));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✓ Disconnected from database');
    }
};

testNewRankSystem();
