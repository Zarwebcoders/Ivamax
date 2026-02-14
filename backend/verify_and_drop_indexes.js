const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const verifyAndDrop = async () => {
    try {
        console.log('Connecting to MongoDB...', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const collection = mongoose.connection.collection('users');

        // 1. List Initial Indexes
        const initialIndexes = await collection.indexes();
        console.log('\n--- Current Indexes ---');
        initialIndexes.forEach(idx => console.log(`- ${idx.name}: ${JSON.stringify(idx.key)}`));

        // 2. Drop email_1
        if (initialIndexes.find(i => i.name === 'email_1')) {
            console.log('\nDropping email_1...');
            await collection.dropIndex('email_1');
            console.log('Dropped email_1 successfully.');
        } else {
            console.log('\nemail_1 index not found (already dropped?)');
        }

        // 3. Drop mobile_1
        if (initialIndexes.find(i => i.name === 'mobile_1')) {
            console.log('\nDropping mobile_1...');
            await collection.dropIndex('mobile_1');
            console.log('Dropped mobile_1 successfully.');
        } else {
            console.log('\nmobile_1 index not found (already dropped?)');
        }

        // 4. Verify
        const finalIndexes = await collection.indexes();
        console.log('\n--- Final Indexes ---');
        finalIndexes.forEach(idx => console.log(`- ${idx.name}: ${JSON.stringify(idx.key)}`));

        console.log('\nDone. Please restart your backend server just in case.');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyAndDrop();
