const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User',
        index: true,
    },
    walletAddress: {
        type: String,
        required: true,
        unique: true,
    },
    connectionStatus: {
        type: String,
        enum: ['connected', 'disconnected', 'pending_change'],
        default: 'connected',
    },
    connectionDate: {
        type: Date,
        default: Date.now,
    },
    changeRequests: [{
        oldWalletAddress: String,
        newWalletAddress: String,
        requestDate: Date,
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        adminNotes: String,
        processedDate: Date,
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Wallet', walletSchema);
