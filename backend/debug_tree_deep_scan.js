const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Tree = require('./src/models/Tree');

const traverseTree = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const rootId = 'IVA1002';
        const visited = new Set();
        const queue = [rootId];
        let missingUsers = 0;
        let checkedNodes = 0;

        while (queue.length > 0) {
            const currentId = queue.shift();
            if (visited.has(currentId)) continue;
            visited.add(currentId);
            checkedNodes++;

            const treeNode = await Tree.findOne({ userId: currentId });
            if (!treeNode) {
                console.log(`[WARNING] Tree node missing for ${currentId}`);
                continue;
            }

            const user = await User.findOne({ userId: currentId });
            if (!user) {
                console.log(`[CRITICAL] User missing for tree node: ${currentId}`);
                missingUsers++;
            }

            if (treeNode.leftDirectId) queue.push(treeNode.leftDirectId);
            if (treeNode.rightDirectId) queue.push(treeNode.rightDirectId);

            if (checkedNodes % 50 === 0) console.log(`Checked ${checkedNodes} nodes...`);
        }

        console.log(`\nScan complete.`);
        console.log(`Total nodes checked: ${checkedNodes}`);
        console.log(`Missing users found: ${missingUsers}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

traverseTree();
