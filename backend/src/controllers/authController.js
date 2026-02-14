const User = require('../models/User');
const Tree = require('../models/Tree');
const { generateToken } = require('../utils/generateToken');
const { findPlacement, updateUplineCounts } = require('../services/treeService');


// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { fullName, mobile, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // =========================================================
        // 1. REFERRAL LINK PARSING
        // =========================================================
        let referrerId = req.body.referrerId || null;
        let placementStrategy = req.body.placementSide ? req.body.placementSide.toLowerCase() : null; // left, right, placing-left, placing-right

        // If data not in body, try to parse from `referralLink` string if provided
        if ((!referrerId || !placementStrategy) && req.body.referralLink) {
            try {
                let link = req.body.referralLink.trim();
                // Simple check if it's just an ID
                if (link.match(/^IVA\d+$/i)) {
                    if (!referrerId) referrerId = link.toUpperCase();
                } else {
                    // It's a URL
                    if (!link.startsWith('http')) {
                        link = `http://dummy.com/${link.startsWith('/') ? '' : '/'}${link}`;
                    }
                    const urlObj = new URL(link);
                    if (!referrerId) referrerId = urlObj.searchParams.get('ref');

                    // Only map strategy if not explicitly provided
                    if (!placementStrategy) {
                        const strategies = ['left', 'right', 'placing-left', 'placing-right'];
                        const pos = urlObj.searchParams.get('position')?.toLowerCase();
                        if (strategies.includes(pos)) {
                            placementStrategy = pos;
                        }
                    }
                }
            } catch (e) {
                console.log('Link parse error:', e);
            }
        }

        // Defaults if parsing failed or partial info
        if (!referrerId) {
            referrerId = 'IVA1001'; // Default Admin/Root if no referrer
        }
        // If strategy logic is missing, default to 'left' or 'placing-left'?? 
        // For now, if no strategy, we can't place in binary tree properly. 
        // But let's assume 'placing-left' (spillover) is the safest default if they just have a generic link.
        // Verify Referrer Exists
        const referrerUser = await User.findOne({ userId: referrerId });
        if (!referrerUser) {
            return res.status(400).json({ message: 'Invalid Referral ID' });
        }

        // If strategy not explicitly provided, default to 'placing-left' (Spillover Left)
        if (!placementStrategy) {
            placementStrategy = 'placing-left';
        }

        // =========================================================
        // 2. FIND TREE PLACEMENT
        // =========================================================
        console.log(`[DEBUG] Finding placement for Sponsor=${referrerId} using Strategy=${placementStrategy}`);

        let placementInfo;
        try {
            placementInfo = await findPlacement(referrerId, placementStrategy);
        } catch (err) {
            console.error('[DEBUG] findPlacement Error:', err.message);
            return res.status(400).json({ message: err.message });
        }

        const { parentId, side } = placementInfo; // side is 'Left' or 'Right'
        console.log(`[DEBUG] Placement Result: Parent=${parentId}, Side=${side}`);

        if (!parentId) {
            console.error('[CRITICAL] Calculated ParentID is null/undefined!');
            return res.status(500).json({ message: 'Failed to calculate parent placement' });
        }

        //Double check parent truly exists in Tree (findPlacement checks it, but good to be sure)
        const parentTree = await Tree.findOne({ userId: parentId });
        if (!parentTree) {
            console.error(`[CRITICAL] Parent Node ${parentId} not found in DB!`);
            return res.status(500).json({ message: 'Parent position missing in tree' });
        }

        // =========================================================
        // 3. CREATE DATA
        // =========================================================

        // Generate new User ID
        const newUserId = await User.generateUserId();

        // Create User
        const newUser = await User.create({
            userId: newUserId,
            fullName,
            mobile,
            email,
            password,
            plainPassword: password,
            referralId: referrerId, // The Sponsor
            referralLink: req.body.referralLink || null,
            placementSide: side, // Actual side they ended up on
            role: 'user'
        });

        // Calculate Level
        const newLevel = parentTree.level + 1;

        console.log(`[DEBUG] Creating Tree Node: User=${newUserId}, Parent=${parentId}, Level=${newLevel}`);

        // Create Tree Node
        const newTree = await Tree.create({
            userId: newUserId,
            parentId: String(parentId), // Explicitly cast to string to be safe
            level: newLevel,
            leftDirectId: null,
            rightDirectId: null,
        });

        console.log('[DEBUG] Tree Node Created:', newTree);

        // =========================================================
        // 4. UPDATE PARENT CONNECTIONS
        // =========================================================

        if (side === 'Left') {
            // Validate race condition again
            const freshParent = await Tree.findOne({ userId: parentId });
            if (freshParent.leftDirectId) {
                console.error(`[CRITICAL] Race condition on ${parentId} Left`);
                await User.deleteOne({ _id: newUser._id });
                await Tree.deleteOne({ _id: newTree._id });
                return res.status(409).json({ message: 'Placement spot taken during processing. Please try again.' });
            }

            freshParent.leftDirectId = newUserId;
            await freshParent.save();
            console.log(`[DEBUG] Updated Parent ${parentId} LeftDirectId to ${newUserId}`);

        } else { // Right
            const freshParent = await Tree.findOne({ userId: parentId });
            if (freshParent.rightDirectId) {
                console.error(`[CRITICAL] Race condition on ${parentId} Right`);
                await User.deleteOne({ _id: newUser._id });
                await Tree.deleteOne({ _id: newTree._id });
                return res.status(409).json({ message: 'Placement spot taken during processing. Please try again.' });
            }

            freshParent.rightDirectId = newUserId;
            await freshParent.save();
            console.log(`[DEBUG] Updated Parent ${parentId} RightDirectId to ${newUserId}`);
        }

        // =========================================================
        // 5. UPDATE UPLINE COUNTS (BUBBLE UP)
        // =========================================================
        try {
            await updateUplineCounts(newUserId);
            console.log(`[SUCCESS] Upline counts updated for ${newUserId}`);
        } catch (err) {
            console.error('[WARNING] Failed to update upline counts:', err);
            // Don't fail registration for this, but log it
        }

        // =========================================================
        // 6. AUTO-CALCULATE INCOME FOR REFERRER AND UPLINE
        // =========================================================
        try {
            const { autoCalculateIncomeForReferrer, autoCalculateIncomeForUpline } = require('../services/autoIncomeService');

            // Calculate income for direct referrer
            if (referrerId) {
                console.log(`[AUTO-INCOME] Triggering income calculation for referrer: ${referrerId}`);
                await autoCalculateIncomeForReferrer(referrerId);
            }

            // Calculate income for entire upline
            console.log(`[AUTO-INCOME] Triggering income calculation for upline of: ${newUserId}`);
            await autoCalculateIncomeForUpline(newUserId);

            console.log(`[SUCCESS] Auto-income calculation completed for ${newUserId}`);
        } catch (err) {
            console.error('[WARNING] Failed to auto-calculate income:', err);
            // Don't fail registration for this, but log it
        }

        // =========================================================
        // 7. CREATE WELCOME NOTIFICATION
        // =========================================================
        try {
            const { createNotification } = require('./notificationController');
            await createNotification({
                userId: newUserId,
                type: 'REGISTRATION',
                title: 'Welcome to IVAMAX!',
                message: `Registration successful! Your ID: ${newUserId}. Start building your network today.`
            });

            // Notify referrer about new team member
            if (referrerId) {
                await createNotification({
                    userId: referrerId,
                    type: 'NEW_TEAM_MEMBER',
                    title: 'New Team Member!',
                    message: `${fullName} (${newUserId}) joined your team on ${placementStrategy} side.`,
                    link: '/tree'
                });
            }
        } catch (err) {
            console.error('[WARNING] Failed to create notifications:', err);
        }

        console.log(`[SUCCESS] Registration Complete for ${newUserId}`);

        res.status(201).json({
            _id: newUser._id,
            userId: newUser.userId,
            fullName: newUser.fullName,
            email: newUser.email,
            token: generateToken(newUser.userId),
            treeData: newTree
        });

    } catch (error) {
        console.error('Registration Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'User already exists' });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
};



// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { userId, password } = req.body;

        // Check if input is empty
        if (!userId || !password) {
            return res.status(400).json({ message: 'Please provide User ID/Email and password' });
        }

        // Check if input is email or userId
        const isEmail = userId.includes('@');
        const query = isEmail ? { email: userId } : { userId: userId };

        const user = await User.findOne(query);

        if (user && (await user.comparePassword(password))) {
            if (!user.isActive) {
                return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
            }

            const treeNode = await Tree.findOne({ userId: user.userId });
            res.json({
                _id: user._id,
                userId: user.userId,
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile,
                token: generateToken(user.userId),
                role: user.role,
                treeData: treeNode
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get current user profile
// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        // Get sponsher information from Tree
        const treeNode = await Tree.findOne({ userId: user.userId });
        let sponsherData = {
            sponsherId: null,
            sponsherUsername: null
        };

        if (treeNode && treeNode.parentId) {
            const sponsher = await User.findOne({ userId: treeNode.parentId }).select('userId fullName');
            if (sponsher) {
                sponsherData.sponsherId = sponsher.userId;
                sponsherData.sponsherUsername = sponsher.fullName;
            }
        }

        res.json({
            success: true,
            data: {
                ...user.toObject(),
                ...sponsherData
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.fullName = req.body.fullName || user.fullName;
            user.mobile = req.body.mobile || user.mobile;
            user.walletAddress = req.body.walletAddress || user.walletAddress;

            // Bank Details
            if (req.body.bankName) user.bankName = req.body.bankName;
            if (req.body.accountNumber) user.accountNumber = req.body.accountNumber;
            if (req.body.ifscCode) user.ifscCode = req.body.ifscCode;

            // Password update (if provided)
            if (req.body.password) {
                user.password = req.body.password;
                user.plainPassword = req.body.password; // Sync plain
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                userId: updatedUser.userId,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                mobile: updatedUser.mobile,
                token: generateToken(updatedUser._id),
                role: updatedUser.role,
                walletAddress: updatedUser.walletAddress,
                bankName: updatedUser.bankName,
                accountNumber: updatedUser.accountNumber,
                ifscCode: updatedUser.ifscCode
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
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
    updateProfile,
    forgotPassword,
    resetPassword,
};
