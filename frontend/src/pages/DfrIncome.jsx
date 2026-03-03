import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiCalendar, FiArrowUpRight, FiSearch, FiFilter, FiDownload } from 'react-icons/fi';
import { incomeService } from '../services/income.service';
import { useAuth } from '../context/AuthContext';

const DfrIncome = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        recent: 0
    });

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await incomeService.getDfrHistory();
                if (response.success) {
                    setHistory(response.data);

                    // Calculate stats
                    const total = response.data.reduce((sum, item) => sum + item.amount, 0);
                    const lastMonth = new Date();
                    lastMonth.setMonth(lastMonth.getMonth() - 1);
                    const recent = response.data
                        .filter(item => new Date(item.date) > lastMonth)
                        .reduce((sum, item) => sum + item.amount, 0);

                    setStats({ total, recent });
                }
            } catch (error) {
                console.error('Error fetching DFR history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 pb-10"
        >
            {/* Header section with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={cardVariants} className="glass p-8 rounded-3xl border border-golden-400 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <FiDollarSign size={80} className="text-golden-600" />
                    </div>
                    <p className="text-gray-500 font-medium mb-1">Total Daily Fix Return</p>
                    <h3 className="text-4xl font-black text-gray-900 tracking-tight">
                        ${stats.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <div className="mt-4 flex items-center gap-2 text-green-500 text-sm bg-green-50 px-3 py-1 rounded-full w-fit">
                        <FiArrowUpRight />
                        <span>0.125% Daily ROI</span>
                    </div>
                </motion.div>

                <motion.div variants={cardVariants} className="glass p-8 rounded-3xl border border-golden-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <FiCalendar size={80} className="text-golden-600" />
                    </div>
                    <p className="text-gray-500 font-medium mb-1">Recent ROI (30 Days)</p>
                    <h3 className="text-4xl font-black text-gray-900 tracking-tight">
                        ${stats.recent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <div className="mt-4 flex items-center gap-2 text-golden-600 text-sm bg-golden-50 px-3 py-1 rounded-full w-fit">
                        <FiCalendar />
                        <span>Current Month</span>
                    </div>
                </motion.div>

                <motion.div variants={cardVariants} className="glass p-8 rounded-3xl border border-blue-200 relative overflow-hidden group">
                    <p className="text-gray-500 font-medium mb-1">Direct Referral Bonus</p>
                    <h3 className="text-4xl font-black text-gray-900 tracking-tight">5%</h3>
                    <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                        Earn 5% on every direct referral package activation (DIR Income).
                    </p>
                </motion.div>
            </div>

            {/* Income History Table */}
            <motion.div variants={cardVariants} className="glass rounded-3xl border border-gray-100 overflow-hidden shadow-2xl shadow-black/5">
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Daily Fix Return History</h2>
                        <p className="text-gray-500 text-sm mt-1">Real-time tracking of your 0.125% daily returns</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-3 text-gray-500 hover:text-golden-600 rounded-xl bg-gray-50 transition-colors">
                            <FiSearch size={20} />
                        </button>
                        <button className="p-3 text-gray-500 hover:text-golden-600 rounded-xl bg-gray-50 transition-colors">
                            <FiFilter size={20} />
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all font-semibold shadow-lg shadow-black/20">
                            <FiDownload />
                            <span>Export</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Date</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Description</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 font-mono">Amount</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 font-mono">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="4" className="px-8 py-6 h-16 bg-gray-50/20"></td>
                                    </tr>
                                ))
                            ) : history.length > 0 ? (
                                history.map((item, index) => (
                                    <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-golden-50 flex items-center justify-center text-golden-600">
                                                    <FiCalendar />
                                                </div>
                                                <span className="font-semibold text-gray-700">
                                                    {new Date(item.date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-gray-600 font-medium">{item.description}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xl font-black text-gray-900">
                                                ${item.amount.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${item.status === 'paid'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-golden-100 text-golden-700'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center text-gray-400">
                                        <div className="max-w-xs mx-auto space-y-4">
                                            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto text-gray-200">
                                                <FiDollarSign size={40} />
                                            </div>
                                            <p className="font-medium text-lg text-gray-500">No DFR income found yet</p>
                                            <p className="text-sm">Refer more users and help them activate packages to start earning!</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DfrIncome;
