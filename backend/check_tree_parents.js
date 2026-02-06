const mongoose = require('mongoose');
require('dotenv').config();
const Tree = require('./src/models/Tree');

const checkParents = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const trees = await Tree.find().limit(20);
        console.log('--- Checking first 20 Tree Nodes ---');
        trees.forEach(node => {
            console.log(`User: ${node.userId}, Parent: ${node.parentId}, Left: ${node.leftDirectId}, Right: ${node.rightDirectId}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

checkParents();
