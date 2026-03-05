require('dotenv').config();
const mongoose = require('mongoose');
const { updateUserRank } = require('./src/controllers/rankController');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const rank = await updateUserRank('IVA3224');
    console.log("Updated Rank for IVA3224:", rank);
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
