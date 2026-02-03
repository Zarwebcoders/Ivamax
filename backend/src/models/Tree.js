const mongoose = require('mongoose');

const treeSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        ref: 'User',
        index: true,
    },
    parentId: {
        type: String,
        ref: 'User',
        default: null,
    },
    leftDirectId: {
        type: String,
        ref: 'User',
        default: null,
    },
    rightDirectId: {
        type: String,
        ref: 'User',
        default: null,
    },
    leftPairs: {
        type: Number,
        default: 0,
    },
    rightPairs: {
        type: Number,
        default: 0,
    },
    leftSTI: {
        type: Number,
        default: 0,
    },
    rightSTI: {
        type: Number,
        default: 0,
    },
    matchingCompleted: {
        type: Number,
        default: 0,
    },
    level: {
        type: Number,
        default: 0,
    },
    totalLeftMembers: {
        type: Number,
        default: 0,
    },
    totalRightMembers: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Method to calculate pairs
treeSchema.methods.calculatePairs = function () {
    return Math.min(this.leftPairs, this.rightPairs);
};

// Method to update STI (Side Total Income)
treeSchema.methods.updateSTI = async function (side, amount) {
    if (side === 'Left') {
        this.leftSTI += amount;
    } else if (side === 'Right') {
        this.rightSTI += amount;
    }
    await this.save();
};

module.exports = mongoose.model('Tree', treeSchema);
