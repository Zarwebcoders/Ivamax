const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Tree = require('./src/models/Tree');

const checkChildren = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const childrenIds = ['IVA8461', 'IVA1106']; // From previous output

        for (const id of childrenIds) {
            console.log(`\n--- Checking Child: ${id} ---`);
            const user = await User.findOne({ userId: id });
            console.log(`User Document (${id}):`, user ? 'FOUND' : 'MISSING (CRITICAL)');

            const treeNode = await Tree.findOne({ userId: id });
            console.log(`Tree Node (${id}):`, treeNode ? 'FOUND' : 'MISSING');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkChildren();
