require('dotenv').config();
const mongoose = require('mongoose');
const Tree = require('./src/models/Tree');
const User = require('./src/models/User');
const { isUserValid, getValidityDeadline } = require('./src/utils/userValidity');

async function debugTreeFull() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const rootUserId = 'IVA3224';

        const fetchLevel = async (userId, level, maxLevel) => {
            if (level > maxLevel) return;

            const treeNode = await Tree.findOne({ userId });
            const user = await User.findOne({ userId });

            if (!user) {
                console.log(`${'  '.repeat(level)}[${userId}] - USER NOT FOUND`);
                return;
            }

            const valid = isUserValid(user);
            const deadline = getValidityDeadline(user.createdAt);

            console.log(`${'  '.repeat(level)}[${userId}] ${user.fullName} | Active: ${user.isActive} | Valid: ${valid} | Deadline: ${deadline.toISOString()}`);

            if (treeNode) {
                if (treeNode.leftDirectId) await fetchLevel(treeNode.leftDirectId, level + 1, maxLevel);
                if (treeNode.rightDirectId) await fetchLevel(treeNode.rightDirectId, level + 1, maxLevel);
            }
        };

        console.log('--- Detailed Tree Validity Audit ---');
        await fetchLevel(rootUserId, 0, 3);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

debugTreeFull();
