const mongoose = require('mongoose');
const User = require('./src/models/User');
const Tree = require('./src/models/Tree');
require('dotenv').config();

const checkDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({}, 'userId fullName role isActive');
        console.log('--- USERS ---');
        console.table(users.map(u => ({ userId: u.userId, name: u.fullName, role: u.role, active: u.isActive })));

        const trees = await Tree.find({});
        console.log('--- TREES ---');
        console.table(trees.map(t => ({
            userId: t.userId,
            parent: t.parentId,
            left: t.leftDirectId,
            right: t.rightDirectId
        })));

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkDb();
