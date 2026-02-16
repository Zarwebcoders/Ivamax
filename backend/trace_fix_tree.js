const mongoose = require('mongoose');
const Tree = require('./src/models/Tree');
require('dotenv').config();

const traceLeftLeg = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');

        const startId = 'IVA2609';
        let current = await Tree.findOne({ userId: startId });

        while (current) {
            // console.log(`checking ${current.userId}`);
            if (!current.leftDirectId) {
                console.log('End of line found.');
                break;
            }

            const nextId = current.leftDirectId;
            const nextNode = await Tree.findOne({ userId: nextId });

            if (!nextNode) {
                console.log(`BROKEN_LINK_FOUND: User=${current.userId} points to missing Child=${nextId}`);

                // Auto-fix?
                // Let's print command to fix it
                console.log(`FIX_COMMAND: db.trees.updateOne({userId: '${current.userId}'}, {$set: {leftDirectId: null}})`);

                // Actually, let's just fix it here if we are sure
                current.leftDirectId = null;
                await current.save();
                console.log('AUTO-FIXED: Set leftDirectId to NULL.');
                break;
            }

            current = nextNode;
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

traceLeftLeg();
