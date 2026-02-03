const User = require('../models/User');
const Tree = require('../models/Tree');
const { generateToken } = require('../utils/generateToken');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    let createdUser = null;
    try {
        const { fullName, mobile, email, password, referralId, walletAddress } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Generate auto User ID
        const userId = await User.generateUserId();

        // Check for orphaned Tree node and clean up if necessary (Self-healing)
        const orphanedTree = await Tree.findOne({ userId });
        if (orphanedTree) {
            console.log(`Found orphaned tree node for ${userId}. Cleaning up...`);
            await Tree.deleteOne({ userId });
        }

        // Validate referral ID if provided
        let referrer = null;
        if (referralId) {
            referrer = await User.findOne({ userId: referralId });
            if (!referrer) {
                return res.status(400).json({ message: 'Invalid referral ID' });
            }
        }

        // Create user
        createdUser = await User.create({
            userId,
            fullName,
            mobile,
            email,
            password,
            plainPassword: password, // Save plaintext password
            referralId: referralId || null,
            walletAddress: walletAddress || null,
        });

        // Create tree node for user
        const treeNode = await Tree.create({
            userId: createdUser.userId,
            parentId: referralId || null,
            level: referrer ? referrer.level + 1 : 0,
        });

        // If there's a referrer, update their tree
        if (referrer) {
            const referrerTree = await Tree.findOne({ userId: referralId });

            // Auto-placement logic: Place in left if empty, otherwise right
            if (!referrerTree.leftDirectId) {
                referrerTree.leftDirectId = userId;
                await User.findOneAndUpdate(
                    { userId },
                    { placementSide: 'Left' }
                );
            } else if (!referrerTree.rightDirectId) {
                referrerTree.rightDirectId = userId;
                await User.findOneAndUpdate(
                    { userId },
                    { placementSide: 'Right' }
                );
            }

            await referrerTree.save();
        }

        // Generate token
        const token = generateToken(createdUser.userId);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                userId: createdUser.userId,
                fullName: createdUser.fullName,
                email: createdUser.email,
                token,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);

        // Manual Rollback: If user was created but subsequent steps failed, delete the user
        if (createdUser) {
            console.log(`Rolling back user creation for ${createdUser.userId}`);
            await User.findByIdAndDelete(createdUser._id);
        }

        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { userId, password } = req.body;

        // Find user by userId or email
        const user = await User.findOne({
            $or: [
                { userId: userId },
                { email: userId },
                { email: userId.toLowerCase() } // Handle case-insensitive email
            ]
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is deactivated' });
        }

        // Generate token
        const token = generateToken(user.userId);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                userId: user.userId,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                token,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user.userId }).select('-password');

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Forgot password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate OTP (6 digits)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // In production, send OTP via email/SMS
        // For now, just return it (REMOVE IN PRODUCTION)
        console.log(`OTP for ${userId}: ${otp}`);

        res.json({
            success: true,
            message: 'OTP sent to registered email',
            otp: otp, // REMOVE IN PRODUCTION
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { userId, otp, newPassword } = req.body;

        // In production, verify OTP from database/cache
        // For now, skip OTP verification

        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successful',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
};
