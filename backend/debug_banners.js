const mongoose = require('mongoose');
require('dotenv').config();
const Announcement = require('./src/models/Announcement');

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI)
    .then(async () => {
        try {
            const banners = await Announcement.find({ type: 'banner' });
            console.log('--- START OUTPUT ---');
            console.log(JSON.stringify(banners, null, 2));
            console.log('--- END OUTPUT ---');
        } catch (err) {
            console.error(err);
        } finally {
            await mongoose.disconnect();
        }
    })
    .catch(err => console.error('Connection error:', err));
