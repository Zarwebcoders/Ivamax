const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const deactivateUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'chhipasahil163@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            user.isActive = false;
            await user.save();
            console.log(`User ${email} deactivated successfully.`);
        } else {
            console.log(`User ${email} not found.`);
        }
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

deactivateUser();
