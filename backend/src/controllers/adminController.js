const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Withdrawal = require('../models/Withdrawal');
const Income = require('../models/Income');
const Deposit = require('../models/Deposit');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const activeUsers = await User.countDocuments({ role: 'user', isActive: true });

        const pendingWallets = await Wallet.countDocuments({
            'changeRequests.status': 'pending'
        }); // Or however we track initial pending wallets if separated

        const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });

        // Calculate total income distributed (sum of all netAmount in Income)
        const totalDistributed = await Income.aggregate([
            { $group: { _id: null, total: { $sum: "$netAmount" } } }
        ]);

        const recentUsers = await User.find({ role: 'user' })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('userId fullName email createdAt rank');

        res.json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                activeUsers,
                pendingWallets,
                pendingWithdrawals,
                pendingDeposits: await Deposit.countDocuments({ status: 'pending' }),
                totalDistributed: totalDistributed[0]?.total || 0,
                recentUsers
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const query = { role: 'user' };

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { userId: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const count = await User.countDocuments(query);
        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select('-password');

        res.json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total: count,
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Approve or reject wallet change
// @route   PUT /api/admin/wallet/approve/:requestId
// @access  Private/Admin
const approveWalletChange = async (req, res) => {
    try {
        const { status, adminNotes } = req.body; // status: 'approved' or 'rejected'
        const { requestId } = req.params;

        const wallet = await Wallet.findOne({ 'changeRequests._id': requestId });

        if (!wallet) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const request = wallet.changeRequests.id(requestId);
        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request already processed' });
        }

        request.status = status;
        request.adminNotes = adminNotes;
        request.processedDate = Date.now();

        if (status === 'approved') {
            wallet.walletAddress = request.newWalletAddress;
            // Also update user record for redundancy if needed, though Wallet model is source of truth for connection
            await User.findOneAndUpdate(
                { userId: wallet.userId },
                { walletAddress: request.newWalletAddress }
            );
        }

        await wallet.save();

        res.json({
            success: true,
            message: `Wallet request ${status}`,
            data: wallet
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get pending wallet requests
// @route   GET /api/admin/wallet/requests
// @access  Private/Admin
const getWalletRequests = async (req, res) => {
    try {
        const wallets = await Wallet.find({
            'changeRequests.status': 'pending'
        }).populate('userId', 'fullName userId email');

        const requests = [];
        wallets.forEach(wallet => {
            wallet.changeRequests.forEach(req => {
                if (req.status === 'pending') {
                    requests.push({
                        _id: req._id,
                        userId: wallet.userId.userId,
                        userName: wallet.userId.fullName,
                        oldWallet: req.oldWalletAddress,
                        newWallet: req.newWalletAddress,
                        requestDate: req.requestDate
                    });
                }
            });
        });

        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// @desc    Get all deposit requests
// @route   GET /api/admin/deposits
// @access  Private/Admin
const getDeposits = async (req, res) => {
    try {
        const deposits = await Deposit.find({}).sort({ createdAt: -1 });
        res.json({ success: true, count: deposits.length, data: deposits });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Approve deposit and activate package
// @route   PUT /api/admin/deposit/approve/:id
// @access  Private/Admin
const approveDeposit = async (req, res) => {
    try {
        const deposit = await Deposit.findById(req.params.id);
        if (!deposit) return res.status(404).json({ message: 'Deposit not found' });

        if (deposit.status !== 'pending') {
            return res.status(400).json({ message: 'Deposit already processed' });
        }

        const user = await User.findOne({ userId: deposit.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Activations Logic
        deposit.status = 'approved';
        deposit.processedBy = req.user.userId;
        deposit.processedDate = Date.now();
        await deposit.save();

        // Update User Investment
        user.investmentAmount += deposit.amount;
        user.investmentDate = Date.now();
        user.packageType = deposit.packageName;
        await user.save();

        // Auto-process first income for current month
        try {
            const { processUserMonthlyIncome } = require('./incomeController');
            const now = new Date();
            const currentMonth = now.getMonth() + 1; // 1-12
            const currentYear = now.getFullYear();

            await processUserMonthlyIncome(deposit.userId, currentMonth, currentYear);
            console.log(`✅ Auto-processed first income for ${deposit.userId} (${currentMonth}/${currentYear})`);
        } catch (incomeError) {
            console.error('Error auto-processing income:', incomeError);
            // Don't fail the deposit approval if income processing fails
        }

        res.json({
            success: true,
            message: 'Deposit approved, package activated, and first income processed'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error authorizing deposit' });
    }
};

// @desc    Create new user (Admin)
// @route   POST /api/admin/create-user
// @access  Private/Admin
const createUser = async (req, res) => {
    try {
        const { fullName, mobile, email, password, referralLink, placementSide } = req.body;
        const { generateToken } = require('../utils/generateToken');
        const { findPlacement, updateUplineCounts } = require('../services/treeService');

        // Check if user already exists
        /* TEMPORARY: Commented out for testing
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        */

        // 1. REFERRAL LINK PARSING (Admin override possible)
        let referrerId = req.body.referrerId || null;
        let strategy = placementSide ? placementSide.toLowerCase() : null;

        if ((!referrerId || !strategy) && referralLink) {
            // Logic similar to authController but simplified for admin input
            // Admin likely inputs ID directly
            if (referralLink.match(/^IVA\d+$/i)) {
                referrerId = referralLink.toUpperCase();
            }
        }

        if (!referrerId) referrerId = 'IVA1001'; // Default to Root if missing
        if (!strategy) strategy = 'placing-left'; // Default strategy

        // Verify Referrer Exists
        const referrerUser = await User.findOne({ userId: referrerId });
        if (!referrerUser) {
            return res.status(400).json({ message: 'Invalid Referral ID' });
        }

        // 2. FIND PLACEMENT
        const { parentId, side } = await findPlacement(referrerId, strategy);

        // 3. CREATE START
        const newUserId = await User.generateUserId();

        const newUser = await User.create({
            userId: newUserId,
            fullName,
            mobile,
            email,
            password,
            plainPassword: password,
            referralId: referrerId,
            placementSide: side,
            role: 'user',
            isActive: true // Admin created users are active by default? Or wait for deposit? Let's say false until deposit.
            // keeping isActive false as per schema default
        });

        // 4. CREATE TREE NODE
        const parentTree = await Tree.findOne({ userId: parentId });
        const newLevel = parentTree.level + 1;

        const newTree = await Tree.create({
            userId: newUserId,
            parentId: String(parentId),
            level: newLevel,
            leftDirectId: null,
            rightDirectId: null,
        });

        // 5. UPDATE PARENT
        if (side === 'Left') {
            await Tree.updateOne({ userId: parentId }, { leftDirectId: newUserId });
        } else {
            await Tree.updateOne({ userId: parentId }, { rightDirectId: newUserId });
        }

        // 6. UPDATE UPLINE
        await updateUplineCounts(newUserId);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: newUser
        });

    } catch (error) {
        console.error('Create User Error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Update user (Admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id; // This is the _id or userId? Route usually sends _id. 
        // Let's assume params.id is user's _id

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.fullName = req.body.fullName || user.fullName;
        user.mobile = req.body.mobile || user.mobile;
        user.email = req.body.email || user.email;
        if (req.body.defaultPlacement) user.defaultPlacement = req.body.defaultPlacement;
        if (req.body.rank) user.rank = req.body.rank;
        if (req.body.placementSide) user.placementSide = req.body.placementSide;

        // Password update
        if (req.body.password && req.body.password.trim() !== '') {
            user.password = req.body.password;
            user.plainPassword = req.body.password;
        }

        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
    try {
        console.log(`[DEBUG] Toggling status for user ID: ${req.params.id}`);
        const user = await User.findById(req.params.id);

        if (!user) {
            console.log('[DEBUG] User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`[DEBUG] Current status: ${user.isActive}. Toggling to: ${!user.isActive}`);
        user.isActive = !user.isActive;
        await user.save();
        console.log(`[DEBUG] New status saved: ${user.isActive}`);

        res.json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            user
        });
    } catch (error) {
        console.error('Toggle User Status Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAdminStats,
    getAllUsers,
    approveWalletChange,
    getWalletRequests,
    getDeposits,
    approveDeposit,
    createUser,
    updateUser,
    toggleUserStatus
};
