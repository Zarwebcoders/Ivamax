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

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 min-h-screen p-6 bg-gray-50"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Income Overview</h1>
                    <p className="text-gray-500"> detailed breakdown of your earnings</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                        <Calendar size={16} />
                        Date Range
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-golden-50 text-golden-700 border border-golden-100 rounded-lg hover:bg-golden-100">
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <p className="text-sm text-gray-300 mb-1">PMR Income</p>
                            <p className="text-xl font-bold text-blue-300">${incomeStats.pmr.toLocaleString()}</p>
                            <div className="w-full bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
                                <div className="bg-blue-400 h-full" style={{ width: '64%' }}></div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <p className="text-sm text-gray-300 mb-1">DRR Income</p>
                            <p className="text-xl font-bold text-green-300">${incomeStats.drr.toLocaleString()}</p>
                            <div className="w-full bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
                                <div className="bg-green-400 h-full" style={{ width: '24%' }}></div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
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
                    <h3 className="text-lg font-bold text-gray-800">Income Breakdown</h3>

                    {[
                        { label: 'Pair Matching (PMR)', value: 8000, color: 'blue', percent: 64 },
                        { label: 'Direct Referral (DRR)', value: 3000, color: 'green', percent: 24 },
                        { label: 'Franchise/Club (FCR)', value: 1500, color: 'purple', percent: 12 },
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-${item.color}-50 text-${item.color}-600`}>
                                <PieChart size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-semibold text-gray-700">{item.label}</p>
                                    <span className="text-sm font-bold text-gray-900">${item.value}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div className={`h-full bg-${item.color}-500`} style={{ width: `${item.percent}%` }}></div>
                                    </div>
                                    <span className="text-xs text-gray-500">{item.percent}%</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="bg-gradient-to-br from-golden-500 to-golden-600 rounded-2xl p-6 text-white text-center shadow-lg">
                        <p className="opacity-90 mb-2">Next Payout</p>
                        <h3 className="text-3xl font-bold mb-4">$1,250</h3>
                        <p className="text-sm bg-white/20 inline-block px-3 py-1 rounded-full">Due: Feb 15, 2024</p>
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
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Transaction ID</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.map((txn) => (
                                    <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
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
        </motion.div>
    );
};

export default IncomeOverview;
