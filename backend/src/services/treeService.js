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

// Helper to recursively update levels for a subtree
const updateSubtreeLevels = async (rootUserId, newLevel) => {
    const queue = [{ userId: rootUserId, level: newLevel }];

    while (queue.length > 0) {
        const { userId, level } = queue.shift();

        // Update current node
        await Tree.updateOne({ userId }, { level });

        // Find children
        const node = await Tree.findOne({ userId });
        if (node) {
            if (node.leftDirectId) {
                queue.push({ userId: node.leftDirectId, level: level + 1 });
            }
            if (node.rightDirectId) {
                queue.push({ userId: node.rightDirectId, level: level + 1 });
            }
        }
    }
};

// Move User Node (Admin Function)
const moveUserNode = async (userId, newSponsorId, side) => {
    // 1. Validation: Prevent moving to self
    if (userId === newSponsorId) {
        throw new Error('Cannot move user under themselves');
    }

    // 2. Fetch Trees
    const userTree = await Tree.findOne({ userId });
    const newSponsorTree = await Tree.findOne({ userId: newSponsorId });

    if (!userTree) throw new Error('User tree node not found');
    if (!newSponsorTree) throw new Error('New Sponsor tree node not found');

    // 3. Circular Dependency Check: Ensure newSponsor is NOT in user's downline
    // We can traverse up from newSponsor to see if we hit userId
    let current = newSponsorTree;
    while (current && current.userId !== userId && current.parentId) {
        current = await Tree.findOne({ userId: current.parentId });
    }
    if (current && current.userId === userId) {
        throw new Error('Cannot move user into their own downline');
    }

    // 4. Check Target Spot Availability
    if (side === 'Left' && newSponsorTree.leftDirectId) {
        throw new Error(`Sponsor's ${side} side is already occupied by ${newSponsorTree.leftDirectId}`);
    }
    if (side === 'Right' && newSponsorTree.rightDirectId) {
        throw new Error(`Sponsor's ${side} side is already occupied by ${newSponsorTree.rightDirectId}`);
    }

    // 5. Remove from Old Parent
    if (userTree.parentId) {
        const oldParentTree = await Tree.findOne({ userId: userTree.parentId });
        if (oldParentTree) {
            if (oldParentTree.leftDirectId === userId) {
                oldParentTree.leftDirectId = null;
            } else if (oldParentTree.rightDirectId === userId) {
                oldParentTree.rightDirectId = null;
            }
            await oldParentTree.save();
        }
    }

    // 6. Add to New Sponsor
    if (side === 'Left') {
        newSponsorTree.leftDirectId = userId;
    } else {
        newSponsorTree.rightDirectId = userId;
    }
    await newSponsorTree.save();

    // 7. Update User's Parent in Tree
    userTree.parentId = newSponsorId;

    // 8. Calculate New Level
    const newLevel = newSponsorTree.level + 1;
    userTree.level = newLevel;
    await userTree.save();

    // 9. Update Levels for entire subtree
    // We already updated userTree, but we need to update children
    if (userTree.leftDirectId || userTree.rightDirectId) {
        await updateSubtreeLevels(userTree.userId, newLevel);
        // Note: updateSubtreeLevels updates the root passed to it too, so it's redundant for userTree 
        // but safe. To be efficient, we could pass children. 
        // Actually, let's just run it for userId and it will handle everything including userTree again (which is fine)
    }

    return { success: true };
};

module.exports = {
    findPlacement,
    updateUplineCounts,
    moveUserNode
};
