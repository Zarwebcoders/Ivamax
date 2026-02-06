require('dotenv').config();
const mongoose = require('mongoose');
const Tree = require('./src/models/Tree');

const checkNode = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const parent = await Tree.findOne({ userId: 'IVA100001' });
        console.log('Parent (IVA100001):', parent);

        const child = await Tree.findOne({ userId: 'IVA100002' });
        console.log('Child (IVA100002):', child);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkNode();
