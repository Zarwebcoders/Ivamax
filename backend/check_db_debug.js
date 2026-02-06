require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Tree = require('./src/models/Tree');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const checkData = async () => {
    await connectDB();

    console.log('\n--- CHECKING IVA100001 (ROOT/SPONSOR) ---');
    const u1 = await User.findOne({ userId: 'IVA100001' });
    console.log('User IVA100001:', u1 ? 'FOUND' : 'NOT FOUND');
    if (u1) console.log('  Role:', u1.role, 'ReferralId:', u1.referralId);

    const t1 = await Tree.findOne({ userId: 'IVA100001' });
    console.log('Tree IVA100001:', t1 ? 'FOUND' : 'NOT FOUND');
    if (t1) {
        console.log('  LeftDirect:', t1.leftDirectId);
        console.log('  RightDirect:', t1.rightDirectId);
    }

    console.log('\n--- CHECKING IVA100009 (FAILED USER) ---');
    const u9 = await User.findOne({ userId: 'IVA100009' });
    console.log('User IVA100009:', u9 ? 'FOUND' : 'NOT FOUND');
    if (u9) console.log('  ReferralId:', u9.referralId, 'PlacementSide:', u9.placementSide);

    const t9 = await Tree.findOne({ userId: 'IVA100009' });
    console.log('Tree IVA100009:', t9 ? 'FOUND' : 'NOT FOUND');
    if (t9) console.log('  ParentId:', t9.parentId);

    process.exit();
};

checkData();
