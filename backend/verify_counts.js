const mongoose = require('mongoose');
const User = require('./src/models/User');
const Tree = require('./src/models/Tree');
const { incrementUplineCounts, decrementUplineCounts } = require('./src/services/treeService');
require('dotenv').config();

const verifyCounts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ivamax');
        console.log('Connected.');

        const timestamp = Date.now();
        const parentId = `PARENT_${timestamp}`;
        const childId = `CHILD_${timestamp}`;
        const parentEmail = `p${timestamp}@test.com`;
        const childEmail = `c${timestamp}@test.com`;

        console.log('\n--- 1. Set up Parent ---');
        await User.collection.insertOne({
            userId: parentId,
            user_id: parentId, // Legacy index
            my_referral_id: parentId, // Legacy index
            referralCode: parentId, // Legacy index check
            fullName: 'Parent',
            email: parentEmail,
            mobile: '1111111111',
            password: '123',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            __v: 0
        });

        await Tree.collection.insertOne({
            userId: parentId,
            parentId: 'ROOT',
            level: 1,
            totalLeftMembers: 0,
            totalRightMembers: 0,
            leftDirectId: null,
            rightDirectId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            __v: 0
        });

        console.log('Parent created. Left Count: 0');

        console.log('\n--- 2. Register Child (Inactive) ---');
        // Child is Inactive
        await User.collection.insertOne({
            userId: childId,
            user_id: childId, // Legacy index
            my_referral_id: childId, // Legacy index
            referralCode: childId, // Legacy index
            fullName: 'Child',
            email: childEmail,
            mobile: '2222222222',
            password: '123',
            isActive: false, // Inactive!
            createdAt: new Date(),
            updatedAt: new Date(),
            __v: 0
        });

        await Tree.collection.insertOne({
            userId: childId,
            parentId: parentId,
            level: 2,
            leftDirectId: null,
            rightDirectId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            __v: 0
        });

        await Tree.updateOne({ userId: parentId }, { leftDirectId: childId });

        let parentTree = await Tree.findOne({ userId: parentId });
        console.log(`Parent Left Count after Inactive Register: ${parentTree.totalLeftMembers} (Expected: 0)`);

        if (parentTree.totalLeftMembers !== 0) {
            console.error('FAILURE: Inactive user counted on registration!');
        } else {
            console.log('SUCCESS: Inactive user NOT counted.');
        }

        console.log('\n--- 3. Activate Child ---');
        await User.updateOne({ userId: childId }, { isActive: true, packageType: 'Starter' });
        await incrementUplineCounts(childId);

        parentTree = await Tree.findOne({ userId: parentId });
        console.log(`Parent Left Count after Activation: ${parentTree.totalLeftMembers} (Expected: 1)`);

        if (parentTree.totalLeftMembers !== 1) {
            console.error('FAILURE: Active user NOT counted!');
        } else {
            console.log('SUCCESS: Active user counted.');
        }

        console.log('\n--- 4. Delete Active Child (Manual) ---');
        await decrementUplineCounts(childId);

        parentTree = await Tree.findOne({ userId: parentId });
        console.log(`Parent Left Count after Active Delete: ${parentTree.totalLeftMembers} (Expected: 0)`);

        if (parentTree.totalLeftMembers !== 0) {
            console.error('FAILURE: Count not decremented!');
        } else {
            console.log('SUCCESS: Count decremented.');
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

verifyCounts();
