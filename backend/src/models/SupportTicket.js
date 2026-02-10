const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    userEmail: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['inquiry', 'complaint', 'support'],
        lowercase: true
    },
    subject: {
        type: String,
        required: true,
        enum: ['access', 'password', 'account_change', 'technical', 'general'],
        lowercase: true
    },
    priority: {
        type: String,
        required: true,
        enum: ['high', 'medium', 'low'],
        lowercase: true,
        default: 'medium'
    },
    message: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open'
    },
    assignedTo: {
        type: String,
        ref: 'User',
        default: null
    },
    adminNotes: {
        type: String,
        default: ''
    },
    resolvedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Generate ticket ID before saving
supportTicketSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose.model('SupportTicket').countDocuments();
        this.ticketId = `TKT${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

// Index for faster queries
supportTicketSchema.index({ userId: 1, createdAt: -1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ type: 1 });
supportTicketSchema.index({ priority: 1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
