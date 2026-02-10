const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['news', 'announcement', 'update'],
        required: true,
        default: 'announcement'
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    priority: {
        type: Number,
        default: 1,
        min: 1,
        max: 10
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
announcementSchema.index({ isActive: 1, priority: -1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
