const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User',
        index: true,
    },
    requestDate: {
        type: Date,
        default: Date.now,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true,
    },
    method: {
        type: String,
        default: 'USDT (BEP-20)',
    },
    payableAmount: {
        type: Number,
        default: 0,
    },
    walletAddress: {
        type: String,
        required: true,
    },
    adminNotes: {
        type: String,
        default: '',
    },
    processedDate: {
        type: Date,
        default: null,
    },
    transactionHash: {
        type: String,
        default: null,
    },
    processedBy: {
        type: String,
        ref: 'User',
        default: null,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
