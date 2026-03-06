const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User',
        index: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    transactionHash: {
        type: String,
        required: true,
        unique: true,
    },
    packageId: {
        type: String,
        required: true,
    },
    packageName: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true,
    },
    type: {
        type: String,
        enum: ['manual', 'auto'],
        default: 'manual',
    },
    adminNotes: {
        type: String,
        default: '',
    },
    processedBy: {
        type: String,
        ref: 'User',
        default: null,
    },
    processedDate: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Deposit', depositSchema);
