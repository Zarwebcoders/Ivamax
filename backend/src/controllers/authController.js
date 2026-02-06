const User = require('../models/User');
const Tree = require('../models/Tree');
const { generateToken } = require('../utils/generateToken');

// Helper to find the correct placement based on strategy
const findPlacement = async (sponsorId, strategy) => {
    let currentId = sponsorId;
    let parentNode = null;
    let side = null;

    // Fetch Sponsor's Tree Node
    const sponsorTree = await Tree.findOne({ userId: sponsorId });
    if (!sponsorTree) {
        throw new Error('Sponsor tree node not found');
    }

    if (strategy === 'left') {
        // 1. Normal Left Link: Direct placement
        if (sponsorTree.leftDirectId) {
            throw new Error('Sponsor\'s Left position is already occupied');
        }
        return { parentId: sponsorId, side: 'Left' };

    } else if (strategy === 'right') {
        // 2. Normal Right Link: Direct placement
        if (sponsorTree.rightDirectId) {
            throw new Error('Sponsor\'s Right position is already occupied');
        }
        return { parentId: sponsorId, side: 'Right' };

    } else if (strategy === 'placing-left') {
        // 3. Placing Left Link: Extreme Left (Power Leg)
        // Start from sponsor and traverse LEFT until we find a null spot
        let current = sponsorTree;
        while (current) {
            if (!current.leftDirectId) {
                // Found empty spot
                return { parentId: current.userId, side: 'Left' };
            }
            // Move down to the next node on the left
            current = await Tree.findOne({ userId: current.leftDirectId });
        }

    } else if (strategy === 'placing-right') {
        // 4. Placing Right Link: Extreme Right (Power Leg)
        // Start from sponsor and traverse RIGHT until we find a null spot
        let current = sponsorTree;
        while (current) {
            if (!current.rightDirectId) {
                // Found empty spot
                return { parentId: current.userId, side: 'Right' };
            }
            // Move down to the next node on the right
            current = await Tree.findOne({ userId: current.rightDirectId });
        }
    }

    throw new Error('Invalid placement strategy');
};

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
            referrerId = 'IVA100001'; // Default Admin/Root if no referrer
        }
        // If strategy logic is missing, default to 'left' or 'placing-left'?? 
        // For now, if no strategy, we can't place in binary tree properly. 
        // But let's assume 'placing-left' (spillover) is the safest default if they just have a generic link.
        if (!placementStrategy) {
            placementStrategy = 'placing-left';
        }

        // Verify Referrer Exists
        const referrerUser = await User.findOne({ userId: referrerId });
        if (!referrerUser) {
            return res.status(400).json({ message: 'Invalid Referral ID' });
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

// HELPER: Bubble up counts
const updateUplineCounts = async (startUserId) => {
    let currentId = startUserId;

    // We loop until we hit the top or a broken link
    while (currentId) {
        // Find the node itself to get its parent
        const currentNode = await Tree.findOne({ userId: currentId });
        if (!currentNode || !currentNode.parentId) break;

        const parentId = currentNode.parentId;
        const parentNode = await Tree.findOne({ userId: parentId });

        if (!parentNode) break;

        // Determine which side 'currentId' is on relative to 'parentNode'
        if (parentNode.leftDirectId === currentId) {
            // It's on the Left
            await Tree.updateOne(
                { userId: parentId },
                { $inc: { totalLeftMembers: 1 } }
            );
            // CRITICAL: For the NEXT iteration (Grandparent), is the Parent Left or Right?
            // The loop continues, setting currentId = parentId.
            // The NEXT iteration will find Grandparent, check if Parent is L or R of Grandparent.
            // Wait, this logic is SLIGHTLY flawed. 
            // If I am on the Left of Parent, I contribute to Parent's Left count.
            // My Parent is on the Right of Grandparent. Does my existence contribute to Grandparent's Right count?
            // YES. Because I am in the total downline.
            // But my logic below: `parentNode.leftDirectId === currentId` checks DIRECT child.
            // This works for the immediate parent.
            // But when `currentId` becomes `parentId` (the Parent),
            // The Grandparent checks if `Parent` is Left or Right.
            // If Parent is Right of Grandparent, then we increment Grandparent's RIGHT count.
            // THIS IS CORRECT. We are bubbling up the "Active Node" and seeing which side it hangs off.
        } else if (parentNode.rightDirectId === currentId) {
            // It's on the Right
            await Tree.updateOne(
                { userId: parentId },
                { $inc: { totalRightMembers: 1 } }
            );
        } else {
            // Edge case: Maybe intermediate node where direct link is different?
            // In a strict binary tree, parent->left MUST be the child in tha left chain.
            // But wait! If I am deep down, say Gen 5.
            // Gen 4 is my parent. Gen 4.left = Me. -> Gen 4 LeftCount++ . Correct.
            // Gen 3 is Gen 4's parent. Gen 3.right = Gen 4. -> Gen 3 RightCount++. Correct.
            // Logic holds.

            // However, what if I am NOT the direct child? 
            // `currentId` in this loop IS the direct child of `parentId` because we fetch `parentId` FROM `currentId`.
            // So the relationship is always direct for the pair we are examining.
        }

        currentId = parentId; // Move up one level
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
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({
            success: true,
            data: user,
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
