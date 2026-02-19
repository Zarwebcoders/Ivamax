const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const inspect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ivamax');
        console.log('Connected.');

        // Check for users with null userId
        const nullUsers = await User.find({ userId: null });
        console.log(`Users with null userId: ${nullUsers.length}`);
        if (nullUsers.length > 0) {
            console.log(JSON.stringify(nullUsers, null, 2));
        }

        // Check for duplicate keys
        // If the error is "E11000 duplicate key error collection: ... index: user_id_1 dup key: { user_id: null }"
        // It means there is already ONE user with null (allowed if unique sparse? or not allowed if unique true).
        // If unique: true, only ONE null is allowed (or zero if required: true).
        // User schema says required: true. So NO nulls allowed.
        // But maybe some old data has it? Or my script is sending null?

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

inspect();
