import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, Users, Crown, DollarSign, Clock, Landmark, PieChart,
    ArrowRightLeft, Trophy, Target, TreeDeciduous, BarChart3,
    CircleDollarSign, Briefcase, Copy, Check, MessageCircle, Send,
    Award, ExternalLink, UserPlus, ArrowLeftRight, ChevronRight, HelpCircle
} from 'lucide-react';
import { announcementService } from '../services/announcement.service';
import { dashboardService } from '../services/dashboard.service';
import NewsTicker from '../components/NewsTicker';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({});

    // Banner states
    const [banners, setBanners] = useState([]);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    // UI states
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsResponse, announcementsResponse] = await Promise.all([
                    dashboardService.getStats(),
                    announcementService.getActiveAnnouncements()
                ]);

                if (statsResponse.success) {
                    setStats(statsResponse.data);
                }

                if (announcementsResponse.success) {
                    const bannerItems = announcementsResponse.data.filter(a => a.type === 'banner');
                    setBanners(bannerItems);
                }

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Banner auto-scroll
    useEffect(() => {
        if (banners.length > 1) {
            const timer = setInterval(() => {
                setCurrentBannerIndex(prev => (prev + 1) % banners.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [banners]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'Recent';
        try {
            return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } catch (e) {
            return 'Recent';
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-[80vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-golden-500"></div>
        </div>
    );

    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '').replace(/\/$/, '');

    // Business Overview Calculations
    const leftPairs = stats.leftPairs || 0;
    const rightPairs = stats.rightPairs || 0;
    const maxPairs = Math.max(leftPairs, rightPairs, 1);
    const matchingCount = Math.min(leftPairs, rightPairs);
    const matchingPercent = Math.round((matchingCount / maxPairs) * 100);

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    const scaleOnHover = {
        scale: 1.02,
        transition: { type: "spring", stiffness: 300 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6 pb-20 md:pb-10"
        >
            <NewsTicker />

            {/* Account Activation Notice */}
            {stats.isActive === false && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm flex items-center gap-4"
                >
                    <div className="bg-red-100 p-2 rounded-full">
                        <Clock className="text-red-600" size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="text-red-800 font-black text-xs md:text-sm uppercase tracking-wider">Account Activation Required</p>
                        <p className="text-red-600 text-[10px] md:text-xs font-bold">Activate your ID within 24h to secure your position.</p>
                    </div>
                    <button
                        onClick={() => navigate('/packages')}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                    >
                        Activate
                    </button>
                </motion.div>
            )}

            {/* Mobile Navigation */}
            {isMobile && (
                <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar -mx-4 px-4 sticky top-[72px] z-30 bg-gray-50/95 backdrop-blur-sm py-2">
                    {[
                        { id: 'overview', label: 'Overview', icon: <Users size={18} /> },
                        { id: 'income', label: 'Income', icon: <DollarSign size={18} /> },
                        { id: 'business', label: 'Business', icon: <Briefcase size={18} /> },
                        { id: 'rank', label: 'Rank', icon: <Trophy size={18} /> },
                        { id: 'actions', label: 'Actions', icon: <PieChart size={18} /> },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-golden-500 text-white shadow-lg shadow-golden-500/30'
                                : 'bg-white text-gray-600 border border-gray-200 shadow-sm'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Hero Section / Welcome - MOVED TO TOP */}
            {(!isMobile || activeTab === 'overview') && (
                <motion.div
                    variants={cardVariants}
                    className="space-y-6"
                >
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#E6C65C] to-[#D4AF37] p-10 shadow-xl text-black"
                    >
                        <div className="relative z-10 mb-8">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900">
                                Welcome back, {user?.fullName?.split(' ')[0] || 'Partner'}! 👋
                            </h1>
                            <p className="text-xl font-medium text-gray-800/80 mt-2">Scale your success with the most powerful IVAMAX network tools.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/30 group">
                                <motion.img
                                    key={currentBannerIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    src={(() => {
                                        if (banners.length > 0 && banners[currentBannerIndex]?.image) {
                                            const path = banners[currentBannerIndex].image;
                                            if (path.startsWith('http')) return path;
                                            const cleanPath = path.replace(/\\/g, '/').replace(/^\//, '');
                                            return `${baseUrl}/${cleanPath}`;
                                        }
                                        return "https://wallpapers.com/images/hd/mafia-3-lincoln-clay-poster-9k7y7y7y7y7y7y7y.jpg";
                                    })()}
                                    className="absolute inset-0 w-full h-full object-cover z-0"
                                />
                                {banners.length > 0 && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 flex flex-col justify-end p-6">
                                        <h2 className="text-white text-3xl font-black mb-1">{banners[currentBannerIndex].title}</h2>
                                        <p className="text-gray-200 text-base line-clamp-2">{banners[currentBannerIndex].message}</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>

                            <div className="lg:col-span-1 bg-black/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-xl h-64 md:h-80 flex flex-col justify-center gap-8 relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-4 opacity-10"><Users size={150} /></div>
                                <div className="relative z-10">
                                    <span className="text-xs font-black uppercase tracking-[3px] text-black/40 block mb-2">Member Since</span>
                                    <span className="text-4xl font-black text-gray-900 block">{formatDate(stats.memberSince)}</span>
                                </div>
                                <div className="w-full h-px bg-black/10 relative z-10"></div>
                                <div className="relative z-10">
                                    <span className="text-xs font-black uppercase tracking-[3px] text-black/40 block mb-2">Network Size</span>
                                    <span className="text-4xl font-black text-gray-900 block">{stats.networkSize || 0} Members</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Business & Rank Section */}
            {(!isMobile || activeTab === 'overview' || activeTab === 'business' || activeTab === 'rank') && (
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                    {/* Business Overview - Left Section (2/3 width on desktop) */}
                    {(!isMobile || activeTab === 'overview' || activeTab === 'business') && (
                        <motion.div
                            variants={cardVariants}
                            whileHover={scaleOnHover}
                            className="lg:col-span-2 bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl overflow-hidden min-h-[480px] flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-10 text-[#0f172a]">
                                <h3 className="text-[28px] font-black tracking-tight">Business Overview</h3>
                                <div className="p-2 bg-[#f1f5f9] rounded-xl text-blue-500 cursor-pointer hover:bg-blue-50 transition-colors">
                                    <ArrowLeftRight size={22} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 flex-grow items-start">
                                {/* Left Pairs Card */}
                                <motion.div
                                    variants={cardVariants}
                                    whileHover={{ scale: 1.05, rotate: 1 }}
                                    className="bg-[#f0f7ff] rounded-3xl p-4 md:p-6 border border-[#e0f0ff] relative group col-span-1"
                                >
                                    <div className="absolute top-4 right-4 md:top-6 md:right-6 p-1.5 md:p-2 bg-white/80 rounded-lg text-[#3b82f6] shadow-sm">
                                        <ArrowLeftRight size={14} className="rotate-180 md:w-[18px] md:h-[18px]" />
                                    </div>
                                    <p className="text-[#3b82f6] font-bold text-xs md:text-sm tracking-tight mb-3 md:mb-6">Left Pairs</p>
                                    <h4 className="text-2xl md:text-[52px] font-black text-[#0f172a] leading-none mb-3 md:mb-6">{stats.leftPairs || 0}</h4>
                                    <div className="w-full h-1 md:h-1.5 bg-[#dbeafe] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#3b82f6] w-[15%]" />
                                    </div>
                                </motion.div>

                                {/* Right Pairs Card */}
                                <motion.div
                                    variants={cardVariants}
                                    whileHover={{ scale: 1.05, rotate: -1 }}
                                    className="bg-[#f0fdf4] rounded-3xl p-4 md:p-6 border border-[#dcfce7] relative group col-span-1"
                                >
                                    <div className="absolute top-4 right-4 md:top-6 md:right-6 p-1.5 md:p-2 bg-white/80 rounded-lg text-[#22c55e] shadow-sm">
                                        <ArrowLeftRight size={14} className="md:w-[18px] md:h-[18px]" />
                                    </div>
                                    <p className="text-[#22c55e] font-bold text-xs md:text-sm tracking-tight mb-3 md:mb-6">Right Pairs</p>
                                    <h4 className="text-2xl md:text-[52px] font-black text-[#0f172a] leading-none mb-3 md:mb-6">{stats.rightPairs || 0}</h4>
                                    <div className="w-full h-1 md:h-1.5 bg-[#dcfce7] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#22c55e] w-[10%]" />
                                    </div>
                                </motion.div>

                                {/* Matching Progress Card - Full Width on Mobile */}
                                <motion.div
                                    variants={cardVariants}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="bg-[#fffbeb] rounded-3xl p-4 md:p-6 border border-[#fef3c7] relative group shadow-sm col-span-2 md:col-span-1"
                                >
                                    <div className="absolute top-4 right-4 md:top-6 md:right-6 p-1.5 md:p-2 bg-white/80 rounded-lg text-[#f59e0b] shadow-sm">
                                        <Target size={14} className="md:w-[18px] md:h-[18px]" />
                                    </div>
                                    <p className="text-[#f59e0b] font-bold text-xs md:text-sm tracking-tight mb-3 md:mb-6">Matching Progress</p>
                                    <h4 className="text-3xl md:text-[52px] font-black text-[#0f172a] leading-none mb-3 md:mb-6">{matchingCount}</h4>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex-grow h-1.5 bg-[#fef3c7] rounded-full overflow-hidden mr-3">
                                            <div className="h-full bg-[#f59e0b]" style={{ width: `${matchingPercent}%` }} />
                                        </div>
                                        <span className="text-xs md:text-[14px] font-black text-[#f59e0b] whitespace-nowrap">{matchingPercent}%</span>
                                    </div>
                                </motion.div>

                                {/* Row 2: Rank Details - Side by Side on Mobile */}
                                {/* Current Rank Card */}
                                <motion.div
                                    variants={cardVariants}
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-[#faf5ff] rounded-3xl p-4 md:p-6 border border-[#f3e8ff] relative group col-span-1"
                                >
                                    <div className="absolute top-4 right-4 md:top-6 md:right-6 p-1.5 md:p-2 bg-white/80 rounded-lg text-[#a855f7] shadow-sm">
                                        <Trophy size={14} className="md:w-[18px] md:h-[18px]" />
                                    </div>
                                    <p className="text-[#a855f7] font-bold text-xs md:text-sm tracking-tight mb-3 md:mb-6">Current Rank</p>
                                    <h4 className="text-xl md:text-[36px] font-black text-[#0f172a] leading-none uppercase tracking-tight mb-3 md:mb-6 truncate">
                                        {stats.currentRank || 'MEMBER'}
                                    </h4>
                                    <div className="w-full h-1 md:h-1.5 bg-[#f3e8ff] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#a855f7] w-full" />
                                    </div>
                                </motion.div>

                                {/* Closing Rank / Next Milestone Card */}
                                <motion.div
                                    variants={cardVariants}
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-golden-50 rounded-3xl p-4 md:p-6 border border-golden-100 relative group col-span-1"
                                >
                                    <div className="absolute top-4 right-4 md:top-6 md:right-6 p-1.5 md:p-2 bg-white/80 rounded-lg text-golden-600 shadow-sm">
                                        <Award size={14} className="md:w-[18px] md:h-[18px]" />
                                    </div>
                                    <p className="text-golden-600 font-bold text-xs md:text-sm tracking-tight mb-3 md:mb-6">Closing Rank</p>
                                    <h4 className="text-xl md:text-[36px] font-black text-gray-900 leading-none uppercase tracking-tight mb-3 md:mb-6 truncate">
                                        {stats.nextRankName || 'GOLD'}
                                    </h4>
                                    <div className="w-full h-1 md:h-1.5 bg-golden-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-golden-500" style={{ width: `${stats.rankProgress || 0}%` }} />
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {/* Rank Status - Right Section (Dark Design from image) */}
                    {(!isMobile || activeTab === 'rank') && (
                        <motion.div
                            variants={cardVariants}
                            whileHover={{ scale: 1.02 }}
                            className="lg:col-span-1 bg-[#1a1f2e] rounded-[40px] p-10 border border-[#2d3748] shadow-2xl flex flex-col relative overflow-hidden h-full"
                        >
                            {/* Accent border at top */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-golden-400 to-golden-600 opacity-50" />

                            {/* Trophy Icon Header */}
                            <div className="flex justify-center mb-8">
                                <div className="w-20 h-20 bg-[#2d2218] rounded-3xl flex items-center justify-center shadow-lg border border-[#4a3a2a]">
                                    <Trophy className="text-golden-500" size={40} />
                                </div>
                            </div>

                            {/* Rank Info */}
                            <div className="text-center mb-10">
                                <p className="text-[#94a3b8] font-bold text-[14px] uppercase tracking-[3px] mb-4">Your Current Rank</p>
                                <h1 className="text-[64px] font-black text-white leading-none tracking-tight uppercase">
                                    {stats.currentRank || 'Member'}
                                </h1>
                            </div>

                            {/* Royalty Percentage Box */}
                            <div className="bg-[#242c3d] rounded-[32px] p-8 border border-[#334155] mb-10 flex flex-col gap-2 group hover:border-golden-500/50 transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[#94a3b8] font-black text-sm">Royalty Percentage</p>
                                    <Target className="text-golden-500" size={20} />
                                </div>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-[48px] font-black text-white leading-none">10%</span>
                                    <span className="text-golden-400 font-bold text-sm">of network earnings</span>
                                </div>
                            </div>

                            {/* Next Rank Progress at bottom */}
                            <div className="mt-auto pt-6 space-y-4">
                                <div className="flex items-center justify-between font-black uppercase tracking-wider text-[12px]">
                                    <span className="text-[#94a3b8]">Next Rank</span>
                                    <span className="text-golden-500">{stats.nextRankName || 'GOLD'}</span>
                                </div>
                                <div className="w-full h-2.5 bg-[#2d3748] rounded-full overflow-hidden shadow-inner flex">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.rankProgress || 65}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-golden-600 to-golden-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                                    />
                                </div>
                                <p className="text-center text-[#64748b] font-black text-[12px] uppercase">
                                    {stats.rankProgress || 65}% progress to next rank
                                </p>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* Income Cards */}
            {(!isMobile || activeTab === 'income') && (
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    {[
                        { label: "Total Income", value: stats.totalIncome || 0, color: "text-amber-500", icon: <DollarSign size={24} />, bg: "bg-[#fffbeb]" },
                        { label: "PMR Income", value: stats.pmrIncome || 0, color: "text-blue-500", icon: <TrendingUp size={24} />, bg: "bg-[#f0f7ff]" },
                        { label: "DRR Income", value: stats.drrIncome || 0, color: "text-green-500", icon: <Users size={24} />, bg: "bg-[#f0fdf4]" },
                        { label: "FCR Income", value: stats.fcrIncome || 0, color: "text-purple-500", icon: <Crown size={24} />, bg: "bg-[#faf5ff]" }
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            variants={cardVariants}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className={`${item.bg} rounded-3xl p-6 shadow-sm border border-black/5 flex flex-col justify-between h-36`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{item.label}</p>
                                    <h3 className={`text-4xl font-black mt-2 ${item.color}`}>${item.value}</h3>
                                </div>
                                <div className="p-2 bg-white/80 rounded-xl text-gray-400 shadow-sm">{item.icon}</div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Quick Actions */}
            {(!isMobile || activeTab === 'actions') && (
                <motion.div
                    variants={cardVariants}
                    className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl"
                >
                    <h3 className="text-2xl font-black text-[#0f172a] mb-10 flex items-center gap-3">
                        <PieChart className="text-purple-500" /> Quick Actions
                    </h3>
                    <motion.div
                        variants={containerVariants}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {[
                            { label: "Network Tree", icon: <TreeDeciduous size={28} />, color: "bg-blue-500", path: "/tree" },
                            { label: "Income Details", icon: <CircleDollarSign size={28} />, color: "bg-emerald-500", path: "/income" },
                            { label: "Withdraw Funds", icon: <Landmark size={28} />, color: "bg-purple-500", path: "/withdrawals" },
                            { label: "Analytics", icon: <BarChart3 size={28} />, color: "bg-orange-500", path: "/reports" }
                        ].map((action, index) => (
                            <motion.button
                                key={action.label}
                                variants={cardVariants}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(action.path)}
                                className="group bg-[#f8fafc] rounded-[32px] p-8 text-left border border-[#f1f5f9] hover:bg-white hover:shadow-2xl transition-all duration-300"
                            >
                                <div className={`w-16 h-16 rounded-[24px] ${action.color} flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform`}>{action.icon}</div>
                                <h4 className="text-[22px] font-black text-[#0f172a] mb-2 leading-none">{action.label}</h4>
                                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    Open <ChevronRight size={18} />
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default Dashboard;