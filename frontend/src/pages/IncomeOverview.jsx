import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Calendar, Download, Filter, ChevronDown, PieChart } from 'lucide-react';

const IncomeOverview = () => {
    const [activeTab, setActiveTab] = useState('all');

    // Mock Data
    const incomeStats = {
        totalIncome: 12500,
        pmr: 8000,
        drr: 3000,
        fcr: 1500,
    };

    const transactions = [
        { id: 'TXN001', type: 'PMR Income', amount: 200, date: '2024-02-03', status: 'Credited' },
        { id: 'TXN002', type: 'DRR Income', amount: 50, date: '2024-02-03', status: 'Credited' },
        { id: 'TXN003', type: 'FCR Income', amount: 120, date: '2024-02-02', status: 'Credited' },
        { id: 'TXN004', type: 'PMR Income', amount: 300, date: '2024-02-01', status: 'Credited' },
        { id: 'TXN005', type: 'Level Income', amount: 25, date: '2024-02-01', status: 'Credited' },
    ];

    const filteredTransactions = activeTab === 'all'
        ? transactions
        : transactions.filter(txn => txn.type.toLowerCase().includes(activeTab));

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 min-h-screen bg-gray-50"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 card-glass p-6 border-2 border-gray-400 shadow-lg shadow-gray-400">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Income Overview</h1>
                    <p className="text-gray-500"> detailed breakdown of your earnings</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-400 rounded-lg hover:bg-gray-50 text-gray-600">
                        <Calendar size={16} />
                        Date Range
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-golden-50 text-golden-700 border border-golden-400 rounded-lg hover:bg-golden-100">
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Total Income Banner */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <DollarSign size={150} />
                </div>
                <div className="relative z-10">
                    <p className="text-gray-400 mb-2">Total Earnings</p>
                    <h2 className="text-5xl font-bold mb-6">${incomeStats.totalIncome.toLocaleString()}</h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-md shadow-gray-400 hover:shadow-golden-400 hover:border-golden-400 transition-all duration-300">
                            <p className="text-sm text-gray-300 mb-1">PMR Income</p>
                            <p className="text-xl font-bold text-blue-300">${incomeStats.pmr.toLocaleString()}</p>
                            <div className="w-full bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
                                <div className="bg-blue-400 h-full" style={{ width: '64%' }}></div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-md shadow-gray-400 hover:shadow-golden-400 hover:border-golden-400 transition-all duration-300">
                            <p className="text-sm text-gray-300 mb-1">DRR Income</p>
                            <p className="text-xl font-bold text-green-300">${incomeStats.drr.toLocaleString()}</p>
                            <div className="w-full bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
                                <div className="bg-green-400 h-full" style={{ width: '24%' }}></div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-md shadow-gray-400 hover:shadow-golden-400 hover:border-golden-400 transition-all duration-300">
                            <p className="text-sm text-gray-300 mb-1">FCR Income</p>
                            <p className="text-xl font-bold text-purple-300">${incomeStats.fcr.toLocaleString()}</p>
                            <div className="w-full bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
                                <div className="bg-purple-400 h-full" style={{ width: '12%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Cards Breakdown */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Income Breakdown Removed as it was duplicate of Banner */}

                    <div className="bg-gradient-to-r from-golden-500 to-golden-600 rounded-2xl p-4 md:p-6 text-white shadow-lg relative overflow-hidden mt-4 md:mt-6 flex flex-row items-center justify-between shadow-gray-400">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-white/10 pointer-events-none">
                            <DollarSign size={80} />
                        </div>
                        <div className="relative z-10 text-left">
                            <p className="opacity-90 text-xs md:text-sm font-medium">Next Payout</p>
                            <h3 className="text-2xl md:text-3xl font-bold">$1,250</h3>
                        </div>
                        <div className="relative z-10 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl flex flex-col items-center min-w-[80px]">
                            <span className="text-[10px] uppercase tracking-wider opacity-90">Due Date</span>
                            <span className="text-sm font-bold">Feb 15</span>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
                        <div className="flex gap-2">
                            {['All', 'PMR', 'DRR', 'FCR'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab.toLowerCase())}
                                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${activeTab === tab.toLowerCase()
                                        ? 'bg-gray-800 text-white shadow-gray-400 shadow-md'
                                        : 'bg-white text-gray-600 border border-gray-400 hover:bg-golden-200 shadow-gray-400 shadow-md'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl border border-gray-400 shadow-gray-400 shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead className="bg-gray-50 border-b border-gray-400">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Transaction ID</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Type</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Status</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 whitespace-nowrap">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredTransactions.map((txn) => (
                                        <tr key={txn.id} className="hover:bg-gray-50 transition-colors hover:bg-gray-400/60">
                                            <td className="px-6 py-4 font-mono text-sm text-gray-500">{txn.id}</td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-gray-800">{txn.type}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{txn.date}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100">
                                                    {txn.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-800">
                                                +${txn.amount}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default IncomeOverview;
