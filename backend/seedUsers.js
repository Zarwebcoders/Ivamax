require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Tree = require('./src/models/Tree');
const { findPlacement, updateUplineCounts } = require('./src/services/treeService');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
};

const seedUsers = async () => {
    await connectDB();

    try {
        // Find the root user (sponsor)
        let rootUser = await User.findOne().sort({ createdAt: 1 });

        if (!rootUser) {
            console.log('No root user found. Creating Root User (IVA1001)...');
            // Create Root User
            const rootId = 'IVA1001';
            rootUser = await User.create({
                userId: rootId,
                fullName: 'Root Admin',
                mobile: '1234567890',
                email: 'admin@ivamax.com',
                password: 'password123',
                plainPassword: 'password123',
                referralId: null, // Root has no referrer
                placementSide: null,
                role: 'admin',
                isActive: true
            });
            // Create Tree Node for Root
            await Tree.create({
                userId: rootId,
                parentId: null,
                level: 1,
                leftDirectId: null,
                rightDirectId: null
            });
            console.log(`Created Root User: ${rootUser.userId}`);
        }

        console.log(`Using Root Sponsor: ${rootUser.fullName} (${rootUser.userId})`);

        const numberOfUsersToCreate = 100;
        const sponsorId = rootUser.userId;

        console.log(`Starting to create ${numberOfUsersToCreate} users...`);

        // We will loop to create users one by one
        for (let i = 1; i <= numberOfUsersToCreate; i++) {
            // Alternate placement strategy to balance the tree
            // We use 'placing-left' and 'placing-right' so that the system finds the next available spot
            // at the bottom of the power legs.
            const strategy = i % 2 === 0 ? 'placing-right' : 'placing-left';

            try {
                // 1. Find Placement
                // This function returns { parentId, side }
                const placementInfo = await findPlacement(sponsorId, strategy);
                const { parentId, side } = placementInfo;

                // 2. Generate User Data
                const newUserId = await User.generateUserId();

                // Construct realistic-looking test data
                const newUser = await User.create({
                    userId: newUserId,
                    fullName: `Test User ${newUserId}`,
                    mobile: `12345678${i.toString().padStart(2, '0')}`,
                    email: `testuser${newUserId}@example.com`,
                    password: 'password123', // Will be hashed by pre-save hook
                    plainPassword: 'password123',
                    referralId: sponsorId,
                    placementSide: side, // The side they actually landed on
                    role: 'user',
                    isActive: true, // Make them active so tree looks alive
                    registrationDate: new Date()
                });

                // 3. Create Tree Node
                // Find parent's tree node to determine level
                const parentTree = await Tree.findOne({ userId: parentId });
                const newLevel = parentTree ? parentTree.level + 1 : 1;

                const newTree = await Tree.create({
                    userId: newUserId,
                    parentId: String(parentId),
                    level: newLevel,
                    leftDirectId: null,
                    rightDirectId: null,
                    // Initialize pairs/counts if needed, schema defaults handle 0
                });

                // 4. Update Parent
                if (side === 'Left') {
                    await Tree.updateOne({ userId: parentId }, { leftDirectId: newUserId });
                } else {
                    await Tree.updateOne({ userId: parentId }, { rightDirectId: newUserId });
                }

                // 5. Update Upline Counts
                // This bubbles up the counts for network size
                await updateUplineCounts(newUserId);

                console.log(`[${i}/${numberOfUsersToCreate}] Created ${newUserId} under ${parentId} (${side})`);

            } catch (err) {
                console.error(`Failed to create user #${i}:`, err.message);
                // Continue loop even if one falls (e.g. race condition or validation error)
            }
        }

        console.log('Seeding completed!');
        process.exit(0);

    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedUsers();
