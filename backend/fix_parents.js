const mongoose = require('mongoose');
require('dotenv').config();
const Tree = require('./src/models/Tree');

const fixParents = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const allNodes = await Tree.find();
        console.log(`Found ${allNodes.length} nodes. Rebuilding parent links...`);

        let updates = 0;
        for (const node of allNodes) {
            // If node has left child, set left child's parent to node
            if (node.leftDirectId) {
                await Tree.updateOne(
                    { userId: node.leftDirectId },
                    { $set: { parentId: node.userId } }
                );
                updates++;
            }
            // If node has right child, set right child's parent to node
            if (node.rightDirectId) {
                await Tree.updateOne(
                    { userId: node.rightDirectId },
                    { $set: { parentId: node.userId } }
                );
                updates++;
            }
        }

        console.log(`Updated ${updates} parent links.`);

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

fixParents();
