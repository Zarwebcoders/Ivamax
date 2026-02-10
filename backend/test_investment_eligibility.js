const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

const testInvestmentDateLogic = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to database\n');

        // Test data
        const testMonth = 2; // February 2026
        const testYear = 2026;
        const processingDate = new Date(testYear, testMonth - 1, 1);

        console.log('='.repeat(60));
        console.log(`Testing Income Eligibility for ${testMonth}/${testYear}`);
        console.log('='.repeat(60));
        console.log(`Processing Date: ${processingDate.toDateString()}\n`);

        // Get all users with packages
        const users = await User.find({
            isActive: true,
            packageType: { $ne: null },
        });

        console.log(`Total users with packages: ${users.length}\n`);

        // Test each user
        users.forEach(user => {
            if (!user.investmentDate) {
                console.log(`❌ ${user.userId}: No investment date`);
                return;
            }

            const investmentDate = new Date(user.investmentDate);
            const monthsDiff = (processingDate.getFullYear() - investmentDate.getFullYear()) * 12
                + (processingDate.getMonth() - investmentDate.getMonth());

            const eligible = monthsDiff >= 1;
            const status = eligible ? '✅' : '❌';

            console.log(`${status} ${user.userId}:`);
            console.log(`   Investment Date: ${investmentDate.toDateString()}`);
            console.log(`   Months Difference: ${monthsDiff}`);
            console.log(`   Eligible: ${eligible ? 'YES' : 'NO (needs to wait)'}\n`);
        });

        // Summary
        const eligibleUsers = users.filter(user => {
            if (!user.investmentDate) return false;
            const investmentDate = new Date(user.investmentDate);
            const monthsDiff = (processingDate.getFullYear() - investmentDate.getFullYear()) * 12
                + (processingDate.getMonth() - investmentDate.getMonth());
            return monthsDiff >= 1;
        });

        console.log('='.repeat(60));
        console.log(`📊 Summary:`);
        console.log(`   Total Users: ${users.length}`);
        console.log(`   Eligible Users: ${eligibleUsers.length}`);
        console.log(`   Not Eligible: ${users.length - eligibleUsers.length}`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✓ Disconnected from database');
    }
};

testInvestmentDateLogic();
