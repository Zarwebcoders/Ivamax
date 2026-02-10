const User = require('../models/User');
const Tree = require('../models/Tree');

// Rank income table based on pairs
const RANK_INCOME = {
    1: { name: 'ASSOCIATE', income: 2.5 },
    2: { name: 'JN.EXECUTIVE', income: 5 },
    3: { name: 'SN. EXECUTIVE', income: 10 },
    4: { name: 'ASS. MANAGER', income: 20 },
    5: { name: 'MANAGER', income: 37.5 },
    6: { name: 'ASS. DIRECTOR', income: 75 },
    7: { name: 'DIRECTOR', income: 150 },
    8: { name: 'ASSO. PRESIDENT', income: 312.5 },
    9: { name: 'PRESIDENT', income: 625 },
    10: { name: 'CEO', income: 1250 },
    11: { name: 'FOUNDER', income: 2500 },
};

// Calculate user's rank based on pairs
const calculateUserRank = async (userId) => {
    try {
        const treeNode = await Tree.findOne({ userId });
        if (!treeNode) {
            return { rank: 0, pairs: 0, income: 0, rankName: 'Member', leftCount: 0, rightCount: 0 };
        }

        // Pairs = minimum of left and right members
        const pairs = Math.min(
            treeNode.totalLeftMembers || 0,
            treeNode.totalRightMembers || 0
        );

        // Rank is equal to pairs, capped at 11
        const rank = Math.min(pairs, 11);

        const rankData = RANK_INCOME[rank] || { name: 'Member', income: 0 };

        return {
            rank,
            pairs,
            income: rankData.income,
            rankName: rankData.name,
            leftCount: treeNode.totalLeftMembers || 0,
            rightCount: treeNode.totalRightMembers || 0,
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
    return RANK_INCOME[rank] || { name: 'Member', income: 0 };
};

// Get all ranks data
const getAllRanks = () => {
    return RANK_INCOME;
};

module.exports = {
    calculateUserRank,
    updateUserRank,
    getRankIncome,
    getAllRanks,
    RANK_INCOME,
};
