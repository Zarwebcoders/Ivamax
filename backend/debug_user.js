require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ userId: 'IVA3224' });
        console.log('User Data:', JSON.stringify({
            userId: user.userId,
            rank: user.rank,
            currentRank: user.currentRank,
            closingRank: user.closingRank
        }, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkUser();
