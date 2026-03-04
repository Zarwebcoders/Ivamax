const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Income = require('./src/models/Income');
const User = require('./src/models/User');

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to DB');

        const userId = 'IVA1002';
        const user = await User.findOne({ userId });

        if (!user) {
            console.log('User IVA1002 not found');
            process.exit(0);
        }

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        // 1. Mock DFR Income
        await Income.create({
            userId,
            incomeType: 'DFR',
            royaltyAmount: 2.50,
            netAmount: 2.50,
            month,
            year,
            status: 'paid',
            autoProcessed: true,
            triggeredBy: 'daily_roi_scheduler',
            processedAt: now,
            description: `Daily Fix Return (0.125%) for ${now.toISOString().split('T')[0]} on capital $2000`
        });
        console.log('Created DFR Income');

        // 2. Mock DIR Income
        await Income.create({
            userId,
            incomeType: 'DIR',
            royaltyAmount: 50,
            netAmount: 50,
            month,
            year,
            status: 'paid',
            autoProcessed: true,
            triggeredBy: 'new_activation',
            processedAt: now,
            description: `Direct Referral Bonus from IVA9999 package activation ($1000)`
        });
        console.log('Created DIR Income');

        // 3. Mock Rank Upgrade
        await Income.create({
            userId,
            incomeType: 'RANK',
            royaltyAmount: 0,
            netAmount: 0,
            month,
            year,
            status: 'paid',
            description: `Rank Upgraded to JN. EXECUTIVE (Level 2)`,
            rank: 'JN. EXECUTIVE',
            autoProcessed: true,
            triggeredBy: 'rank_update',
            processedAt: now
        });
        console.log('Created RANK Income');

        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
