const User = require('../models/User');
const Tree = require('../models/Tree');

// Rank structure based on 1:1 ratio (Left = Right) and Total ID
const RANK_STRUCTURE = {
    1: { name: 'ASSOCIATE', left: 1, right: 1, totalId: 2, income: 2.5 },
    2: { name: 'JN. EXECUTIVE', left: 2, right: 2, totalId: 4, income: 5 },
    3: { name: 'SN. EXECUTIVE', left: 4, right: 4, totalId: 8, income: 10 },
    4: { name: 'ASS. MANAGER', left: 8, right: 8, totalId: 16, income: 20 },
    5: { name: 'MANAGER', left: 16, right: 16, totalId: 32, income: 37.5 },
    6: { name: 'ASS. DIRECTOR', left: 32, right: 32, totalId: 64, income: 75 },
    7: { name: 'PRESIDENT', left: 64, right: 64, totalId: 128, income: 150 },
    8: { name: 'ASSO. PRESIDENT', left: 128, right: 128, totalId: 256, income: 312.5 },
    9: { name: 'DIRECTOR', left: 256, right: 256, totalId: 512, income: 625 },
    10: { name: 'CEO', left: 512, right: 512, totalId: 1024, income: 1250 },
    11: { name: 'FOUNDER', left: 1024, right: 1024, totalId: 2048, income: 2500 },
};

// Calculate user's rank based on 1:1 ratio and total ID
const calculateUserRank = async (userId) => {
    try {
        const treeNode = await Tree.findOne({ userId });
        if (!treeNode) {
            return {
                rank: 0,
                income: 0,
                rankName: 'Member',
                leftCount: 0,
                rightCount: 0,
                totalId: 0,
                qualified: false
            };
        }

        const leftCount = treeNode.totalLeftMembers || 0;
        const rightCount = treeNode.totalRightMembers || 0;
        const totalId = leftCount + rightCount;

        // Check ranks from highest to lowest
        let achievedRank = 0;
        let rankData = { name: 'Member', income: 0 };

        for (let rank = 11; rank >= 1; rank--) {
            const requirement = RANK_STRUCTURE[rank];

            // Check if user meets the requirements for this rank
            if (leftCount >= requirement.left &&
                rightCount >= requirement.right &&
                totalId >= requirement.totalId) {
                achievedRank = rank;
                rankData = requirement;
                break;
            }
        }

        return {
            rank: achievedRank,
            income: rankData.income,
            rankName: rankData.name,
            leftCount,
            rightCount,
            totalId,
            qualified: achievedRank > 0,
            nextRank: achievedRank < 11 ? RANK_STRUCTURE[achievedRank + 1] : null,
        };
    } catch (error) {
        console.error('Error calculating rank:', error);
        throw error;
    }
};

// Update user's rank in database
const updateUserRank = async (userId) => {
    try {
        const rankData = await calculateUserRank(userId);

        await User.updateOne(
            { userId },
            {
                currentRank: rankData.rank,
                rank: rankData.rankName,
            }
        );

        return rankData;
    } catch (error) {
        console.error('Error updating rank:', error);
        throw error;
    }
};

// Get rank income for a specific rank number
const getRankIncome = (rank) => {
    return RANK_STRUCTURE[rank] || { name: 'Member', income: 0, left: 0, right: 0, totalId: 0 };
};

// Get all ranks data
const getAllRanks = () => {
    return RANK_STRUCTURE;
};

module.exports = {
    calculateUserRank,
    updateUserRank,
    getRankIncome,
    getAllRanks,
    RANK_STRUCTURE,
};
