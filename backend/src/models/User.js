const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: false, // TEMPORARY: Changed for testing
        lowercase: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
    },
    plainPassword: {
        type: String, // Storing plaintext password as requested (Not recommended for production)
        required: false,
    },

    referralLink: {
        type: String,
        default: null,
    },
    registrationDate: {
        type: Date,
        default: Date.now,
    },
    investmentAmount: {
        type: Number,
        default: 0,
    },
    investmentDate: {
        type: Date,
        default: null,
    },
    packageType: {
        type: String,
        default: null,
    },
    placementSide: {
        type: String,
        enum: ['Left', 'Right', null],
        default: null,
    },
    rank: {
        type: String,
        default: 'Member',
    },
    closingRank: {
        type: String,
        default: 'Member',
    },
    royaltyPercentage: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    currentRank: {
        type: Number,
        default: 0,
        min: 0,
        max: 11,
    },
    monthlyIncome: {
        type: Number,
        default: 0,
    },
    totalEarnings: {
        type: Number,
        default: 0,
    },
    walletBalance: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate auto User ID (static method)
userSchema.statics.generateUserId = async function () {
    const lastUser = await this.findOne().sort({ createdAt: -1 });
    if (!lastUser) {
        return 'IVA1001';
    }
    const lastId = parseInt(lastUser.userId.replace('IVA', ''));
    const newId = lastId + 1;
    return `IVA${newId}`;
};

module.exports = mongoose.model('User', userSchema);
