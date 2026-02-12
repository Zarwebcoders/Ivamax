const express = require('express');
const router = express.Router();
const { autoCalculateAndCreditIncome } = require('../services/autoIncomeService');
const User = require('../models/User');

// Test endpoint to trigger income calculation manually
router.post('/trigger-income', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        console.log(`🧪 TEST TRIGGER: Calculating income for ${userId}...`);

        const result = await autoCalculateAndCreditIncome(userId, 'manual_test');

        res.json({
            success: true,
            message: 'Income calculation triggered successfully',
            result
        });
    } catch (error) {
        console.error('Test Trigger Error:', error);
        res.status(500).json({
            message: 'Failed to trigger income',
            error: error.message
        });
    }
});

// NEW: Test endpoint to set user rank for testing
router.post('/set-rank', async (req, res) => {
    try {
        const { userId, rankNumber } = req.body;

        if (!userId || rankNumber === undefined) {
            return res.status(400).json({ message: 'userId and rankNumber are required' });
        }

        // Rank mapping
        const RANK_NAMES = {
            0: 'Member',
            1: 'ASSOCIATE',
            2: 'JN. EXECUTIVE',
            3: 'SN. EXECUTIVE',
            4: 'ASS. MANAGER',
            5: 'MANAGER',
            6: 'ASS. DIRECTOR',
            7: 'PRESIDENT',
            8: 'ASSO. PRESIDENT',
            9: 'DIRECTOR',
            10: 'CEO',
            11: 'FOUNDER'
        };

        const rankName = RANK_NAMES[rankNumber] || 'Member';

        await User.updateOne(
            { userId },
            {
                currentRank: rankNumber,
                rank: rankName
            }
        );

        console.log(`✅ Updated ${userId}: currentRank=${rankNumber}, rank=${rankName}`);

        res.json({
            success: true,
            message: 'Rank updated successfully',
            userId,
            currentRank: rankNumber,
            rank: rankName
        });
    } catch (error) {
        console.error('Set Rank Error:', error);
        res.status(500).json({
            message: 'Failed to set rank',
            error: error.message
        });
    }
});

const Income = require('../models/Income');

// NEW: Check income records for a user
router.get('/income-check/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const incomes = await Income.find({ userId });

        const agg = await Income.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: '$incomeType',
                    total: { $sum: '$netAmount' }
                }
            }
        ]);

        res.json({
            success: true,
            count: incomes.length,
            aggregation: agg,
            records: incomes.map(inc => ({
                type: inc.incomeType,
                amount: inc.netAmount,
                status: inc.status,
                month: inc.month,
                year: inc.year
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
