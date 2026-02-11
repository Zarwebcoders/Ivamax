const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User',
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'REGISTRATION',
            'RANK_ACHIEVED',
            'PAYMENT_RELEASED',
            'PACKAGE_ACTIVATED',
            'NEW_TEAM_MEMBER',
            'DIRECT_REFERRAL',
            'PAYMENT_GENERATED',
            'WITHDRAWAL_REQUEST',
            'WITHDRAWAL_RELEASED',
            'INQUIRY_CREATED',
            'INQUIRY_RESOLVED',
            'COMPANY_UPDATE',
            'PROFILE_UPDATED'
        ],
        index: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: 'Bell'
    },
    color: {
        type: String,
        enum: ['green', 'blue', 'golden', 'orange', 'purple', 'red', 'gray'],
        default: 'blue'
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    link: {
        type: String,
        default: null
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

// Auto-delete old notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

module.exports = mongoose.model('Notification', notificationSchema);
