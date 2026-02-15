const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Tree = require('./src/models/Tree');

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const userId = 'IVA1002'; // The user from the screenshot

        console.log(`\n--- Checking User: ${userId} ---`);
        const user = await User.findOne({ userId });
        console.log('User Document:', user ? 'FOUND' : 'NOT FOUND');
        if (user) console.log(JSON.stringify(user.toObject(), null, 2));

        console.log(`\n--- Checking Tree Node: ${userId} ---`);
        const treeNode = await Tree.findOne({ userId });
        console.log('Tree Node:', treeNode ? 'FOUND' : 'NOT FOUND');
        if (treeNode) console.log(JSON.stringify(treeNode.toObject(), null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkUser();
