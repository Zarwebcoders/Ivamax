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
                pendingWallets, // Adjust logic if "pending wallet" means something else (e.g. connection approval)
                pendingWithdrawals,
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

        res.json({ success: true, message: 'Deposit approved and package activated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error authorizing deposit' });
    }
};

module.exports = {
    getAdminStats,
    getAllUsers,
    approveWalletChange,
    getWalletRequests,
    getDeposits,
    approveDeposit
};
