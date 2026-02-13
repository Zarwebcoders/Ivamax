const Tree = require('../models/Tree');

// Helper to find the correct placement based on strategy
const findPlacement = async (sponsorId, strategy) => {
    let currentId = sponsorId;
    let parentNode = null;
    let side = null;

    // Fetch Sponsor's Tree Node
    const sponsorTree = await Tree.findOne({ userId: sponsorId });
    if (!sponsorTree) {
        throw new Error('Sponsor tree node not found');
    }

    if (strategy === 'left') {
        // 1. Normal Left Link: Direct placement
        if (sponsorTree.leftDirectId) {
            throw new Error('Sponsor\'s Left position is already occupied');
        }
        return { parentId: sponsorId, side: 'Left' };

    } else if (strategy === 'right') {
        // 2. Normal Right Link: Direct placement
        if (sponsorTree.rightDirectId) {
            throw new Error('Sponsor\'s Right position is already occupied');
        }
        return { parentId: sponsorId, side: 'Right' };

    } else if (strategy === 'placing-left') {
        // 3. Placing Left Link: Extreme Left (Power Leg)
        // Start from sponsor and traverse LEFT until we find a null spot
        let current = sponsorTree;
        while (current) {
            if (!current.leftDirectId) {
                // Found empty spot
                return { parentId: current.userId, side: 'Left' };
            }
            // Move down to the next node on the left
            current = await Tree.findOne({ userId: current.leftDirectId });
        }

    } else if (strategy === 'placing-right') {
        // 4. Placing Right Link: Extreme Right (Power Leg)
        // Start from sponsor and traverse RIGHT until we find a null spot
        let current = sponsorTree;
        while (current) {
            if (!current.rightDirectId) {
                // Found empty spot
                return { parentId: current.userId, side: 'Right' };
            }
            // Move down to the next node on the right
            current = await Tree.findOne({ userId: current.rightDirectId });
        }
    }

    throw new Error('Invalid placement strategy');
};

// HELPER: Bubble up counts
const updateUplineCounts = async (startUserId) => {
    let currentId = startUserId;

    // We loop until we hit the top or a broken link
    while (currentId) {
        // Find the node itself to get its parent
        const currentNode = await Tree.findOne({ userId: currentId });
        if (!currentNode || !currentNode.parentId) break;

        const parentId = currentNode.parentId;
        const parentNode = await Tree.findOne({ userId: parentId });

        if (!parentNode) break;

        // Determine which side 'currentId' is on relative to 'parentNode'
        if (parentNode.leftDirectId === currentId) {
            // It's on the Left
            await Tree.updateOne(
                { userId: parentId },
                { $inc: { totalLeftMembers: 1 } }
            );
        } else if (parentNode.rightDirectId === currentId) {
            // It's on the Right
            await Tree.updateOne(
                { userId: parentId },
                { $inc: { totalRightMembers: 1 } }
            );
        }

        currentId = parentId; // Move up one level
    }
};

module.exports = {
    findPlacement,
    updateUplineCounts
};
