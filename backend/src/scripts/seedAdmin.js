require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User'); // Adjust path as needed
const Tree = require('../models/Tree'); // Adjust path as needed
const connectDB = require('../config/database');

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@ivamax.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log('Admin already exists');
            process.exit();
        }

        const userId = await User.generateUserId();

        const admin = await User.create({
            userId,
            fullName: 'Super Admin',
            mobile: '0000000000',
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            rank: 'Admin',
            placementSide: null, // Admin is root
        });

        // Create tree root
        await Tree.create({
            userId: admin.userId,
            parentId: null,
            level: 0,
        });

        console.log(`Admin created successfully: ${admin.email} / ${adminPassword}`);
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
