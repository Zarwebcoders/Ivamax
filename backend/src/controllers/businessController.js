const User = require('../models/User');
const Tree = require('../models/Tree');
const { RANK_STRUCTURE } = require('./rankController');

// @desc    Get direct referrals with complete information
// @route   GET /api/business/direct-referrals
// @access  Private
const getDirectReferrals = async (req, res) => {
    try {
        const userId = req.user.userId;

        // 1. Get current user's tree data for stats
        const userTree = await Tree.findOne({ userId });
        if (!userTree) {
            return res.json({
                success: true,
                data: {
                    stats: {
                        totalTeam: 0,
                        leftTeam: 0,
                        rightTeam: 0,
                        directReferrals: 0,
                        matchingPairs: 0
                    },
                    referrals: []
                }
            });
        }

        // 2. Calculate stats
        const leftTeam = userTree.totalLeftMembers || 0;
        const rightTeam = userTree.totalRightMembers || 0;
        const totalTeam = leftTeam + rightTeam;
        const matchingPairs = Math.min(userTree.totalLeftMembers || 0, userTree.totalRightMembers || 0);

        // 3. Find all direct referrals (where current user is parent)
        const directReferralTrees = await Tree.find({ parentId: userId });
        const referralIds = directReferralTrees.map(t => t.userId);

        // 4. Batch fetch all User details
        const referralUsers = await User.find({ userId: { $in: referralIds } });
        const userMap = new Map(referralUsers.map(u => [u.userId, u]));

        // 5. Format data
        const referralsData = directReferralTrees.map((tree) => {
            const user = userMap.get(tree.userId);
            if (!user) return null;

            // Determine side
            let side = 'Unknown';
            if (userTree.leftDirectId === tree.userId) side = 'Left';
            else if (userTree.rightDirectId === tree.userId) side = 'Right';

            const rankVal = user.currentRank || (parseInt(user.rank) || 0);
            const rankInfo = RANK_STRUCTURE[rankVal] || { name: 'Member', income: 0 };

            return {
                userId: user.userId,
                fullName: user.fullName,
                joinDate: user.createdAt,
                side: side,
                isActive: user.isActive || false,
                rank: rankInfo.name,
                leftPairs: tree.totalLeftMembers || 0,
                rightPairs: tree.totalRightMembers || 0,
                royaltyPercentage: rankInfo.income || 0
            };
        }).filter(Boolean);

        res.json({
            success: true,
            data: {
                stats: {
                    totalTeam,
                    leftTeam,
                    rightTeam,
                    directReferrals: referralsData.length,
                    matchingPairs
                },
                referrals: referralsData
            }
        });

    } catch (error) {
        console.error('Business Stats Error:', error);
        res.status(500).json({ message: 'Server error fetching business data' });
    }
};

module.exports = {
    getDirectReferrals
};
