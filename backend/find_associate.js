const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const findAssociate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');

        // Regex because case might differ
        const user = await User.findOne({ closingRank: { $regex: /ASSOCIATE/i } });

        if (user) {
            console.log(`FOUND USER: ${user.email}`);
            console.log(`Rank: ${user.rank}, Closing: ${user.closingRank}`);

            // Reset it
            user.rank = 'No Rank';
            user.closingRank = 'No Rank';
            user.currentRank = 0;
            await user.save();
            console.log('RESET SUCCESSFUL');
        } else {
            console.log('No user with ASSOCIATE closing rank found.');
            // Maybe it's "Associate" (Title Case) or "ASSOCIATE" (Upper)
            // Let's dump all closingRanks
            const users = await User.find({}, 'email closingRank');
            users.forEach(u => console.log(`${u.email}: ${u.closingRank}`));
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

findAssociate();
