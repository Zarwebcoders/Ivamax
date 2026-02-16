const mongoose = require('mongoose');
const Tree = require('./src/models/Tree');
require('dotenv').config();

const traceLeftLeg = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');

        const startId = 'IVA2609';
        console.log(`Tracing Left Leg for ${startId}...`);

        let current = await Tree.findOne({ userId: startId });
        if (!current) {
            console.log('Start user not found in Tree');
            process.exit(1);
        }

        while (current) {
            console.log(`-> User: ${current.userId} | Left: ${current.leftDirectId} | Right: ${current.rightDirectId}`);

            if (!current.leftDirectId) {
                console.log('✅ End of line (Empty Spot Found). Logic should have returned here.');
                break;
            }

            const nextId = current.leftDirectId;
            const nextNode = await Tree.findOne({ userId: nextId });

            if (!nextNode) {
                console.log(`❌ BROKEN LINK! User ${current.userId} points to Left Child ${nextId}, but ${nextId} does not exist in Tree.`);
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
