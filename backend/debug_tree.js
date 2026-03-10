require('dotenv').config();
const mongoose = require('mongoose');
const Tree = require('./src/models/Tree');

async function debugTree() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const rootUserId = 'IVA3224';

        console.log('--- Tree Node for IVA3224 ---');
        const root = await Tree.findOne({ userId: rootUserId });
        console.log(JSON.stringify(root, null, 2));

        if (root) {
            console.log('\n--- Direct Children of IVA3224 ---');
            const left = await Tree.findOne({ userId: root.leftUserId });
            const right = await Tree.findOne({ userId: root.rightUserId });
            console.log('Left:', left ? left.userId : 'None');
            console.log('Right:', right ? right.userId : 'None');
        }

        // List all nodes in Tree collection
        const allNodes = await Tree.find({}).select('userId leftUserId rightUserId parentId position');
        console.log(`\nTotal nodes in Tree collection: ${allNodes.length}`);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

debugTree();
