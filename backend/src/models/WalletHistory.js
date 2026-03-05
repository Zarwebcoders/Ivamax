const mongoose = require('mongoose');

const walletHistorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User',
        index: true,
    },
    address: {
        type: String,
        required: true,
    },
    network: {
        type: String,
        enum: ['TRC20', 'BEP20'],
        required: true,
    },
    action: {
        type: String,
        default: 'Updated',
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('WalletHistory', walletHistorySchema);
