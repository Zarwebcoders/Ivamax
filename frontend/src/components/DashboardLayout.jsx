import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from './NotificationBell';
import {
    FiHome,
    FiUser,
    FiBriefcase,
    FiLayers,
    FiDollarSign,
    FiFileText,
    FiCreditCard,
    FiLogOut,
    FiChevronLeft,
    FiChevronRight,
    FiMenu,
    FiMoreVertical,
    FiPackage,
    FiHeadphones
} from 'react-icons/fi';

const DashboardLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { walletAddress, isConnected, connectWallet, disconnectWallet } = useWallet();
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: FiHome },
        { path: '/profile', label: 'Profile', icon: FiUser },
        { path: '/business', label: 'Business', icon: FiBriefcase },
        { path: '/tree', label: 'Tree View', icon: FiLayers },
        { path: '/income', label: 'Income', icon: FiDollarSign },
        { path: '/reports', label: 'Reports', icon: FiFileText },
        { path: '/withdrawals', label: 'Withdrawals', icon: FiCreditCard },
        { path: '/packages', label: 'Packages', icon: FiPackage },
        { path: '/support', label: 'Support', icon: FiHeadphones },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleConnectWallet = async () => {
        try {
            await connectWallet();
        } catch (error) {
            alert('Failed to connect wallet: ' + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 relative overflow-x-hidden flex">
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isMobile && sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 z-[90] backdrop-blur-md"
                    />
                )}
            </AnimatePresence>

            {/* Floating Sidebar */}
            <aside
                className={`
                    fixed z-[100] transition-all duration-300 ease-out
                    glass bg-white/95 backdrop-blur-xl
                    border-r border-gray-200 shadow-2xl shadow-black/30
                    flex flex-col
                    ${isMobile
                        ? (sidebarOpen ? 'translate-x-0 left-0 w-64 top-0 h-[100dvh] rounded-r-3xl border-y-0 border-l-0' : '-translate-x-full left-0 w-64 top-0 h-[100dvh]')
                        : (sidebarOpen ? 'top-4 h-[calc(100vh-2rem)] left-4 w-64 rounded-3xl border border-black' : 'top-4 h-[calc(100vh-2rem)] left-4 w-20 rounded-3xl border border-black')
                    }
                `}
            >
                {/* Logo Area */}
                <div className={`h-16 flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'} relative border-b border-gray-300 mx-4`}>
                    <div className={`flex items-center gap-3 transition-all duration-300 ${sidebarOpen ? 'scale-100' : 'scale-90'}`}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-golden-400 to-golden-600 flex items-center justify-center shadow-lg shadow-golden-500/20 transform hover:rotate-12 transition-transform duration-300">
                            <span className="text-white font-bold text-xl tracking-tight">IV</span>
                        </div>

                        <div className={`overflow-hidden transition-all duration-300 ${sidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                            <h1 className="font-bold text-2xl tracking-tight text-gray-900">
                                IVA<span className="text-golden-600">MAX</span>
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 py-1 md:py-3 px-2 space-y-1 md:space-y-2 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => isMobile && setSidebarOpen(false)}
                                className={`
                                    relative flex items-center h-12 rounded-xl transition-all duration-300 group
                                    ${isActive
                                        ? 'bg-gradient-to-r from-golden-50 to-golden-50 text-golden-700 shadow-sm border border-golden-200 shadow-black/50'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-golden-600'
                                    }
                                    ${sidebarOpen ? 'px-4' : 'justify-center px-0'}
                                `}
                            >
                                {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-golden-500 rounded-r-full"></div>}

                                <Icon className={`text-xl flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />

                                <span className={`whitespace-nowrap font-medium ml-4 transition-all duration-300 ${sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile Snippet (Bottom) */}
                <div className={`p-4 mx-2 mb-2 rounded-2xl transition-all duration-300 ${sidebarOpen ? 'bg-gradient-to-r from-gray-100 to-gray-400 border border-gray-400' : 'bg-transparent'}`}>
                    <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center text-gray-600 font-bold shadow-inner">
                            {user?.fullName?.charAt(0) || 'U'}
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName || 'User'}</p>
                                <p className="text-xs text-gray-400 truncate">ID: {user?.userId}</p>
                            </div>
                        )}
                        {sidebarOpen && (
                            <button
                                onClick={handleLogout}
                                className="p-2 text-red-600 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                title="Logout"
                            >
                                <FiLogOut size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Toggle Button - Separate on Mobile to be always visible */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`
                    fixed z-[101] flex items-center justify-center w-10 h-10 
                    bg-white border border-gray-400 shadow-lg shadow-black/30 text-gray-700 
                    hover:text-golden-600 transition-all cursor-pointer
                    ${isMobile
                        ? (sidebarOpen ? 'left-[236px] top-[26px] rounded-full' : 'left-0 top-[26px] rounded-r-xl border-l-0')
                        : (sidebarOpen ? 'left-[246px] top-[30px] rounded-full' : 'left-[82px] top-[40px] rounded-full')
                    }
                `}
            >
                {isMobile
                    ? (sidebarOpen ? <FiChevronLeft size={20} /> : <FiMenu size={24} />)
                    : (sidebarOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />)
                }
            </button>


            {/* Main Content Area */}
            <div className={`
                flex-1 transition-all duration-300 ease-out min-h-screen
                ${isMobile ? 'ml-0 w-full' : (sidebarOpen ? 'ml-80' : 'ml-32')}
                sm:mr-4 my-4
                ${isMobile ? 'px-2' : ''}
            `}>
                {/* Top Navbar (Floating) */}
                <header className={`
                    h-20 rounded-xl bg-white backdrop-blur-md shadow-2xl shadow-black/30 border border-golden-400 
                    flex items-center justify-between sticky top-0 z-30 mb-6 transition-all duration-300
                    ${isMobile ? 'px-4 ml-12' : 'px-8'}
                `}>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            Dashboard
                        </h2>
                        {!isMobile && <p className="text-sm text-gray-500">Welcome back to your financial overview</p>}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notification Bell */}
                        <NotificationBell />

                        {/* Wallet Button */}
                        {!isConnected ? (
                            <button
                                onClick={handleConnectWallet}
                                className="px-6 py-2.5 bg-gradient-to-r from-golden-500 to-golden-600 text-white rounded-xl shadow-lg shadow-golden-500/30 hover:shadow-golden-500/40 hover:-translate-y-0.5 transition-all font-medium text-sm flex items-center gap-2"
                            >
                                <FiCreditCard />
                                <span className={isMobile ? 'hidden' : 'block'}>Connect Wallet</span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-3 px-5 py-2.5 bg-white border border-green-400 rounded-xl shadow-lg shadow-green-300 font-medium text-sm">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <div className="text-xs">
                                        <p className="text-gray-500 font-medium">{isMobile ? '' : 'Connected'}</p>
                                        <p className="font-mono font-bold text-gray-700">
                                            {walletAddress?.slice(0, 6)}...
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={disconnectWallet}
                                    className="p-2.5 bg-red-50 text-red-500 border border-red-400 rounded-xl hover:bg-red-300 hover:text-black transition-colors shadow-sm"
                                    title="Disconnect Wallet"
                                >
                                    <FiLogOut size={15} />
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="animate-fade-in space-y-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

