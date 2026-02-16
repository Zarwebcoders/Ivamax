const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const dumpUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const users = await User.find({}, 'email closingRank');
        console.log(`Total Users: ${users.length}`);

        for (const user of users) {
            console.log(`[USER] ${user.email} | Closing: ${user.closingRank}`);
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

dumpUsers();
