import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import adminService from '../../services/admin.service';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        pendingWallets: 0,
        pendingWithdrawals: 0,
        totalDistributed: 0,
        recentUsers: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await adminService.getStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Error fetching admin stats:', err);
            setError('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
            },
        }),
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glass p-6 shadow-lg shadow-gray-500 border border-gray-400"
            >
                <h1 className="text-3xl font-bold gradient-text mb-2">
                    Admin Dashboard
                </h1>
                <p className="text-text-tertiary">
                    Overview of platform activity and pending actions
                </p>
            </motion.div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users */}
                <motion.div
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="card hover-lift shadow-lg shadow-gray-500 border border-gray-400"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text-tertiary mb-1">Total Users</p>
                            <h3 className="text-3xl font-bold text-text-primary">
                                {stats.totalUsers}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl">
                            👥
                        </div>
                    </div>
                </motion.div>

                {/* Active Users */}
                <motion.div
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="card hover-lift shadow-lg shadow-gray-500 border border-gray-400"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text-tertiary mb-1">Active Users</p>
                            <h3 className="text-3xl font-bold text-green-600">
                                {stats.activeUsers}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl">
                            ✅
                        </div>
                    </div>
                </motion.div>

                {/* Pending Withdrawals */}
                <motion.div
                    custom={2}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="card hover-lift shadow-lg shadow-gray-500 border border-gray-400"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text-tertiary mb-1">Pending Requests</p>
                            <h3 className="text-3xl font-bold text-yellow-600">
                                {stats.pendingWithdrawals}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-2xl">
                            ⏳
                        </div>
                    </div>
                </motion.div>

                {/* Total Distributed */}
                <motion.div
                    custom={3}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="card hover-lift shadow-lg shadow-gray-500 border border-gray-400"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text-tertiary mb-1">Distributed</p>
                            <h3 className="text-3xl font-bold gradient-text">
                                ${stats.totalDistributed.toLocaleString()}
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl">
                            💰
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Registrations */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="card shadow-lg shadow-gray-500 border border-gray-400"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-text-primary">Recent Users</h3>
                        <button className="text-sm text-golden-500 hover:text-golden-600 font-semibold">
                            View All
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 text-left">
                                    <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">User</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">Rank</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stats.recentUsers.length > 0 ? (
                                    stats.recentUsers.map((user) => (
                                        <tr key={user._id} className="transition-colors hover:bg-gray-300">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-golden-100 text-golden-600 flex items-center justify-center text-xs font-bold mr-3">
                                                        {user.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-text-primary">{user.fullName}</p>
                                                        <p className="text-xs text-text-tertiary">{user.userId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600">
                                                    {user.rank}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-text-tertiary">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-4 py-6 text-center text-text-tertiary">
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="card shadow-lg shadow-gray-500 border border-gray-400"
                >
                    <h3 className="text-xl font-bold text-text-primary mb-4">Admin Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 rounded-xl border border-gray-400 hover:border-golden-300 hover:shadow-golden-lg hover:shadow-gray-500 transition-all group text-left">
                            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-xl mb-3 group-hover:bg-golden-500 group-hover:text-white transition-colors">
                                ✅
                            </div>
                            <h4 className="font-semibold text-text-primary">Approve Wallets</h4>
                            <p className="text-xs text-text-tertiary mt-1">
                                {stats.pendingWallets} pending requests
                            </p>
                        </button>

                        <button className="p-4 rounded-xl border border-gray-400 hover:border-golden-300 hover:shadow-golden-lg hover:shadow-gray-500 transition-all group text-left">
                            <div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center text-xl mb-3 group-hover:bg-golden-500 group-hover:text-white transition-colors">
                                💸
                            </div>
                            <h4 className="font-semibold text-text-primary">Process Withdrawals</h4>
                            <p className="text-xs text-text-tertiary mt-1">
                                {stats.pendingWithdrawals} pending requests
                            </p>
                        </button>

                        <button className="p-4 rounded-xl border border-gray-400 hover:border-golden-300 hover:shadow-golden-lg hover:shadow-gray-500 transition-all group text-left">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xl mb-3 group-hover:bg-golden-500 group-hover:text-white transition-colors">
                                👥
                            </div>
                            <h4 className="font-semibold text-text-primary">Manage Users</h4>
                            <p className="text-xs text-text-tertiary mt-1">
                                View & edit user profiles
                            </p>
                        </button>

                        <button className="p-4 rounded-xl border border-gray-400 hover:border-golden-300 hover:shadow-golden-lg hover:shadow-gray-500 transition-all group text-left">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xl mb-3 group-hover:bg-golden-500 group-hover:text-white transition-colors">
                                📄
                            </div>
                            <h4 className="font-semibold text-text-primary">Generate Reports</h4>
                            <p className="text-xs text-text-tertiary mt-1">
                                Export system data
                            </p>
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
