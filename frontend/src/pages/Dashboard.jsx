import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Users, Crown, DollarSign, Clock, Landmark, PieChart, ArrowRightLeft, Trophy, Target, TreeDeciduous, BarChart3, CircleDollarSign } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalIncome: 12500,
        pmrIncome: 8000,
        drrIncome: 3000,
        fcrIncome: 1500,
        pendingWithdrawals: 2,
        totalWithdrawn: 5000,
        leftPairs: 128,
        rightPairs: 128,
        currentRank: 'Silver',
        royaltyPercentage: 10,
        matchingCompleted: 128
    });

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

    return (
        <div className="space-y-8 p-4 md:p-0 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-golden-300/80 to-golden-400/80 p-8 text-black shadow-2xl shadow-black/40"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-black/30 blur-sm rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/30 blur-sm rounded-full translate-y-24 -translate-x-24"></div>

                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-3">Welcome back, {user?.name || 'Partner'}! 👋</h1>
                    <p className="text-lg opacity-90 mb-6 max-w-2xl">
                        Track your earnings, manage your network, and grow your business with IVAMAX
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                            <span className="text-sm opacity-90">Member Since</span>
                            <p className="font-semibold">Jan 2024</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                            <span className="text-sm opacity-90">Network Size</span>
                            <p className="font-semibold">256 Members</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Income Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        label: "Total Income",
                        value: stats.totalIncome,
                        icon: <DollarSign size={28} />,
                        color: "from-amber-500 to-orange-500",
                        trend: "+12.5%"
                    },
                    {
                        label: "PMR Income",
                        value: stats.pmrIncome,
                        icon: <TrendingUp size={28} />,
                        color: "from-blue-500 to-cyan-500",
                        trend: "+8.2%"
                    },
                    {
                        label: "DRR Income",
                        value: stats.drrIncome,
                        icon: <Users size={28} />,
                        color: "from-emerald-500 to-green-500",
                        trend: "+15.3%"
                    },
                    {
                        label: "FCR Income",
                        value: stats.fcrIncome,
                        icon: <Crown size={28} />,
                        color: "from-purple-500 to-pink-500",
                        trend: "+5.7%"
                    }
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className="group relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg transform group-hover:scale-[1.02] transition-all duration-300"></div>
                        <div className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-xl hover:shadow-golden hover:border-golden-400 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                                    <h3 className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${stat.color}`}>
                                        ${stat.value.toLocaleString()}
                                    </h3>
                                </div>
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                                    <div className="text-white">{stat.icon}</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                                    <TrendingUp size={16} />
                                    {stat.trend}
                                </span>
                                <span className="text-xs text-gray-500">Last 30 days</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Business Overview & Rank */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Business Stats */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2"
                >
                    <div className="bg-white rounded-2xl p-6 border border-gray-400 shadow-xl shadow-black/20 hover:shadow-golden hover:border-golden-400 transition-all duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Business Overview</h3>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <ArrowRightLeft className="text-blue-600" size={20} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="group bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-5 border border-blue-300 hover:border-blue-700 shadow-lg hover:shadow-blue-300 transition-all duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-blue-700">Left Pairs</span>
                                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                        <div className="text-blue-600 text-xl">⬅️</div>
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-800">{stats.leftPairs}</p>
                                <div className="mt-2 h-2 bg-blue-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(stats.leftPairs / 150) * 100}%` }}
                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                    />
                                </div>
                            </div>

                            <div className="group bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl p-5 border border-emerald-300 hover:border-emerald-700 shadow-lg hover:shadow-emerald-300 transition-all duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-emerald-700">Right Pairs</span>
                                    <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                                        <div className="text-emerald-600 text-xl">➡️</div>
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-800">{stats.rightPairs}</p>
                                <div className="mt-2 h-2 bg-emerald-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(stats.rightPairs / 150) * 100}%` }}
                                        className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                                    />
                                </div>
                            </div>

                            <div className="group bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-5 border border-amber-300 hover:border-amber-700 shadow-lg hover:shadow-amber-300 transition-all duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-amber-700">Matching Progress</span>
                                    <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                                        <div className="text-amber-600 text-xl">🎯</div>
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-800">{stats.matchingCompleted}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-amber-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(stats.matchingCompleted / Math.max(stats.leftPairs, stats.rightPairs)) * 100}%` }}
                                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-amber-600">
                                        {Math.round((stats.matchingCompleted / Math.max(stats.leftPairs, stats.rightPairs)) * 100)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Rank Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 shadow-lg shadow-black/40 p-1 h-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 h-full">
                            <div className="text-center">
                                <div className="inline-flex p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl mb-4">
                                    <Trophy className="text-amber-300" size={40} />
                                </div>
                                <h4 className="text-sm font-medium text-amber-200 mb-2">Your Current Rank</h4>
                                <h2 className="text-3xl font-bold text-white mb-4">{stats.currentRank}</h2>

                                <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 mb-6 border border-gray-700">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-gray-300">Royalty Percentage</span>
                                        <Target className="text-amber-400" size={18} />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-bold text-white">{stats.royaltyPercentage}%</span>
                                        <span className="text-sm text-amber-300 mb-1">of network earnings</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Next Rank</span>
                                        <span className="text-amber-300 font-medium">Gold</span>
                                    </div>
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '65%' }}
                                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-500"
                                        />
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        65% progress to next rank
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        label: "Available Balance",
                        value: stats.totalIncome - stats.totalWithdrawn,
                        icon: <DollarSign size={24} />,
                        color: "text-green-600",
                        bgColor: "bg-gradient-to-br from-green-100 to-emerald-100",
                        borderColor: "border-green-500",
                        action: "Withdraw Now"
                    },
                    {
                        label: "Total Withdrawn",
                        value: stats.totalWithdrawn,
                        icon: <Landmark size={24} />,
                        color: "text-blue-600",
                        bgColor: "bg-gradient-to-br from-blue-100 to-cyan-100",
                        borderColor: "border-blue-500",
                        action: "View History"
                    },
                    {
                        label: "Pending Requests",
                        value: stats.pendingWithdrawals,
                        icon: <Clock size={24} />,
                        color: "text-amber-600",
                        bgColor: "bg-gradient-to-br from-amber-100 to-orange-100",
                        borderColor: "border-amber-500",
                        action: "Track Status"
                    }
                ].map((item, index) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="group"
                    >
                        <div className={`rounded-2xl p-6 border ${item.borderColor} ${item.bgColor} shadow-lg hover:shadow-xl hover:shadow-black/40 shadow-black/20 transition-all duration-300`}>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">{item.label}</p>
                                    <h3 className={`text-3xl font-bold ${item.color}`}>
                                        ${item.value.toLocaleString()}
                                    </h3>
                                </div>
                                <div className={`p-3 rounded-xl ${item.bgColor} border ${item.borderColor}`}>
                                    <div className={item.color}>{item.icon}</div>
                                </div>
                            </div>
                            <button className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-300 shadow-lg hover:shadow-black/40 shadow-black/20 ${item.label === "Available Balance"
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/25"
                                : "bg-white border text-gray-700 hover:bg-gray-50 hover:border-gray-700"
                                }`}>
                                {item.action}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-white rounded-[2rem] p-8 border border-gray-400 shadow-xl hover:shadow-black/40 shadow-black/20 transition-all duration-300"
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
                        <p className="text-gray-500 mt-1">Manage your business with one click</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-2xl">
                        <PieChart className="text-purple-600" size={24} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            label: "Network Tree",
                            desc: "View hierarchy",
                            icon: <TreeDeciduous size={24} />,
                            color: "bg-blue-500",
                            path: "/tree-view"
                        },
                        {
                            label: "Income Details",
                            desc: "Check earnings",
                            icon: <CircleDollarSign size={24} />,
                            color: "bg-emerald-500",
                            path: "/income"
                        },
                        {
                            label: "Withdraw Funds",
                            desc: "Request payout",
                            icon: <Landmark size={24} />,
                            color: "bg-purple-500",
                            path: "/withdrawals"
                        },
                        {
                            label: "Analytics",
                            desc: "Performance stats",
                            icon: <BarChart3 size={24} />,
                            color: "bg-orange-500",
                            path: "/reports"
                        }
                    ].map((action, index) => (
                        <motion.button
                            key={action.label}
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            className="group bg-white rounded-3xl p-6 text-left border border-gray-400 shadow-lg shadow-gray-300 hover:shadow-lg hover:shadow-golden-300 transition-all duration-300"
                        >
                            <div className={`w-14 h-14 rounded-xl ${action.color} flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                {action.icon}
                            </div>

                            <h4 className="text-xl font-bold text-gray-900 mb-1">{action.label}</h4>
                            <p className="text-sm text-gray-500 mb-6">Click to access</p>

                            <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
                                <span>Open</span>
                                <ArrowRightLeft size={16} className="text-blue-500" />
                            </div>
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;