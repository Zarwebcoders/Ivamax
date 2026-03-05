require('dotenv').config();
const mongoose = require('mongoose');
const Income = require('./src/models/Income');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const user = await User.findOne({ userId: 'IVA3224' });
    console.log("User:", user ? { userId: user.userId, currentRank: user.currentRank } : "Not found");
    const records = await Income.find({ userId: 'IVA3224', incomeType: { $in: ['FCR', 'REPR', 'RANK'] } });
    console.log("Records:", records);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
