const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const user = await User.findOne({ userId: 'IVA1002' });
        if (!user) {
            console.log('User IVA1002 not found');
            process.exit(1);
        }

        console.log('Resetting password for IVA1002 to password123');
        user.password = 'password123';
        // This will trigger pre('save') hook to hash the password
        await user.save();

        console.log('Password reset successful');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetPassword();
