const Tree = require('../models/Tree');

// Helper to find the correct placement based on strategy
const findPlacement = async (sponsorId, strategy) => {
    let currentId = sponsorId;
    let parentNode = null;
    let side = null;

    console.log(`[DEBUG] findPlacement called. Sponsor: ${sponsorId}, Strategy: '${strategy}'`);

    // Fetch Sponsor's Tree Node
    const sponsorTree = await Tree.findOne({ userId: sponsorId });
    if (!sponsorTree) {
        throw new Error('Sponsor tree node not found');
    }

    if (strategy === 'left') {
        // 1. Normal Left Link: Direct placement
        if (sponsorTree.leftDirectId) {
            throw new Error('This position is filled');
        }
        return { parentId: sponsorId, side: 'Left' };

    } else if (strategy === 'right') {
        // 2. Normal Right Link: Direct placement
        if (sponsorTree.rightDirectId) {
            throw new Error('This position is filled');
        }
        return { parentId: sponsorId, side: 'Right' };

    } else if (strategy === 'placing-left') {
        // 3. Placing Left Link: Extreme Left (Power Leg)
        // Optimized with $graphLookup
        const nodes = await Tree.aggregate([
            { $match: { userId: sponsorId } },
            {
                $graphLookup: {
                    from: 'trees',
                    startWith: '$leftDirectId',
                    connectFromField: 'leftDirectId',
                    connectToField: 'userId',
                    as: 'path',
                    maxDepth: 100
                }
            }
        ]);

        if (!nodes.length) throw new Error('Sponsor tree node not found');

        // Find the leaf node on the left path
        const pathNodes = nodes[0].path;
        const nodeMap = new Map(pathNodes.map(n => [n.userId, n]));

        let current = nodes[0];
        let safetyCounter = 0;
        while (current.leftDirectId && safetyCounter < 100) {
            const next = nodeMap.get(current.leftDirectId);
            if (!next) break; // Should not happen with graphLookup
            current = next;
            safetyCounter++;
        }
        return { parentId: current.userId, side: 'Left' };

    } else if (strategy === 'placing-right') {
        // 4. Placing Right Link: Extreme Right (Power Leg)
        // Optimized with $graphLookup
        const nodes = await Tree.aggregate([
            { $match: { userId: sponsorId } },
            {
                $graphLookup: {
                    from: 'trees',
                    startWith: '$rightDirectId',
                    connectFromField: 'rightDirectId',
                    connectToField: 'userId',
                    as: 'path',
                    maxDepth: 100
                }
            }
        ]);

        if (!nodes.length) throw new Error('Sponsor tree node not found');

        const pathNodes = nodes[0].path;
        const nodeMap = new Map(pathNodes.map(n => [n.userId, n]));

        let current = nodes[0];
        let safetyCounter = 0;
        while (current.rightDirectId && safetyCounter < 100) {
            const next = nodeMap.get(current.rightDirectId);
            if (!next) break;
            current = next;
            safetyCounter++;
        }
        return { parentId: current.userId, side: 'Right' };
    }

    throw new Error('Invalid placement strategy');
};

// HELPER: Bubble up counts (Increment) - Optimized with $graphLookup
const incrementUplineCounts = async (startUserId) => {
    try {
        const chain = await Tree.aggregate([
            { $match: { userId: startUserId } },
            {
                $graphLookup: {
                    from: 'trees',
                    startWith: '$parentId',
                    connectFromField: 'parentId',
                    connectToField: 'userId',
                    as: 'upline',
                    maxDepth: 100 // Reasonable limit
                }
            }
        ]);

        if (!chain.length || !chain[0].upline.length) return;

        const nodeMap = new Map(chain[0].upline.map(n => [n.userId, n]));
        const bulkOps = [];
        let currentId = startUserId;
        let SafetyCounter = 0;

        // Note: GraphLookup gives unordered results, we must traverse in memory using pointers
        let currentParentId = chain[0].parentId;
        while (currentParentId && SafetyCounter < 100) {
            const parent = nodeMap.get(currentParentId);
            if (!parent) break;

            if (parent.leftDirectId === currentId) {
                bulkOps.push({
                    updateOne: {
                        filter: { userId: currentParentId },
                        update: { $inc: { totalLeftMembers: 1 } }
                    }
                });
            } else if (parent.rightDirectId === currentId) {
                bulkOps.push({
                    updateOne: {
                        filter: { userId: currentParentId },
                        update: { $inc: { totalRightMembers: 1 } }
                    }
                });
            }

            currentId = currentParentId;
            currentParentId = parent.parentId;
            SafetyCounter++;
        }

        if (bulkOps.length > 0) {
            await Tree.bulkWrite(bulkOps);
            console.log(`[TREE] Upline increment optimized: ${bulkOps.length} nodes updated for ${startUserId}`);
        }
    } catch (err) {
        console.error('[TREE SERVICE] incrementUplineCounts Error:', err);
    }
};

// HELPER: Bubble down counts (Decrement) - Optimized
const decrementUplineCounts = async (startUserId) => {
    try {
        const chain = await Tree.aggregate([
            { $match: { userId: startUserId } },
            {
                $graphLookup: {
                    from: 'trees',
                    startWith: '$parentId',
                    connectFromField: 'parentId',
                    connectToField: 'userId',
                    as: 'upline',
                    maxDepth: 100
                }
            }
        ]);

        if (!chain.length || !chain[0].upline.length) return;

        const nodeMap = new Map(chain[0].upline.map(n => [n.userId, n]));
        const bulkOps = [];
        let currentId = startUserId;
        let currentParentId = chain[0].parentId;
        let Safety = 0;

        while (currentParentId && Safety < 100) {
            const parent = nodeMap.get(currentParentId);
            if (!parent) break;

            if (parent.leftDirectId === currentId) {
                bulkOps.push({
                    updateOne: {
                        filter: { userId: currentParentId },
                        update: { $inc: { totalLeftMembers: -1 } }
                    }
                });
            } else if (parent.rightDirectId === currentId) {
                bulkOps.push({
                    updateOne: {
                        filter: { userId: currentParentId },
                        update: { $inc: { totalRightMembers: -1 } }
                    }
                });
            }

            currentId = currentParentId;
            currentParentId = parent.parentId;
            Safety++;
        }

        if (bulkOps.length > 0) {
            await Tree.bulkWrite(bulkOps);
        }
    } catch (err) {
        console.error('[TREE SERVICE] decrementUplineCounts Error:', err);
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
    incrementUplineCounts,
    decrementUplineCounts,
    moveUserNode
};
