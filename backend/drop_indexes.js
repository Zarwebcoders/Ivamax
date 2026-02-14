const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dropIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const collection = mongoose.connection.collection('users');

        try {
            await collection.dropIndex('email_1');
            console.log('Dropped email_1 index');
        } catch (e) {
            console.log('email_1 index not found or already dropped:', e.message);
        }

        try {
            await collection.dropIndex('mobile_1');
            console.log('Dropped mobile_1 index');
        } catch (e) {
            console.log('mobile_1 index not found or already dropped:', e.message);
        }

        console.log('Done');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

dropIndexes();
