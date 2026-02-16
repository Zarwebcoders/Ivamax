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

        // Check if user already exists (Allow up to 5 accounts per email/mobile as per BRP DESHBOARD POINTS)
        const emailCount = await User.countDocuments({ email });
        if (emailCount >= 5) {
            return res.status(400).json({ message: 'Maximum 5 accounts allowed per email address' });
        }

        const mobileCount = await User.countDocuments({ mobile });
        if (mobileCount >= 5) {
            return res.status(400).json({ message: 'Maximum 5 accounts allowed per mobile number' });
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

        // =========================================================
        // 8. SEND WELCOME EMAIL
        // =========================================================
        try {
            const sendEmail = require('../utils/sendEmail');
            const htmlContent = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
                    
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%); text-align: center; padding: 40px 20px;">
                       <h1 style="color: #FFD700; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">Welcome, ${fullName}!</h1>
                    </div>

                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <p style="font-size: 16px; color: #4a5568; margin-bottom: 24px;">Dear <strong>${fullName}</strong>,</p>
                        
                        <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin-bottom: 32px;">
                            We are thrilled to examine your registration with <strong>IVAMAX</strong>. Your account has been successfully created, and you are now ready to start your journey with us.
                        </p>

                        <!-- Warning Box -->
                        <div style="background-color: #fff5f5; border: 1px solid #fc8181; border-radius: 8px; padding: 16px; margin-bottom: 32px; text-align: center;">
                            <p style="color: #c53030; font-weight: bold; margin: 0; font-size: 14px;">
                                ⚠️ IMPORTANT WARNING
                            </p>
                            <p style="color: #742a2a; margin-top: 8px; font-size: 14px;">
                                Please login to your account within <strong>24 hours</strong> to complete activation. <br/>
                                Accounts not accessed within this timeframe may be automatically deleted for security reasons.
                            </p>
                        </div>

                        <!-- Credentials Box -->
                        <div style="background-color: #f7fafc; border-left: 4px solid #FFD700; border-radius: 8px; padding: 24px; margin-bottom: 32px; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);">
                            <h3 style="margin: 0 0 16px 0; color: #2d3748; font-size: 18px;">Your Login Credentials</h3>
                            
                            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                                <span style="font-size: 14px; color: #718096; width: 100px;">User ID:</span>
                                <span style="font-size: 18px; color: #1a202c; font-weight: 700; font-family: monospace;">${newUserId}</span>
                            </div>
                            
                            <div style="display: flex; align-items: center;">
                                <span style="font-size: 14px; color: #718096; width: 100px;">Password:</span>
                                <span style="font-size: 18px; color: #1a202c; font-weight: 700; font-family: monospace;">${password}</span>
                            </div>
                        </div>

                        <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin-bottom: 32px; text-align: center;">
                            Please keep these credentials safe and do not share them with anyone.
                        </p>

                        <!-- CTA Button -->
                        <div style="text-align: center; margin-bottom: 20px;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?uid=${newUserId}&pwd=${password}" style="background: linear-gradient(135deg, #FFD700 0%, #F59E0B 100%); color: #1a202c; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: 800; font-size: 16px; transition: all 0.3s ease; display: inline-block; box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.5);">
                                Login to Your Dashboard
                            </a>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="background-color: #edf2f7; padding: 24px; text-align: center;">
                        <p style="font-size: 12px; color: #a0aec0; margin: 0;">
                            &copy; ${new Date().getFullYear()} IVAMAX. All rights reserved.<br>
                            Need help? Contact <a href="mailto:support@ivamax.live" style="color: #4299e1; text-decoration: none;">support@ivamax.live</a>
                        </p>
                    </div>
                </div>
            `;

            await sendEmail({
                email: newUser.email,
                subject: 'Welcome to IVAMAX - Registration Successful',
                html: htmlContent,
                message: `Welcome to IVAMAX! Your User ID is ${newUserId} and password is ${password}. Login at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`
            });
            console.log(`[SUCCESS] Welcome email sent to ${newUser.email}`);
        } catch (err) {
            console.error('[WARNING] Failed to send welcome email:', err);
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
            // if (!user.isActive) {
            //     return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
            // }

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
        // Get sponsor information
        // We prefer the direct referrer (referralId). 
        // fallback to tree parent if referralId is missing (legacy support) but usually parent != sponsor in binary
        let sponsherData = {
            sponsherId: null,
            sponsherUsername: 'N/A'
        };

        if (user.referralId) {
            const sponsor = await User.findOne({ userId: user.referralId }).select('userId fullName');
            if (sponsor) {
                sponsherData.sponsherId = sponsor.userId;
                sponsherData.sponsherUsername = sponsor.fullName;
            }
        } else {
            // Fallback to placement parent if no direct sponsor recorded
            const treeNode = await Tree.findOne({ userId: user.userId });
            if (treeNode && treeNode.parentId) {
                const parent = await User.findOne({ userId: treeNode.parentId }).select('userId fullName');
                if (parent) {
                    sponsherData.sponsherId = parent.userId;
                    sponsherData.sponsherUsername = parent.fullName; // Note: This is Placement Upliner, not necessarily Sponsor
                }
            }
        }

        // Financial Aggregations
        const Withdrawal = require('../models/Withdrawal');
        const Income = require('../models/Income');

        // 1. Profit Wallet (Total Earnings)
        // Check if User model has totalEarnings, if so use it, otherwise calculate
        // For now, let's calculate from Income to be safe or use user.totalEarnings if available
        let profitWallet = user.totalEarnings || 0;
        if (!profitWallet) {
            const totalIncome = await Income.aggregate([
                { $match: { userId: user.userId } },
                { $group: { _id: null, total: { $sum: "$netAmount" } } }
            ]);
            profitWallet = totalIncome[0]?.total || 0;
        }

        // 2. Capital Wallet (Investment)
        const capitalWallet = user.investmentAmount || 0;

        // 3. Available Profit (Wallet Balance)
        const availableProfit = user.walletBalance || 0;

        // 4. Withdrawal Released (Approved)
        const approvedWithdrawals = await Withdrawal.aggregate([
            { $match: { userId: user.userId, status: 'approved' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const withdrawalReleased = approvedWithdrawals[0]?.total || 0;

        // 5. Withdrawal Pending
        const pendingWithdrawals = await Withdrawal.aggregate([
            { $match: { userId: user.userId, status: 'pending' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const withdrawalPending = pendingWithdrawals[0]?.total || 0;

        res.json({
            success: true,
            data: {
                ...user.toObject(),
                treeData: await Tree.findOne({ userId: user.userId }),
                ...sponsherData,
                profitWallet,
                capitalWallet,
                availableProfit,
                withdrawalReleased,
                withdrawalPending
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
