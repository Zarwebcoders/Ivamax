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

        // 4. Get detailed information for each referral
        const referralsData = await Promise.all(
            directReferralTrees.map(async (tree) => {
                const user = await User.findOne({ userId: tree.userId });
                if (!user) return null;

                // Determine side (left or right)
                let side = 'Unknown';
                if (userTree.leftDirectId === tree.userId) {
                    side = 'Left';
                } else if (userTree.rightDirectId === tree.userId) {
                    side = 'Right';
                }

                // Get rank info
                const rankInfo = RANK_STRUCTURE[user.currentRank || 0] || { name: 'Member', income: 0 };

                return {
                    userId: user.userId,
                    fullName: user.fullName,
                    joinDate: user.createdAt,
                    side: side,
                    isActive: user.isActive || false,
                    rank: (() => {
                        const rankVal = user.currentRank || (parseInt(user.rank) || 0);
                        const info = RANK_STRUCTURE[rankVal] || { name: 'Member' };
                        return rankVal > 0 ? `${rankVal} (${info.name})` : `0 (Member)`;
                    })(),
                    leftPairs: tree.totalLeftMembers || 0,
                    rightPairs: tree.totalRightMembers || 0,
                    royaltyPercentage: rankInfo.income || 0
                };
            })
        );

        // Filter out null values
        const validReferrals = referralsData.filter(ref => ref !== null);

        res.json({
            success: true,
            data: {
                stats: {
                    totalTeam,
                    leftTeam,
                    rightTeam,
                    directReferrals: validReferrals.length,
                    matchingPairs
                },
                referrals: validReferrals
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
