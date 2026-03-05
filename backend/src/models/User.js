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

    referralId: {
        type: String,
        default: null,
        index: true
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
        index: true,
    },
    placementSide: {
        type: String,
        enum: ['Left', 'Right', null],
        default: null,
    },
    rank: {
        type: String,
        default: 'No Rank',
    },
    closingRank: {
        type: String,
        default: 'No Rank',
    },
    royaltyPercentage: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: false,
        index: true,
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
    walletAddressTRC20: {
        type: String,
        default: '',
    },
    walletAddressBEP20: {
        type: String,
        default: '',
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

// Generate Random Unique User ID (static method)
userSchema.statics.generateUserId = async function () {
    let isUnique = false;
    let newUserId = '';

    // Loop until we find a unique ID
    while (!isUnique) {
        // Generate random number between 1000 and 9999
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        newUserId = `IVA${randomNum}`;

        // Check if this ID already exists
        const existingUser = await this.findOne({ userId: newUserId });
        if (!existingUser) {
            isUnique = true;
        }
    }
    return newUserId;
};

module.exports = mongoose.model('User', userSchema);
