const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');

        const users = await User.find({}, 'email rank closingRank currentRank');
        console.log('Users found:', users.length);
        users.forEach(u => {
            console.log(`Email: ${u.email}, Rank: ${u.rank}, Closing: ${u.closingRank}, CurrentRank(num): ${u.currentRank}`);
        });

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

listUsers();
