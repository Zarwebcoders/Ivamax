const mongoose = require('mongoose');
require('dotenv').config();

// ==========================================
// INLINE SCHEMAS TO AVOID PATH ISSUES
// ==========================================
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    referralId: { type: String, default: null },
    placementSide: { type: String, enum: ['Left', 'Right'], default: null },
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const treeSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true, index: true },
    parentId: { type: String, default: null },
    leftDirectId: { type: String, default: null },
    rightDirectId: { type: String, default: null },
    level: { type: Number, default: 0 },
});
const Tree = mongoose.models.Tree || mongoose.model('Tree', treeSchema);
// ==========================================

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Error:', err);
        process.exit(1);
    }
};

const traceLeftLeg = async () => {
    await connectDB();

    console.log('\n--- TRACING LEFT LEG FROM IVA100001 ---');

    let currentId = 'IVA100001';
    let depth = 0;

    while (currentId) {
        const treeNode = await Tree.findOne({ userId: currentId });

        if (!treeNode) {
            console.log(`[STOP] Node ${currentId} NOT FOUND in Tree collection! Broken Link?`);
            break;
        }

        const userNode = await User.findOne({ userId: currentId });
        const userName = userNode ? userNode.fullName : "UNKNOWN_USER";

        console.log(`[Depth ${depth}] ${currentId} ("${userName}")`);
        console.log(`    Left -> ${treeNode.leftDirectId || 'NULL'}`);
        console.log(`    Right -> ${treeNode.rightDirectId || 'NULL'}`);

        // Check if next node actually exists if ID is present
        if (treeNode.leftDirectId) {
            const nextNode = await Tree.findOne({ userId: treeNode.leftDirectId });
            if (!nextNode) {
                console.log(`    [CRITICAL ERROR] ${currentId} says Left is ${treeNode.leftDirectId}, but that node DOES NOT EXIST in DB.`);
            }
        }

        currentId = treeNode.leftDirectId;
        depth++;

        if (depth > 20) {
            console.log("Stopping recursion at depth 20");
            break;
        }
    }

    console.log('\n--- SPECIFIC CHECK FOR TVA100010 ---');
    // Also check IVA100010 specifically and its parent
    const u10 = await Tree.findOne({ userId: 'IVA100010' });
    console.log('IVA100010 Tree Node:', u10);
    if (u10) {
        console.log('Parent of 10 is:', u10.parentId);
        const parentOf10 = await Tree.findOne({ userId: u10.parentId });
        console.log('Parent Node (' + u10.parentId + '):', parentOf10);
    }

    process.exit();
};

traceLeftLeg();
