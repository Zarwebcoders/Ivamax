const mongoose = require('mongoose');
const Tree = require('./src/models/Tree');
const User = require('./src/models/User');
const { moveUserNode } = require('./src/services/treeService');
require('dotenv').config();

const runVerification = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // cleanup
        await User.deleteMany({ userId: { $in: ['TEST_A', 'TEST_B', 'TEST_C'] } });
        await Tree.deleteMany({ userId: { $in: ['TEST_A', 'TEST_B', 'TEST_C'] } });

        // 1. Create Nodes
        console.log('Creating Test Nodes...');
        // A (Root)
        await Tree.create({ userId: 'TEST_A', parentId: null, level: 1, leftDirectId: 'TEST_B', rightDirectId: null });
        await User.create({ userId: 'TEST_A', fullName: 'Test A', email: 'testa@example.com', password: '123', mobile: '1111111111' });

        // B (Left of A)
        await Tree.create({ userId: 'TEST_B', parentId: 'TEST_A', level: 2, leftDirectId: 'TEST_C', rightDirectId: null });
        await User.create({ userId: 'TEST_B', fullName: 'Test B', email: 'testb@example.com', password: '123', mobile: '2222222222' });

        // C (Left of B)
        await Tree.create({ userId: 'TEST_C', parentId: 'TEST_B', level: 3, leftDirectId: null, rightDirectId: null });
        await User.create({ userId: 'TEST_C', fullName: 'Test C', email: 'testc@example.com', password: '123', mobile: '3333333333' });

        console.log('Initial State Created: A -> L:B -> L:C');

        // 2. Verification: Move B to A's Right
        console.log('Moving B to A Right...');
        await moveUserNode('TEST_B', 'TEST_A', 'Right');

        // 3. Check State
        const treeA = await Tree.findOne({ userId: 'TEST_A' });
        const treeB = await Tree.findOne({ userId: 'TEST_B' });
        const treeC = await Tree.findOne({ userId: 'TEST_C' });

        let passed = true;

        if (treeA.leftDirectId !== null) { console.error('FAIL: A Left is not null'); passed = false; }
        if (treeA.rightDirectId !== 'TEST_B') { console.error('FAIL: A Right is not B'); passed = false; }
        if (treeB.parentId !== 'TEST_A') { console.error('FAIL: B Parent is not A'); passed = false; }
        if (treeB.level !== 2) { console.error(`FAIL: B Level is ${treeB.level}, expected 2`); passed = false; }

        // C should still be under B, but level might effectively be same if logic determines new level = parent + 1
        // B was level 2 (under A). Moved to A Right -> Level 2. So C should remain Level 3.
        if (treeC.parentId !== 'TEST_B') { console.error('FAIL: C Parent is not B'); passed = false; }
        if (treeC.level !== 3) { console.error(`FAIL: C Level is ${treeC.level}, expected 3`); passed = false; }

        // 4. Test Circular Fail
        console.log('Testing Circular Fail (Move A under C)...');
        try {
            await moveUserNode('TEST_A', 'TEST_C', 'Left');
            console.error('FAIL: Circular move succeeded (should fail)'); passed = false;
        } catch (e) {
            console.log('PASS: Circular move failed as expected:', e.message);
        }

        if (passed) {
            console.log('✅ ALL TESTS PASSED');
        } else {
            console.error('❌ SOME TESTS FAILED');
        }

        // Cleanup
        await User.deleteMany({ userId: { $in: ['TEST_A', 'TEST_B', 'TEST_C'] } });
        await Tree.deleteMany({ userId: { $in: ['TEST_A', 'TEST_B', 'TEST_C'] } });

        mongoose.connection.close();

    } catch (err) {
        console.error('Error:', err);
        mongoose.connection.close();
    }
};

runVerification();
