import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, Crown, DollarSign, Clock, Landmark, PieChart, ArrowRightLeft, Trophy, Target, TreeDeciduous, BarChart3, CircleDollarSign, Briefcase, Copy, Check, MessageCircle, Send, Award, ExternalLink, UserPlus, Bell } from 'lucide-react';
import { announcementService } from '../services/announcement.service';
import { dashboardService } from '../services/dashboard.service';
import { getNotifications } from '../services/notification.service';
import NewsTicker from '../components/NewsTicker';
import ReferralCard from '../components/ReferralCard';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({});
    const [notifications, setNotifications] = useState([]);

    // Banner states
    const [banners, setBanners] = useState([]);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    // UI states
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('income');

    const [isMobile, setIsMobile] = useState(false);
    const [isBusinessFlipped, setIsBusinessFlipped] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetch for stats, announcements, and notifications
                const [statsResponse, announcementsResponse, notificationsResponse] = await Promise.all([
                    dashboardService.getStats(),
                    announcementService.getActiveAnnouncements(),
                    getNotifications({ limit: 5 })
                ]);

                if (statsResponse.success) {
                    setStats(prev => ({ ...prev, ...statsResponse.data }));
                }

                if (announcementsResponse.success) {
                    const bannerItems = announcementsResponse.data.filter(a => a.type === 'banner');
                    setBanners(bannerItems);
                }

                if (notificationsResponse.success) {
                    setNotifications(notificationsResponse.data.slice(0, 5));
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

            {/* Activation Notice */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm flex items-center gap-4"
            >
                <div className="bg-red-100 p-2 rounded-full">
                    <Clock className="text-red-600" size={20} />
                </div>
                <div>
                    <p className="text-red-800 font-black text-xs md:text-sm uppercase tracking-wider">
                        Account Activation Required
                    </p>
                    <p className="text-red-600 text-[10px] md:text-xs font-bold">
                        Please activate your ID within 24 hours to secure your position and start earning.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/packages')}
                    className="ml-auto bg-red-600 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                    Activate Now
                </button>
            </motion.div>

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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Banner Image */}
                        <div className="lg:col-span-2 relative w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 group">
                            {/* Banner Image */}
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

                        {/* Referral / Stats Card */}
                        <div className="lg:col-span-1 bg-[#C5A02E]/40 backdrop-blur-sm rounded-2xl p-6 border-4 border-white/20 shadow-2xl h-64 md:h-80 flex flex-col justify-center gap-6 relative overflow-hidden">
                            {/* Decorative Icon Background */}
                            <div className="absolute -right-4 -bottom-4 opacity-10">
                                <Users size={120} className="text-[#5A4610]" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-[#5A4610]/10 rounded-lg">
                                        <Clock className="text-[#5A4610]" size={20} />
                                    </div>
                                    <span className="text-sm font-bold uppercase tracking-wider text-[#5A4610]">Member Since</span>
                                </div>
                                <span className="text-3xl font-black text-gray-900 block">{stats.memberSince ? formatDate(stats.memberSince) : 'Recent'}</span>
                            </div>

                            <div className="w-full h-px bg-[#8B701D]/20 relative z-10"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-[#5A4610]/10 rounded-lg">
                                        <Users className="text-[#5A4610]" size={20} />
                                    </div>
                                    <span className="text-sm font-bold uppercase tracking-wider text-[#5A4610]">Network Size</span>
                                </div>
                                <span className="text-3xl font-black text-gray-900 block">{stats.networkSize || 0} <span className="text-lg font-bold text-[#5A4610]/80">Members</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Income Stats Cards */}
            {(!isMobile || activeTab === 'income') && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Total Income", value: stats.totalIncome || 0, color: "text-amber-500", bgIcon: "bg-amber-100", icon: <DollarSign size={24} className="text-amber-600" /> },
                        { label: "PMR Income", value: stats.pmrIncome || 0, color: "text-blue-500", bgIcon: "bg-blue-100", icon: <TrendingUp size={24} className="text-blue-600" /> },
                        { label: "DRR Income", value: stats.drrIncome || 0, color: "text-green-500", bgIcon: "bg-green-100", icon: <Users size={24} className="text-green-600" /> },
                        { label: "FCR Income", value: stats.fcrIncome || 0, color: "text-purple-500", bgIcon: "bg-purple-100", icon: <Crown size={24} className="text-purple-600" /> }
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
            {/*       */}

            {/* Business Overview & Notifications Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Business Overview */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-400 shadow-xl overflow-hidden min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-gray-900">Business Overview</h3>
                        <Briefcase className="text-gray-400" size={24} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                            <p className="text-blue-600 font-bold uppercase tracking-wider text-xs mb-1">Left Pairs</p>
                            <h4 className="text-4xl font-black text-gray-900">{stats.leftPairs || 0}</h4>
                        </div>
                        <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                            <p className="text-emerald-600 font-bold uppercase tracking-wider text-xs mb-1">Right Pairs</p>
                            <h4 className="text-4xl font-black text-gray-900">{stats.rightPairs || 0}</h4>
                        </div>
                        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                            <p className="text-amber-600 font-bold uppercase tracking-wider text-xs mb-1">Matching</p>
                            <h4 className="text-4xl font-black text-gray-900">{Math.min(stats.leftPairs || 0, stats.rightPairs || 0)}</h4>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-between items-center bg-gray-50 rounded-2xl p-4 border border-gray-200">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase">Current Rank</p>
                            <p className="text-xl font-black text-gray-900 uppercase">{stats.currentRank}</p>
                        </div>
                        <div className="w-12 h-12 bg-golden-100 rounded-xl flex items-center justify-center">
                            <Trophy className="text-golden-600" size={24} />
                        </div>
                    </div>
                </div>

                {/* Notifications Panel */}
                <div className="lg:col-span-1 bg-white rounded-3xl p-8 border border-gray-400 shadow-xl flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-black text-gray-900">Notifications</h3>
                        <Bell className="text-gray-400" size={24} />
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                        {notifications.length > 0 ? (
                            notifications.map((notif, idx) => (
                                <motion.div
                                    key={notif._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-golden-200 transition-colors"
                                >
                                    <div className="flex gap-3">
                                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${notif.isRead ? 'bg-gray-300' : 'bg-golden-500 animate-pulse'}`}></div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 line-clamp-1">{notif.title}</p>
                                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">{notif.message}</p>
                                            <p className="text-[10px] text-gray-400 mt-2">{new Date(notif.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center py-10">
                                <MessageCircle className="text-gray-200 mb-3" size={48} />
                                <p className="text-gray-400 text-sm font-medium">No new notifications</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => navigate('/notifications')}
                        className="mt-6 w-full py-4 rounded-2xl bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                    >
                        View All Notifications
                    </button>
                </div>
            </div>

            {/* Financial Overview - Moved to Withdrawals page */}
            {/*
                (!isMobile || activeTab === 'withdrawal') && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                        {[
                            {
                                label: "Available Balance",
                                value: (stats.totalIncome || 0) - (stats.totalWithdrawn || 0),
                                icon: <DollarSign size={24} />,
                                color: "text-green-600",
                                bgColor: "bg-gradient-to-br from-green-100 to-emerald-100",
                                borderColor: "border-green-500",
                                action: "Withdraw Now"
                            },
                            {
                                label: "Total Withdrawn",
                                value: stats.totalWithdrawn || 0,
                                icon: <Landmark size={24} />,
                                color: "text-blue-600",
                                bgColor: "bg-gradient-to-br from-blue-100 to-cyan-100",
                                borderColor: "border-blue-500",
                                action: "View History"
                            },
                            {
                                label: "Pending Requests",
                                value: stats.pendingWithdrawals || 0,
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
                                    <button 
                                        onClick={() => navigate('/withdrawals')}
                                        className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-300 shadow-lg hover:shadow-black/40 shadow-black/20 ${item.label === "Available Balance"
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
            */}

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