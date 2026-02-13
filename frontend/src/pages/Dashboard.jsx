import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, Crown, DollarSign, Clock, Landmark, PieChart, ArrowRightLeft, Trophy, Target, TreeDeciduous, BarChart3, CircleDollarSign, Briefcase, Copy, Check, MessageCircle, Send } from 'lucide-react';
import { dashboardService } from '../services/dashboard.service';
import NewsTicker from '../components/NewsTicker';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        // Financials
        totalIncome: 0,
        pmrIncome: 0,
        drrIncome: 0,
        fcrIncome: 0,
        // Withdrawals
        pendingWithdrawals: 0,
        totalWithdrawn: 0,
        // Business
        leftPairs: 0, // This is BV/Count
        rightPairs: 0,
        matchingCompleted: 0,
        // Rank
        currentRank: 'Member',
        royaltyPercentage: 0,
        rankProgress: 0,
        // Profile
        memberSince: new Date(),
        networkSize: 0,
        // Referral Constraints
        isLeftDirectFilled: false,
        isRightDirectFilled: false
    });

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('income');
    const [activeRefTab, setActiveRefTab] = useState('left');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const data = await dashboardService.getStats();
                if (data.success) {
                    setStats(prev => ({ ...prev, ...data.data }));

                    // Auto-select valid tab if current is filled
                    if (data.data.isLeftDirectFilled && activeRefTab === 'left') {
                        setActiveRefTab('placing-left');
                    } else if (data.data.isRightDirectFilled && activeRefTab === 'right') {
                        setActiveRefTab('placing-right');
                    }
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []); // Run only on mount

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-golden-400"></div></div>;

    return (
        <div className="space-y-6">
            {/* News Ticker */}
            <NewsTicker />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-golden-300/80 to-golden-400/80 p-4 text-black shadow-2xl shadow-black/40"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-black/30 blur-sm rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/30 blur-sm rounded-full translate-y-24 -translate-x-24"></div>

                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-3">Welcome back, {user?.name || 'Partner'}! 👋</h1>
                    <p className="text-lg opacity-90 mb-6 max-w-2xl">
                        Track your earnings, manage your network, and grow your business with IVAMAX
                    </p>
                    <div className="flex flex-col lg:flex-row lg:items-end gap-6 w-full">
                        {/* Stats */}
                        <div className="flex items-center gap-4 shrink-0">
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <span className="text-sm opacity-90">Member Since</span>
                                <p className="font-semibold">{formatDate(stats.memberSince)}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <span className="text-sm opacity-90">Network Size</span>
                                <p className="font-semibold">{stats.networkSize} Members</p>
                            </div>
                        </div>

                        {/* Referral Links Tabs */}
                        <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 w-full lg:w-auto">
                            {/* User ID Badge */}
                            <div className="flex justify-center mb-2">
                                <div className="bg-white/20 font-bold text-white px-8 py-2 rounded-xl text-lg shadow-sm border border-white/10 tracking-wider">
                                    {user?.userId}
                                </div>
                            </div>

                            {/* Pyramid Layout Buttons */}
                            <div className="flex flex-col items-center gap-2 mb-4">
                                {/* Row 1: Left & Right Links */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => !stats.isLeftDirectFilled && setActiveRefTab('left')}
                                        disabled={stats.isLeftDirectFilled}
                                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all relative ${activeRefTab === 'left'
                                            ? 'bg-yellow-400 text-black shadow-lg scale-105'
                                            : stats.isLeftDirectFilled
                                                ? 'bg-gray-400/50 text-gray-300 cursor-not-allowed border border-gray-500/30'
                                                : 'bg-yellow-400/20 text-yellow-100 hover:bg-yellow-400/30 border border-yellow-400/30'
                                            }`}
                                    >
                                        Left Link
                                        {stats.isLeftDirectFilled && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-md">Filled</span>}
                                    </button>
                                    <button
                                        onClick={() => !stats.isRightDirectFilled && setActiveRefTab('right')}
                                        disabled={stats.isRightDirectFilled}
                                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all relative ${activeRefTab === 'right'
                                            ? 'bg-green-500 text-white shadow-lg scale-105'
                                            : stats.isRightDirectFilled
                                                ? 'bg-gray-400/50 text-gray-300 cursor-not-allowed border border-gray-500/30'
                                                : 'bg-green-500/20 text-green-100 hover:bg-green-500/30 border border-green-500/30'
                                            }`}
                                    >
                                        Right Link
                                        {stats.isRightDirectFilled && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-md">Filled</span>}
                                    </button>
                                </div>

                                {/* Row 2: Placing Left & Right */}
                                <div className="flex gap-16">
                                    <button
                                        onClick={() => setActiveRefTab('placing-left')}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeRefTab === 'placing-left'
                                            ? 'bg-orange-400 text-white shadow-lg scale-105'
                                            : 'bg-orange-400/20 text-orange-100 hover:bg-orange-400/30 border border-orange-400/30'
                                            }`}
                                    >
                                        Placing Left
                                    </button>
                                    <button
                                        onClick={() => setActiveRefTab('placing-right')}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeRefTab === 'placing-right'
                                            ? 'bg-blue-500 text-white shadow-lg scale-105'
                                            : 'bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border border-blue-500/30'
                                            }`}
                                    >
                                        Placing Right
                                    </button>
                                </div>
                            </div>

                            {/* Dynamic Link Display */}
                            <div className="bg-gray-300/60 backdrop-blur-md rounded-xl p-2 flex items-center gap-2 border border-black shadow-inner mb-3">
                                <input
                                    type="text"
                                    readOnly
                                    value={`${window.location.origin}/register?ref=${user?.userId}&position=${activeRefTab === 'placing-left' || activeRefTab === 'placing-right' ? (activeRefTab === 'placing-left' ? 'placing-left' : 'placing-right') : activeRefTab}`}
                                    className="flex-1 bg-transparent px-3 py-1.5 text-sm font-medium text-gray-800 outline-none truncate"
                                />
                                <CopyButton link={`${window.location.origin}/register?ref=${user?.userId}&position=${activeRefTab === 'placing-left' || activeRefTab === 'placing-right' ? (activeRefTab === 'placing-left' ? 'placing-left' : 'placing-right') : activeRefTab}`} />
                            </div>

                            {/* Social Share Buttons */}
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${window.location.origin}/register?ref=${user?.userId}&position=${activeRefTab}`)}`, '_blank')}
                                    className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
                                >
                                    <MessageCircle size={18} />
                                    <span className="text-xs font-bold hidden sm:inline">WhatsApp</span>
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/register?ref=${user?.userId}&position=${activeRefTab}`);
                                        window.open('https://instagram.com', '_blank');
                                    }}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                    <span className="text-xs font-bold hidden sm:inline">Instagram</span>
                                </button>
                                <button
                                    onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}/register?ref=${user?.userId}&position=${activeRefTab}`)}&text=Join me on IVAMAX!`, '_blank')}
                                    className="bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
                                >
                                    <Send size={18} />
                                    <span className="text-xs font-bold hidden sm:inline">Telegram</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>





            {/* Mobile Tab Navigation */}
            {
                isMobile && (
                    <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar -mx-4 px-4 sticky top-[72px] z-30 bg-gray-50/95 backdrop-blur-sm py-2">
                        {[
                            { id: 'income', label: 'Income', icon: <DollarSign size={18} /> },
                            { id: 'business', label: 'Business', icon: <Briefcase size={18} /> },
                            { id: 'rank', label: 'Rank', icon: <Trophy size={18} /> },
                            { id: 'withdrawal', label: 'Withdrawal', icon: <Landmark size={18} /> },
                            { id: 'actions', label: 'Actions', icon: <PieChart size={18} /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all
                                ${activeTab === tab.id
                                        ? 'bg-golden-500 text-white shadow-lg shadow-golden-500/30'
                                        : 'bg-white text-gray-600 border border-gray-200 shadow-sm'
                                    }
                            `}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )
            }

            {/* Income Stats Cards */}
            {
                (!isMobile || activeTab === 'income') && (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                        {[
                            {
                                label: "Total Income",
                                value: stats.totalIncome,
                                icon: <DollarSign size={28} />,
                                color: "from-amber-500 to-orange-500",
                                trend: stats.totalIncomeChange || 0
                            },
                            {
                                label: "PMR Income",
                                value: stats.pmrIncome,
                                icon: <TrendingUp size={28} />,
                                color: "from-blue-500 to-cyan-500",
                                trend: stats.pmrIncomeChange || 0
                            },
                            {
                                label: "DRR Income",
                                value: stats.drrIncome,
                                icon: <Users size={28} />,
                                color: "from-emerald-500 to-green-500",
                                trend: stats.drrIncomeChange || 0
                            },
                            {
                                label: "FCR Income",
                                value: stats.fcrIncome,
                                icon: <Crown size={28} />,
                                color: "from-purple-500 to-pink-500",
                                trend: stats.fcrIncomeChange || 0
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
                                        <div className={`hidden md:block p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                                            <div className="text-white">{stat.icon}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start md:flex-row md:items-center md:justify-between gap-1 md:gap-0">
                                        <span className={`text-sm font-medium flex items-center gap-1 ${stat.trend >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            <TrendingUp size={16} className={stat.trend < 0 ? 'rotate-180' : ''} />
                                            {stat.trend >= 0 ? '+' : ''}{stat.trend.toFixed(1)}%
                                        </span>
                                        <span className="text-xs text-gray-500">vs Last Month</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )
            }

            {/* Business Overview & Rank */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Business Stats */}
                {(!isMobile || activeTab === 'business') && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-white rounded-2xl p-3 border border-gray-400 shadow-xl shadow-black/20 hover:shadow-golden hover:border-golden-400 transition-all duration-300">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-bold text-gray-800">Business Overview</h3>
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <ArrowRightLeft className="text-blue-600" size={20} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                <div className="group bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-3 border border-blue-300 hover:border-blue-700 shadow-lg hover:shadow-blue-300 transition-all duration-300">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-blue-700">Left Pairs</span>
                                        <div className="hidden md:block p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
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

                                <div className="group bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl p-3 border border-emerald-300 hover:border-emerald-700 shadow-lg hover:shadow-emerald-300 transition-all duration-300">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-emerald-700">Right Pairs</span>
                                        <div className="hidden md:block p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
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

                                <div className="group bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-3 border border-amber-300 hover:border-amber-700 shadow-lg hover:shadow-amber-300 transition-all duration-300">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-amber-700">Matching Progress</span>
                                        <div className="hidden md:block p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                                            <div className="text-amber-600 text-xl">🎯</div>
                                        </div>
                                    </div>
                                    {/* <p className="text-3xl font-bold text-gray-800">{stats.matchingCompleted}</p> */}
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="flex-1">
                                            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                                {Math.min(stats.leftPairs || 0, stats.rightPairs || 0)}
                                            </h2>
                                            <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden mb-2">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${stats.rightPairs > 0 && stats.leftPairs > 0 ? (Math.min(stats.leftPairs, stats.rightPairs) / Math.max(stats.leftPairs, stats.rightPairs)) * 100 : 0}%` }}
                                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-amber-600">
                                                {stats.rightPairs > 0 && stats.leftPairs > 0 ? Math.round((Math.min(stats.leftPairs, stats.rightPairs) / Math.max(stats.leftPairs, stats.rightPairs)) * 100) : 0}% Balanced
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Rank Card */}
                {(!isMobile || activeTab === 'rank') && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 shadow-lg shadow-black/40 p-1 h-full">
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 h-full">
                                <div className="text-center">
                                    <div className="hidden md:inline-flex p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl mb-4">
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
                                            <span className="text-amber-300 font-medium">{stats.nextRankName || 'FOUNDER'}</span>
                                        </div>
                                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${stats.rankProgress || 0}%` }}
                                                className="h-full bg-gradient-to-r from-amber-500 to-yellow-500"
                                            />
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {stats.rankProgress || 0}% progress to next rank
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Financial Overview */}
            {
                (!isMobile || activeTab === 'withdrawal') && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
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
                                        <div className={`hidden md:block p-3 rounded-xl ${item.bgColor} border ${item.borderColor}`}>
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
                )
            }

            {/* Quick Actions */}
            {
                (!isMobile || activeTab === 'actions') && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="bg-white rounded-[2rem] p-6 border border-gray-400 shadow-xl hover:shadow-black/40 shadow-black/20 transition-all duration-300"
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

                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                            {[
                                {
                                    label: "Network Tree",
                                    desc: "View hierarchy",
                                    icon: <TreeDeciduous size={24} />,
                                    color: "bg-blue-500",
                                    path: "/tree"
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
                                    onClick={() => navigate(action.path)}
                                    className="group bg-white rounded-3xl p-6 text-left border border-gray-400 shadow-lg shadow-gray-300 hover:shadow-lg hover:shadow-golden-300 transition-all duration-300"
                                >
                                    <div className={`hidden md:flex w-14 h-14 rounded-xl ${action.color} items-center justify-center text-white mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
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
                )
            }
        </div >
    );
};

const CopyButton = ({ link }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
        </button>
    );
};

export default Dashboard;