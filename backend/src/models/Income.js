const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User',
        index: true,
    },
    incomeType: {
        type: String,
        enum: ['PMR', 'DRR', 'FCR'],
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
        index: true,
    },
    leftCount: {
        type: Number,
        default: 0,
    },
    rightCount: {
        type: Number,
        default: 0,
    },
    royaltyAmount: {
        type: Number,
        required: true,
    },
    adminCharges: {
        type: Number,
        default: 0,
    },
    tokenAmount: {
        type: Number,
        default: 0,
    },
    netAmount: {
        type: Number,
        required: true,
    },
    rank: {
        type: String,
        default: 'Member',
    },
    status: {
        type: String,
        enum: ['pending', 'processed', 'paid'],
        default: 'pending',
    },
    month: {
        type: Number,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    metadata: {
        pairs: Number,
        leftCount: Number,
        rightCount: Number,
        referralDetails: [{
            userId: String,
            rank: Number,
            income: Number,
        }],
        founderMembers: [String],
    },
    processedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Index for efficient querying
incomeSchema.index({ userId: 1, incomeType: 1, date: -1 });
incomeSchema.index({ userId: 1, month: 1, year: 1 });

module.exports = mongoose.model('Income', incomeSchema);
