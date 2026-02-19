const mongoose = require('mongoose');
const User = require('./src/models/User');
const Tree = require('./src/models/Tree');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedAll = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clean DB
        await User.deleteMany({});
        await Tree.deleteMany({});
        console.log('Cleared DB');

        const password = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 1. IVA1001 (Admin / Root)
        await User.create({
            userId: 'IVA1001',
            fullName: 'IVAMAX Admin',
            email: 'admin@ivamax.com',
            mobile: '1234567890',
            password: hashedPassword,
            plainPassword: password,
            role: 'admin',
            isActive: true,
            isEmailVerified: true,
            rank: 'Diamond',
            packageType: 'Founder Pack',
            investmentAmount: 5000
        });
        const rootTree = await Tree.create({
            userId: 'IVA1001',
            parentId: null,
            level: 1,
            leftDirectId: 'IVA1002', // Pre-fill as we are creating children
            rightDirectId: 'IVA1003'
        });
        console.log('Created IVA1001 (Admin)');

        // 2. IVA1002 (User / Left of 1001)
        await User.create({
            userId: 'IVA1002',
            fullName: 'Test User',
            email: 'user@ivamax.com',
            mobile: '9876543210',
            password: hashedPassword,
            plainPassword: password,
            role: 'user',
            isActive: true,
            isEmailVerified: true,
            rank: 'Member',
            referralId: 'IVA1001',
            placementSide: 'Left'
        });
        const tree1002 = await Tree.create({
            userId: 'IVA1002',
            parentId: 'IVA1001',
            level: 2,
            leftDirectId: 'IVA1004',
            rightDirectId: 'IVA1005'
        });
        console.log('Created IVA1002 (User - Left of 1001)');

        // 3. IVA1003 (Inactive User / Right of 1001)
        await User.create({
            userId: 'IVA1003',
            fullName: 'Inactive User',
            email: 'inactive@ivamax.com',
            mobile: '1112223333',
            password: hashedPassword,
            plainPassword: password,
            role: 'user',
            isActive: false,
            isEmailVerified: true,
            rank: 'No Rank',
            referralId: 'IVA1001',
            placementSide: 'Right'
        });
        await Tree.create({
            userId: 'IVA1003',
            parentId: 'IVA1001',
            level: 2,
            leftDirectId: null,
            rightDirectId: null
        });
        console.log('Created IVA1003 (Inactive - Right of 1001)');

        // 4. IVA1004 (Second Admin / Left of 1002)
        await User.create({
            userId: 'IVA1004',
            fullName: 'Second Admin',
            email: 'admin2@ivamax.com',
            mobile: '9988776655',
            password: hashedPassword,
            plainPassword: password,
            role: 'admin',
            isActive: true,
            isEmailVerified: true,
            rank: 'Platinum',
            referralId: 'IVA1002',
            placementSide: 'Left'
        });
        await Tree.create({
            userId: 'IVA1004',
            parentId: 'IVA1002',
            level: 3,
            leftDirectId: null,
            rightDirectId: null
        });
        console.log('Created IVA1004 (Admin 2 - Left of 1002)');

        // 5. IVA1005 (Second User / Right of 1002)
        await User.create({
            userId: 'IVA1005',
            fullName: 'Second User',
            email: 'user2@ivamax.com',
            mobile: '5566778899',
            password: hashedPassword,
            plainPassword: password,
            role: 'user',
            isActive: true,
            isEmailVerified: true,
            rank: 'Member',
            referralId: 'IVA1002',
            placementSide: 'Right'
        });
        await Tree.create({
            userId: 'IVA1005',
            parentId: 'IVA1002',
            level: 3,
            leftDirectId: null,
            rightDirectId: null
        });
        console.log('Created IVA1005 (User 2 - Right of 1002)');

        console.log('All users seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedAll();
