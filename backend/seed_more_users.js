const mongoose = require('mongoose');
const User = require('./src/models/User');
const Tree = require('./src/models/Tree');
require('dotenv').config();

const seedMoreUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const parentId = 'IVA1002'; // Placing under IVA1002
        const adminId = 'IVA1004';
        const userId = 'IVA1005';
        const password = 'password123';

        // Check if parent exists
        const parentTree = await Tree.findOne({ userId: parentId });

        if (!parentTree) {
            console.log(`Parent Tree node ${parentId} not found. Please run seed_user.js first.`);
            process.exit(1);
        }

        // 1. Create Second Admin (IVA1004) - Left of IVA1002
        await User.create({
            userId: adminId,
            fullName: 'Second Admin',
            email: 'admin2@ivamax.com',
            mobile: '9988776655',
            password: password,
            plainPassword: password,
            role: 'admin',
            isActive: true,
            isEmailVerified: true,
            rank: 'Platinum',
            referralId: parentId,
            placementSide: 'Left'
        });

        await Tree.create({
            userId: adminId,
            parentId: parentId,
            level: parentTree.level + 1,
            leftDirectId: null,
            rightDirectId: null,
        });

        parentTree.leftDirectId = adminId;
        await parentTree.save();
        console.log(`Created Admin ${adminId} (Left of ${parentId})`);

        // 2. Create Second User (IVA1005) - Right of IVA1002
        await User.create({
            userId: userId,
            fullName: 'Second User',
            email: 'user2@ivamax.com',
            mobile: '5566778899',
            password: password,
            plainPassword: password,
            role: 'user',
            isActive: true,
            isEmailVerified: true,
            rank: 'Member',
            referralId: parentId,
            placementSide: 'Right'
        });

        await Tree.create({
            userId: userId,
            parentId: parentId,
            level: parentTree.level + 1,
            leftDirectId: null,
            rightDirectId: null,
        });

        const freshParent = await Tree.findOne({ userId: parentId }); // Refresh to be safe
        freshParent.rightDirectId = userId;
        await freshParent.save();
        console.log(`Created User ${userId} (Right of ${parentId})`);

        console.log('-----------------------------------');
        console.log(`Admin ID: ${adminId}`);
        console.log(`User ID: ${userId}`);
        console.log(`Password: ${password}`);
        console.log('-----------------------------------');

        process.exit();
    } catch (error) {
        console.error('Error seeding more users:', error);
        process.exit(1);
    }
};

seedMoreUsers();
