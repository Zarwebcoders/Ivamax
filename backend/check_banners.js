require('dotenv').config();
const mongoose = require('mongoose');
const Announcement = require('./src/models/Announcement');

const checkBanners = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const banners = await Announcement.find({ type: 'banner' });
        console.log('Found banners:', banners.length);
        banners.forEach(b => {
            console.log(`- Title: ${b.title}, Image: '${b.image}'`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkBanners();
