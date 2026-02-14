import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, Crown, DollarSign, Clock, Landmark, PieChart, ArrowRightLeft, Trophy, Target, TreeDeciduous, BarChart3, CircleDollarSign, Briefcase, Copy, Check, MessageCircle, Send } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState('income');
    const [activeRefTab, setActiveRefTab] = useState('left');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetch for stats and announcements
                const [statsResponse, announcementsResponse] = await Promise.all([
                    dashboardService.getStats(),
                    announcementService.getActiveAnnouncements()
                ]);

                if (statsResponse.success) {
                    setStats(prev => ({ ...prev, ...statsResponse.data }));

                    // Auto-select valid tab logic...
                    if (statsResponse.data.isLeftDirectFilled && activeRefTab === 'left') {
                        setActiveRefTab('placing-left');
                    } else if (statsResponse.data.isRightDirectFilled && activeRefTab === 'right') {
                        setActiveRefTab('placing-right');
                    }
                }

                if (announcementsResponse.success) {
                    // Filter for banners
                    const bannerItems = announcementsResponse.data.filter(a => a.type === 'banner');
                    setBanners(bannerItems);
                }

            } catch (error) {
                console.error("Failed to fetch data", error);
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

            {/* Banner Section */}









            {/* Mobile Tab Navigation */}
            {isMobile && (
                <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar -mx-4 px-4 sticky top-[72px] z-30 bg-gray-50/95 backdrop-blur-sm py-2">
                    {[
                        { id: 'overview', label: 'Overview', icon: <Users size={18} /> },
                        { id: 'income', label: 'Income', icon: <DollarSign size={18} /> },
                        { id: 'business', label: 'Business', icon: <Briefcase size={18} /> },
                        { id: 'rank', label: 'Rank', icon: <Trophy size={18} /> },
                        { id: 'withdrawal', label: 'Withdrawal', icon: <Landmark size={18} /> },
                        { id: 'actions', label: 'Actions', icon: <PieChart size={18} /> },

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
            )}

            {/* Header / Hero Section */}
            {(!isMobile || activeTab === 'overview') && (
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E6C65C] to-[#D4AF37] p-8 shadow-xl text-black">
                    {/* Welcome Text */}
                    <div className="relative z-10 mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
                                Welcome back, Partner! <span className="text-4xl">👋</span>
                            </h1>
                        </div>
                        <p className="text-lg font-medium text-gray-800/80 max-w-2xl">
                            Track your earnings, manage your network, and grow your business with IVAMAX
                        </p>
                    </div>

                    {/* Banner / Graphic Area */}
                    <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 mb-8 group">
                        {/* Announcement Badge */}
                        <div className="absolute top-4 left-4 z-20">
                            <div className="bg-white/90 backdrop-blur-md rounded-full pl-2 pr-4 py-2 flex items-center gap-3 shadow-lg border border-purple-100">
                                <div className="bg-purple-600 p-2 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-purple-900 uppercase tracking-wider">ANNOUNCEMENT <span className="text-purple-500 ml-1">1/2</span></p>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Main Banner Image */}
                        <motion.img
                            key={currentBannerIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            src={(() => {
                                if (banners.length > 0 && banners[currentBannerIndex]?.image) {
                                    const path = banners[currentBannerIndex].image;
                                    if (path.startsWith('http')) return path;
                                    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
                                    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
                                    return `${baseUrl}/${cleanPath.replace(/\\/g, '/')}`;
                                }
                                return "https://wallpapers.com/images/hd/mafia-3-lincoln-clay-poster-9k7y7y7y7y7y7y7y.jpg";
                            })()}
                            alt={banners[currentBannerIndex]?.title || 'Banner'}
                            className="absolute inset-0 w-full h-full object-cover z-0"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://wallpapers.com/images/hd/mafia-3-lincoln-clay-poster-9k7y7y7y7y7y7y7y.jpg'
                            }}
                        />

                        {/* Banner Overlay Content (Text) */}
                        {banners.length > 0 && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 flex flex-col justify-end p-6">
                                {banners[currentBannerIndex].title && (
                                    <motion.h2
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="text-white text-2xl md:text-3xl font-bold mb-2 shadow-sm"
                                    >
                                        {banners[currentBannerIndex].title}
                                    </motion.h2>
                                )}
                                {banners[currentBannerIndex].message && (
                                    <p className="text-gray-200 text-sm md:text-base line-clamp-2 max-w-2xl">
                                        {banners[currentBannerIndex].message}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Indicators */}
                        {banners.length > 1 && (
                            <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                                {banners.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentBannerIndex(idx)}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentBannerIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>

                    {/* Stats Footer in Hero */}
                    <div className="flex gap-4">
                        <div className="bg-[#C5A02E]/40 backdrop-blur-sm rounded-xl px-6 py-3 border border-[#8B701D]/20">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#5A4610] block mb-1">Member Since</span>
                            <span className="text-lg font-black text-gray-900">{formatDate(stats.memberSince)}</span>
                        </div>
                        <div className="bg-[#C5A02E]/40 backdrop-blur-sm rounded-xl px-6 py-3 border border-[#8B701D]/20">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#5A4610] block mb-1">Network Size</span>
                            <span className="text-lg font-black text-gray-900">{stats.networkSize} Members</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Income Stats Cards */}
            {(!isMobile || activeTab === 'income') && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Total Income", value: stats.totalIncome, color: "text-amber-500", bgIcon: "bg-amber-100", icon: <DollarSign size={24} className="text-amber-600" /> },
                        { label: "PMR Income", value: stats.pmrIncome, color: "text-blue-500", bgIcon: "bg-blue-100", icon: <TrendingUp size={24} className="text-blue-600" /> },
                        { label: "DRR Income", value: stats.drrIncome, color: "text-green-500", bgIcon: "bg-green-100", icon: <Users size={24} className="text-green-600" /> },
                        { label: "FCR Income", value: stats.fcrIncome, color: "text-purple-500", bgIcon: "bg-purple-100", icon: <Crown size={24} className="text-purple-600" /> }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-40 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">{item.label}</p>
                                    <h3 className={`text-4xl font-black mt-2 ${item.color}`}>${item.value}</h3>
                                </div>
                                <div className={`${item.bgIcon} p-3 rounded-2xl`}>
                                    {item.icon}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold">
                                <span className="text-green-500 flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                                    +100.0%
                                </span>
                                <span className="text-gray-400 uppercase">vs Last Month</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Referral / Network Section */}
            {(!isMobile || activeTab === 'overview') && (
                <div className="rounded-3xl bg-gradient-to-br from-[#E6C65C] to-[#D4AF37] p-8 shadow-xl relative overflow-hidden">
                    {/* Header */}
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <TreeDeciduous size={120} />
                    </div>

                    <div className="flex flex-col items-center justify-center relative z-10">
                        {/* Tree Visual */}
                        <div className="flex flex-col items-center mb-8 w-full max-w-lg">
                            {/* Top Node */}
                            <div className="mb-4">
                                <span className="text-yellow-100 font-bold text-4xl opacity-50 block text-center mb-2">{user?.userId}</span>
                            </div>

                            {/* Control Nodes */}
                            <div className="flex items-center gap-8 md:gap-16">
                                {/* Left Side */}
                                <div className="flex flex-col items-center gap-2">
                                    <button
                                        disabled
                                        className="relative bg-gray-600/40 backdrop-blur text-white px-6 py-2 rounded-full text-sm font-bold border border-white/20"
                                    >
                                        Left Link
                                        {/* Badge */}
                                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider">Filled</div>
                                    </button>

                                    <button
                                        onClick={() => setActiveRefTab('placing-left')}
                                        className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wide transition-all shadow-lg ${activeRefTab === 'placing-left'
                                            ? 'bg-[#E86C3F] text-white ring-4 ring-[#E86C3F]/30 transform scale-105'
                                            : 'bg-[#CCA34A] text-[#5A4610] hover:bg-[#E86C3F] hover:text-white'
                                            }`}
                                    >
                                        Placing Left
                                    </button>
                                </div>

                                {/* Right Side */}
                                <div className="flex flex-col items-center gap-2">
                                    <button
                                        disabled
                                        className="relative bg-gray-600/40 backdrop-blur text-white px-6 py-2 rounded-full text-sm font-bold border border-white/20"
                                    >
                                        Right Link
                                        {/* Badge */}
                                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider">Filled</div>
                                    </button>

                                    <button
                                        onClick={() => setActiveRefTab('placing-right')}
                                        className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wide transition-all shadow-lg ${activeRefTab === 'placing-right'
                                            ? 'bg-[#E86C3F] text-white ring-4 ring-[#E86C3F]/30 transform scale-105'
                                            : 'bg-[#CCA34A] text-[#5A4610] hover:bg-[#E86C3F] hover:text-white'
                                            }`}
                                    >
                                        Placing Right
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Copy Link Input */}
                        <div className="w-full max-w-3xl bg-[#C5A02E]/60 backdrop-blur-md rounded-xl p-3 flex items-center border border-[#8B701D]/30 shadow-inner mb-4">
                            <input
                                type="text"
                                readOnly
                                value={`${window.location.origin}/register?ref=${user?.userId}&position=${activeRefTab === 'placing-left' || activeRefTab === 'placing-right' ? (activeRefTab === 'placing-left' ? 'placing-left' : 'placing-right') : activeRefTab}`}
                                className="flex-1 bg-transparent px-4 text-sm font-bold text-black outline-none w-full"
                            />
                            <button
                                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/register?ref=${user?.userId}&position=${activeRefTab === 'placing-left' || activeRefTab === 'placing-right' ? (activeRefTab === 'placing-left' ? 'placing-left' : 'placing-right') : activeRefTab}`)}
                                className="bg-black hover:bg-gray-900 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-colors"
                            >
                                <Copy size={14} /> Copy
                            </button>
                        </div>

                        {/* Social Buttons */}
                        <div className="w-full max-w-3xl grid grid-cols-3 gap-3">
                            <button className="bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold uppercase text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95">
                                <MessageCircle size={18} /> WhatsApp
                            </button>
                            <button className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90 text-white py-3 rounded-xl font-bold uppercase text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                Instagram
                            </button>
                            <button className="bg-[#0088cc] hover:bg-[#0077b5] text-white py-3 rounded-xl font-bold uppercase text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95">
                                <Send size={18} /> Telegram
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Business Overview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {((!isMobile || activeTab === 'business')) && (
                    <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-gray-900">Business Overview</h3>
                            <button className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors">
                                <ArrowRightLeft size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Left Pairs Card */}
                            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">Left Pairs</span>
                                    <div className="bg-blue-500 text-white p-1 rounded">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                                    </div>
                                </div>
                                <h4 className="text-4xl font-black text-gray-900">{stats.leftPairs || 0}</h4>
                            </div>

                            {/* Right Pairs Card */}
                            <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-emerald-600 font-bold uppercase tracking-wider text-sm">Right Pairs</span>
                                    <div className="bg-emerald-500 text-white p-1 rounded">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                    </div>
                                </div>
                                <h4 className="text-4xl font-black text-gray-900">{stats.rightPairs || 0}</h4>
                            </div>
                        </div>

                        {/* Matching Progress */}
                        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-amber-600 font-bold uppercase tracking-wider text-sm">Matching Progress</span>
                                <Target className="text-amber-500" size={20} />
                            </div>
                            <div className="flex items-end gap-2 mb-2">
                                <h4 className="text-4xl font-black text-gray-900">{Math.min(stats.leftPairs || 0, stats.rightPairs || 0)}</h4>
                            </div>
                            <div className="h-2 w-full bg-amber-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-500"
                                    style={{ width: `${stats.rightPairs > 0 && stats.leftPairs > 0 ? (Math.min(stats.leftPairs, stats.rightPairs) / Math.max(stats.leftPairs, stats.rightPairs)) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rank Card */}
                {(!isMobile || activeTab === 'rank') && (
                    <div className="bg-[#1a1a1a] rounded-3xl p-8 text-white flex flex-col items-center text-center justify-center border border-gray-800 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Crown size={180} />
                        </div>

                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-[#C5A02E]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#C5A02E]/40">
                                <Trophy className="text-[#FDD835]" size={40} />
                            </div>

                            <h3 className="text-amber-400 font-bold text-sm uppercase tracking-widest mb-2">Your Current Rank</h3>
                            <h2 className="text-4xl font-black text-white mb-1">{stats.currentRank}</h2>
                        </div>
                    </div>
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