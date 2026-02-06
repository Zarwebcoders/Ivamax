require('dotenv').config();
const mongoose = require('mongoose');
const Tree = require('./src/models/Tree');
const User = require('./src/models/User'); // Import User model to check investments
const connectDB = require('./src/config/database');

const checkPairs = async () => {
    try {
        await connectDB();
        console.log("Connected to DB...");

        const rootNode = await Tree.findOne({ userId: 'IVA100001' });
        if (rootNode) {
            console.log('Root Node (IVA100001):');
            console.log(`- Total Members: Left=${rootNode.totalLeftMembers}, Right=${rootNode.totalRightMembers}`);
            console.log(`- Pairs (DB): Left=${rootNode.leftPairs}, Right=${rootNode.rightPairs}`);
        } else {
            console.log('Root node not found.');
        }

        // Check if downlines have investments
        const users = await User.find({}).select('userId investmentAmount packageType');
        console.log('\nUser Investments:');
        users.forEach(u => {
            if (u.investmentAmount > 0) {
                console.log(`- ${u.userId}: $${u.investmentAmount} (${u.packageType})`);
            }
        });

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkPairs();
