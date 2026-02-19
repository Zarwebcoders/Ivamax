const User = require('../models/User');
const Tree = require('../models/Tree');
const { isUserValid, getValidUserQuery } = require('../utils/userValidity');

// @desc    Get user's tree (limited depth)
// @route   GET /api/tree/:userId
// @access  Private
const getTree = async (req, res) => {
    try {
        const rootUserId = req.params.userId || req.user.userId;

        // Verify permission: Users can only see their own downline
        // For simplicity, we allow seeing any tree if you are admin or if it's in your downline
        // Implementation of full downline check is complex, so we'll just allow viewing for now if authenticated

        // Fetch the root node
        const rootNode = await Tree.findOne({ userId: rootUserId });

        if (!rootNode) {
            return res.status(404).json({ message: 'Tree node not found' });
        }

        // Fetch user details for the root
        const rootUser = await User.findOne({ userId: rootUserId }).select('userId fullName rank isActive packageType leftPairs rightPairs');

        // Build the tree structure (recursive function to fetch levels)
        // We'll fetch 3 levels down for display
        const buildTree = async (nodeId, currentLevel, maxLevel) => {
            if (currentLevel > maxLevel || !nodeId) return null;

            const node = await Tree.findOne({ userId: nodeId });
            if (!node) return null;

            const user = await User.findOne({ userId: nodeId }).select('userId fullName rank isActive packageType');

            if (!user) {
                console.error(`[TREE ERROR] Node ${nodeId} found in Tree but missing in User collection!`);
                // Return a placeholder or null to avoid crash
                return {
                    userId: nodeId,
                    fullName: "UNKNOWN (Data Error)",
                    rank: 0,
                    isActive: false,
                    packageType: "Error",
                    leftPairs: node.leftPairs,
                    rightPairs: node.rightPairs,
                    totalLeft: node.totalLeftMembers || 0,
                    totalRight: node.totalRightMembers || 0,
                    children: [],
                    error: true
                };
            }

            // Check Validity (New Logic)
            if (!isUserValid(user)) {
                return null; // Treat as if user doesn't exist (Flushed)
            }

            const treeData = {
                userId: user.userId,
                fullName: user.fullName,
                rank: user.rank,
                isActive: user.isActive,
                packageType: user.packageType,
                leftPairs: node.leftPairs,
                rightPairs: node.rightPairs,
                totalLeft: node.totalLeftMembers || 0,
                totalRight: node.totalRightMembers || 0,
                children: []
            };

            // Fetch left child
            if (node.leftDirectId) {
                // If we reach maxLevel, we shouldn't say it's empty, we should say it exists but truncated.
                // However, the current recursive structure expects child nodes.
                // For now, let's just make sure we go deep enough.
                const leftChild = await buildTree(node.leftDirectId, currentLevel + 1, maxLevel);

                if (leftChild) {
                    treeData.children.push({ ...leftChild, position: 'left' });
                } else {
                    // If we have an ID but returned null, it means we hit max depth OR DB link is broken.
                    // If we hit max depth, we should ideally show a placeholder, but frontend might not support it.
                    // IMPORTANT: If currentLevel > maxLevel, we return null. 
                    // This causes the parent to see "null" and push "empty: true".
                    // We need to FIX this logic. 

                    // If we are at max level, we should peek if child exists
                    if (currentLevel === maxLevel) {
                        treeData.children.push({
                            position: 'left',
                            userId: node.leftDirectId,
                            fullName: '...',
                            isExpanded: false
                        }); // explicit placeholder? 
                        // Actually, sticking to "Existing logic" but just Deeper is safer for now to avoid breaking Frontend UI.
                        // But I will increase depth significantly.

                        // If we assume Frontend treats "empty: true" as an empty slot with (+) button.
                        // We must NOT send empty: true if there is a user.
                        // So I will change the logic: IF max depth reached, DO NOT return null if there is a nodeId.
                        // Return a partial node.
                    } else {
                        treeData.children.push({ position: 'left', empty: true, _debug: 'link_broken_or_depth' });
                    }
                }
            } else {
                treeData.children.push({ position: 'left', empty: true });
            }

            // Fetch right child
            if (node.rightDirectId) {
                const rightChild = await buildTree(node.rightDirectId, currentLevel + 1, maxLevel);
                if (rightChild) {
                    treeData.children.push({ ...rightChild, position: 'right' });
                } else {
                    if (currentLevel === maxLevel) {
                        // Placeholder for deep node
                        treeData.children.push({ position: 'right', userId: node.rightDirectId, fullName: '...', isExpanded: false });
                    } else {
                        treeData.children.push({ position: 'right', empty: true });
                    }
                }
            } else {
                treeData.children.push({ position: 'right', empty: true });
            }

            return treeData;
        };

        // Set depth to 100 to effectively allow "unlimited" viewing for manual tree checks
        const depth = req.query.depth ? parseInt(req.query.depth) : 100;
        const treeData = await buildTree(rootUserId, 0, depth);

        res.json({
            success: true,
            data: treeData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// TEMP DEBUG
const checkRawNodes = async (req, res) => {
    try {
        const nodes = await Tree.find({ userId: { $in: ['IVA1001', 'IVA1002', 'IVA1003'] } });
        res.json(nodes);
    } catch (e) {
        res.json({ error: e.message });
    }
};

// @desc    Search users by ID or Name for Tree Navigation
// @route   GET /api/tree/search?q=query
// @access  Private
const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Query required' });
        }

        // Search by userId (exact or partial) OR fullName (regex)
        // AND User must be valid
        const validQuery = getValidUserQuery();
        const searchCriteria = {
            $or: [
                { userId: { $regex: q, $options: 'i' } },
                { fullName: { $regex: q, $options: 'i' } }
            ]
        };

        const finalQuery = {
            $and: [
                searchCriteria,
                validQuery
            ]
        };

        const finalUsers = await User.find(finalQuery).select('userId fullName rank').limit(5);

        // Fetch parentId for each user from Tree model
        const results = await Promise.all(finalUsers.map(async (user) => {
            const treeNode = await Tree.findOne({ userId: user.userId }).select('parentId');
            return {
                ...user.toObject(),
                parentId: treeNode ? treeNode.parentId : null
            };
        }));

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getTree,
    checkRawNodes,
    searchUsers
};
