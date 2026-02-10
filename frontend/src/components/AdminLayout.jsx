import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Wallet,
    CreditCard,
    ArrowDownLeft,
    DollarSign,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
    const { logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    const menuItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/users', icon: Users, label: 'User Management' },
        { path: '/admin/deposit-approvals', icon: CreditCard, label: 'Deposit Approvals' },
        { path: '/admin/wallet-approvals', icon: Wallet, label: 'Wallet Approvals' },
        { path: '/admin/withdrawal-approvals', icon: ArrowDownLeft, label: 'Withdrawal Approvals' },
        { path: '/admin/income-processing', icon: DollarSign, label: 'Income Processing' },
    ];

    const isActive = (path) => {
        if (path === '/admin' && location.pathname !== '/admin') return false;
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 260 : 80 }}
                className="hidden md:flex flex-col bg-white border-r border-gray-200 h-screen sticky top-0 z-30 transition-all duration-300 relative"
            >
                <div className="p-6 flex items-center justify-between">
                    <div className={`flex items-center gap-3 overflow-hidden ${!sidebarOpen && 'justify-center w-full'}`}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-golden-400 to-golden-600 flex items-center justify-center shrink-0 shadow-lg shadow-golden-500/20">
                            <span className="text-white font-bold text-xl">A</span>
                        </div>
                        {sidebarOpen && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h1 className="font-bold text-gray-900 text-lg leading-tight">Admin<br /><span className="text-golden-600">Panel</span></h1>
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive(item.path)
                                    ? 'bg-golden-50 text-golden-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                } ${!sidebarOpen && 'justify-center'}`}
                        >
                            {isActive(item.path) && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-golden-500 rounded-r-full" />
                            )}
                            <item.icon size={22} className={`shrink-0 ${isActive(item.path) ? 'text-golden-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            {sidebarOpen && (
                                <span className="font-medium whitespace-nowrap">{item.label}</span>
                            )}
                            {!sidebarOpen && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={logout}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors ${!sidebarOpen && 'justify-center'}`}
                    >
                        <LogOut size={22} className="shrink-0" />
                        {sidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:shadow-md text-gray-500 hover:text-golden-600 transition-all z-40 hidden md:block"
                >
                    {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
                </button>
            </motion.aside>

            {/* Mobile Header & Sidebar */}
            <div className="md:hidden fixed top-0 w-full bg-white z-40 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-golden-400 to-golden-600 flex items-center justify-center">
                        <span className="text-white font-bold">A</span>
                    </div>
                    <span className="font-bold text-gray-900">Admin Panel</span>
                </div>
                <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-600">
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="fixed inset-0 z-30 bg-white md:hidden pt-20 px-4"
                    >
                        <div className="space-y-2">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-medium ${isActive(item.path)
                                            ? 'bg-golden-50 text-golden-700'
                                            : 'text-gray-600'
                                        }`}
                                >
                                    <item.icon size={24} />
                                    {item.label}
                                </Link>
                            ))}
                            <button
                                onClick={logout}
                                className="flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-medium text-red-600 w-full text-left"
                            >
                                <LogOut size={24} />
                                Logout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-8 pt-20 md:pt-8 w-full overflow-x-hidden">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
