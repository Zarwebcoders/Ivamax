import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, AlertCircle, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Withdrawals = () => {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');

    // Mock Data
    const withdrawalStats = {
        availableBalance: 4500,
        totalWithdrawn: 12500,
        pendingAmount: 500,
    };

    const history = [
        { id: 'WDRT001', amount: 500, date: '2024-02-04', status: 'Pending', method: 'USDT (TRC20)' },
        { id: 'WDRT002', amount: 1000, date: '2024-02-01', status: 'Approved', method: 'Bank Transfer' },
        { id: 'WDRT003', amount: 250, date: '2024-01-28', status: 'Rejected', method: 'USDT (TRC20)', reason: 'Invalid Address' },
        { id: 'WDRT004', amount: 2000, date: '2024-01-15', status: 'Approved', method: 'Bank Transfer' },
    ];

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-50 text-green-600 border-green-100';
            case 'Pending': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
            case 'Rejected': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved': return <CheckCircle size={16} />;
            case 'Pending': return <Clock size={16} />;
            case 'Rejected': return <XCircle size={16} />;
            default: return null;
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 min-h-screen p-6 bg-gray-50"
        >
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Withdrawal</h1>
                <p className="text-gray-500">Manage your payouts and fund requests</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Request Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl">
                        <p className="opacity-70 text-sm mb-1">Available Balance</p>
                        <h2 className="text-4xl font-bold mb-6">${withdrawalStats.availableBalance.toLocaleString()}</h2>
                        <div className="flex justify-between text-sm opacity-80 border-t border-white/10 pt-4">
                            <span>Pending: ${withdrawalStats.pendingAmount}</span>
                            <span>Total Withdrawn: ${withdrawalStats.totalWithdrawn.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Request Payout</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-600 mb-1 block">Withdrawal Method</label>
                                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-golden-500 outline-none bg-white">
                                    <option>USDT (TRC20) Wallet</option>
                                    <option>Bank Transfer</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-600 mb-1 block">Amount</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-golden-500 outline-none bg-white"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    Min withdrawal: $50. Fee: 2%
                                </p>
                            </div>

                            <button className="w-full py-3 bg-gradient-to-r from-golden-500 to-golden-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-px transition-all duration-300 font-bold flex items-center justify-center gap-2">
                                Proceed to Withdraw <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
                        <p className="font-semibold mb-1 flex items-center gap-2">
                            <Clock size={16} /> Processing Time
                        </p>
                        <p>Withdrawals are processed within 24-48 hours on business days.</p>
                    </div>
                </div>

                {/* History Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">Withdrawal History</h3>
                            <button className="text-golden-600 text-sm font-semibold hover:underline">View All</button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ID</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Method</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {history.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm text-gray-500">{record.id}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{record.date}</td>
                                            <td className="px-6 py-4 text-sm text-gray-800 font-medium">{record.method}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit ${getStatusColor(record.status)}`}>
                                                    {getStatusIcon(record.status)}
                                                    {record.status}
                                                </span>
                                                {record.reason && (
                                                    <p className="text-xs text-red-500 mt-1">{record.reason}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-800">
                                                ${record.amount}
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

export default Withdrawals;
