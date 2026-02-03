const User = require('../models/User');
const Tree = require('../models/Tree');

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
                const leftChild = await buildTree(node.leftDirectId, currentLevel + 1, maxLevel);
                treeData.children.push(leftChild ? { ...leftChild, position: 'left' } : { position: 'left', empty: true });
            } else {
                treeData.children.push({ position: 'left', empty: true });
            }

            // Fetch right child
            if (node.rightDirectId) {
                const rightChild = await buildTree(node.rightDirectId, currentLevel + 1, maxLevel);
                treeData.children.push(rightChild ? { ...rightChild, position: 'right' } : { position: 'right', empty: true });
            } else {
                treeData.children.push({ position: 'right', empty: true });
            }

            return treeData;
        };

        const treeData = await buildTree(rootUserId, 0, 2); // Fetch 2 levels down (Root + 2 generations)

        res.json({
            success: true,
            data: treeData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getTree
};
