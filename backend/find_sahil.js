const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const findSahil = async () => {
    try {
        console.log(`URI: ${process.env.MONGODB_URI.substring(0, 20)}...`);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');

        const users = await User.find({ fullName: { $regex: /Sahil/i } });
        console.log(`Found ${users.length} users with name Sahil`);

        for (const user of users) {
            console.log(`ID: ${user.userId} | Name: ${user.fullName} | Email: ${user.email} | Closing: ${user.closingRank}`);

            // Just reset them all for good measure since this is dev
            if (user.closingRank && user.closingRank.toUpperCase().includes('ASSOCIATE')) {
                console.log('RESETTING THIS USER...');
                user.closingRank = 'No Rank';
                user.rank = 'No Rank';
                user.currentRank = 0;
                await user.save();
                console.log('DONE.');
            }
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

findSahil();
