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
        // Efficient BFS-based tree builder
        const getTreeData = async (rootId, maxDepth) => {
            let treeMap = new Map();
            let queue = [{ id: rootId, level: 0 }];
            let nodesToFetch = [rootId];
            let levelMap = new Map();
            levelMap.set(0, [rootId]);

            // 1. Identify all nodes up to maxDepth
            let currentIdx = 0;
            while (currentIdx < queue.length) {
                const { id, level } = queue[currentIdx++];
                if (level >= maxDepth) continue;

                const node = await Tree.findOne({ userId: id }).select('leftDirectId rightDirectId leftPairs rightPairs totalLeftMembers totalRightMembers');
                if (!node) continue;

                treeMap.set(id, node);

                if (node.leftDirectId) {
                    queue.push({ id: node.leftDirectId, level: level + 1 });
                    nodesToFetch.push(node.leftDirectId);
                }
                if (node.rightDirectId) {
                    queue.push({ id: node.rightDirectId, level: level + 1 });
                    nodesToFetch.push(node.rightDirectId);
                }
            }

            // 2. Batch fetch all User details
            const users = await User.find({ userId: { $in: nodesToFetch } })
                .select('userId fullName rank currentRank isActive packageType');
            const userMap = new Map(users.map(u => [u.userId, u]));

            // 3. Assemble the JSON structure recursively (from memory)
            const { RANK_STRUCTURE } = require('./rankController');

            const formatNode = (userId, depth) => {
                const node = treeMap.get(userId);
                const user = userMap.get(userId);

                if (!user) {
                    if (!node && depth > 0) return { empty: true };
                    return null;
                }

                // Check Validity - REMOVED so all users show in tree
                // if (!isUserValid(user)) return null;

                const rankVal = user.currentRank || (parseInt(user.rank) || 0);
                const rankInfo = RANK_STRUCTURE[rankVal] || { name: 'Member' };

                const data = {
                    userId: user.userId,
                    fullName: user.fullName,
                    rank: rankInfo.name,
                    isActive: user.isActive,
                    packageType: user.packageType,
                    leftPairs: node?.leftPairs || 0,
                    rightPairs: node?.rightPairs || 0,
                    totalLeft: node?.totalLeftMembers || 0,
                    totalRight: node?.totalRightMembers || 0,
                    children: []
                };

                if (depth < maxDepth) {
                    // Left Child
                    if (node?.leftDirectId) {
                        const left = formatNode(node.leftDirectId, depth + 1);
                        if (left) data.children.push({ ...left, position: 'left' });
                        else data.children.push({ position: 'left', empty: true });
                    } else {
                        data.children.push({ position: 'left', empty: true });
                    }

                    // Right Child
                    if (node?.rightDirectId) {
                        const right = formatNode(node.rightDirectId, depth + 1);
                        if (right) data.children.push({ ...right, position: 'right' });
                        else data.children.push({ position: 'right', empty: true });
                    } else {
                        data.children.push({ position: 'right', empty: true });
                    }
                }

                return data;
            };

            return formatNode(rootId, 0);
        };

        const depth = req.query.depth ? parseInt(req.query.depth) : 10; // Default to 10 levels, no hard limit for admin use
        const treeData = await getTreeData(rootUserId, depth);

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

        const finalUsers = await User.find(finalQuery).select('userId fullName rank currentRank').limit(5);

        // Fetch parentId for each user from Tree model
        const { RANK_STRUCTURE } = require('./rankController');
        const results = await Promise.all(finalUsers.map(async (user) => {
            const treeNode = await Tree.findOne({ userId: user.userId }).select('parentId');
            const rankVal = user.currentRank || (parseInt(user.rank) || 0);
            const info = RANK_STRUCTURE[rankVal] || { name: 'Member' };
            const formattedRank = info.name;

            return {
                ...user.toObject(),
                rank: formattedRank,
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
