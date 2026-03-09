import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, AlertCircle, Clock, CheckCircle, XCircle, ArrowRight, Wallet as WalletIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { withdrawalService } from '../services/withdrawal.service';
import toast from 'react-hot-toast';
import WalletAddress from '../components/WalletAddress';

const Withdrawals = () => {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [method, setMethod] = useState('USDT (BEP-20)');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [activeTab, setActiveTab] = useState('All');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoadingData(true);
            const [statsData, historyData] = await Promise.all([
                withdrawalService.getWithdrawalStats(),
                withdrawalService.getWithdrawalHistory(20, 1, activeTab === 'All' ? '' : activeTab)
            ]);

            if (statsData.success) setStats(statsData.data);
            if (historyData.success) setHistory(historyData.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load withdrawal data');
        } finally {
            setLoadingData(false);
        }
    };

    const handleWithdrawal = async (e) => {
        e.preventDefault();

        if (!amount || parseFloat(amount) < 10) {
            toast.error('Minimum withdrawal amount is $10');
            return;
        }

        if (!walletAddress) {
            toast.error('Please enter wallet address');
            return;
        }

        try {
            setLoading(true);
            const response = await withdrawalService.requestWithdrawal(
                parseFloat(amount),
                walletAddress,
                method
            );

            if (response.success) {
                toast.success('Withdrawal request submitted successfully!');
                setAmount('');
                setWalletAddress('');
                fetchData(); // Refresh data
            }
        } catch (error) {
            console.error('Error requesting withdrawal:', error);
            toast.error(error.response?.data?.message || 'Failed to submit withdrawal request');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-50 text-green-600 border-green-100';
            case 'pending': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <CheckCircle size={16} />;
            case 'pending': return <Clock size={16} />;
            case 'rejected': return <XCircle size={16} />;
            default: return null;
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loadingData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 min-h-screen px-2 bg-gray-50"
        >
            <div className='flex flex-col md:flex-row justify-between items-center gap-4 card-glass p-4 border-2 border-gray-400 shadow-lg shadow-gray-400'>
                <h1 className="text-2xl font-bold text-gray-800">Withdrawal</h1>
                <p className="text-gray-500">Manage your payouts and fund requests</p>
            </div>

            {/* Financial Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        label: "Available Balance",
                        value: stats?.availableBalance || 0,
                        icon: <DollarSign size={24} />,
                        color: "text-green-600",
                        bgColor: "bg-gradient-to-br from-green-100 to-emerald-100",
                        borderColor: "border-green-500",
                    },
                    {
                        label: "Total Withdrawn",
                        value: stats?.totalWithdrawn || 0,
                        icon: <CheckCircle size={24} />,
                        color: "text-blue-600",
                        bgColor: "bg-gradient-to-br from-blue-100 to-cyan-100",
                        borderColor: "border-blue-500",
                    },
                    {
                        label: "Pending Requests",
                        value: stats?.pendingAmount || 0,
                        icon: <Clock size={24} />,
                        color: "text-amber-600",
                        bgColor: "bg-gradient-to-br from-amber-100 to-orange-100",
                        borderColor: "border-amber-500",
                    }
                ].map((item, index) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="group"
                    >
                        <div className={`rounded-3xl p-6 border-2 ${item.borderColor} ${item.bgColor} shadow-lg hover:shadow-xl transition-all duration-300`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-gray-600 mb-1 uppercase tracking-wider">{item.label}</p>
                                    <h3 className={`text-3xl font-black ${item.color}`}>
                                        ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </h3>
                                </div>
                                <div className={`p-3 rounded-2xl ${item.bgColor} border-2 ${item.borderColor} ${item.color}`}>
                                    {item.icon}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Request Form */}
                <div className="lg:col-span-1 space-y-6">

                    <form onSubmit={handleWithdrawal} className="bg-white rounded-2xl shadow-lg card-glass p-4 border-2 border-gray-400 shadow-lg shadow-gray-400">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Request Payout</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-600 mb-3 block">Withdrawal Method</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {/* USDT BEP20 Option */}
                                    <div
                                        onClick={() => setMethod('USDT (BEP-20)')}
                                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${method === 'USDT (BEP-20)'
                                            ? 'border-golden-500 bg-golden-50 shadow-md shadow-golden-200'
                                            : 'border-gray-300 bg-white hover:border-golden-300 hover:bg-golden-50/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === 'USDT (BEP-20)' ? 'border-golden-500' : 'border-gray-300'
                                                }`}>
                                                {method === 'USDT (BEP-20)' && (
                                                    <div className="w-3 h-3 rounded-full bg-golden-500"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <WalletIcon size={20} className="text-golden-600" />
                                                    <p className="font-bold text-gray-800">USDT (BEP-20)</p>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Withdraw to your USDT BEP-20 wallet address</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* IMAX Token BEP20 Option */}
                                    <div
                                        onClick={() => setMethod('IMAX Token (BEP-20)')}
                                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all overflow-hidden ${method === 'IMAX Token (BEP-20)'
                                            ? 'border-golden-500 bg-gradient-to-br from-golden-50 to-orange-50 shadow-md shadow-golden-200'
                                            : 'border-golden-300 bg-white hover:bg-golden-50/30'
                                            }`}
                                    >
                                        <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                                            +15% BONUS
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center min-w-5 min-h-5 ${method === 'IMAX Token (BEP-20)' ? 'border-golden-500' : 'border-gray-300'
                                                }`}>
                                                {method === 'IMAX Token (BEP-20)' && (
                                                    <div className="w-3 h-3 rounded-full bg-golden-500"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 pr-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-full bg-golden-500 flex items-center justify-center text-white text-xs font-bold">I</div>
                                                    <p className="font-bold text-gray-800">IMAX Token (BEP-20)</p>
                                                </div>
                                                <p className="text-xs text-green-600 font-semibold mt-1">Get 15% extra tokens as payout!</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-600 mb-1 block">Wallet Address</label>
                                <div className="relative">
                                    <WalletIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={walletAddress}
                                        onChange={(e) => setWalletAddress(e.target.value)}
                                        placeholder="Enter wallet address"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-400 focus:border-golden-500 outline-none bg-white"
                                        required
                                    />
                                </div>
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
                                        min="10"
                                        step="0.01"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-400 focus:border-golden-500 outline-none bg-white"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    Min withdrawal: $10. No Fee
                                </p>
                                {amount && !isNaN(amount) && parseFloat(amount) > 0 && (
                                    <div className="mt-4 p-3 bg-golden-50 border border-golden-200 rounded-xl shadow-inner">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Estimated Payout</p>
                                        <p className="text-lg md:text-xl font-black text-golden-600">
                                            {method === 'IMAX Token (BEP-20)'
                                                ? `${(parseFloat(amount) * 10 * 1.15).toLocaleString(undefined, { maximumFractionDigits: 2 })} IMAX Tokens = $${(parseFloat(amount) * 1.15).toFixed(2)}`
                                                : `${parseFloat(amount).toLocaleString()} USDT = ${(parseFloat(amount) * 10).toLocaleString()} IMAX Tokens`
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-golden-500 to-golden-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-px transition-all duration-300 font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner border-white"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Proceed to Withdraw <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="bg-blue-100 border border-blue-400 rounded-xl p-4 text-sm text-blue-700">
                        <p className="font-semibold mb-1 flex items-center gap-2">
                            <Clock size={16} /> Processing Time
                        </p>
                        <p>Withdrawals are processed within 24-48 hours on business days.</p>
                    </div>
                </div>

                {/* History Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-400 shadow-lg shadow-gray-400 overflow-hidden">
                        <div className="p-4 border-b border-gray-400 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h3 className="text-lg font-bold text-gray-800">Withdrawal History</h3>
                            <div className="flex gap-2">
                                {['All', 'Approved', 'Pending'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                            ? 'bg-golden-500 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {history.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <WalletIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p>No withdrawal history yet</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Wallet</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {history.map((record) => (
                                            <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-600">{formatDate(record.requestDate)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-800 font-mono">
                                                    <WalletAddress address={record.walletAddress} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit ${getStatusColor(record.status)}`}>
                                                        {getStatusIcon(record.status)}
                                                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                    </span>
                                                    {record.adminNotes && record.status === 'rejected' && (
                                                        <p className="text-xs text-red-500 mt-1">{record.adminNotes}</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <p className="font-bold text-gray-800">${record.amount.toFixed(2)}</p>
                                                    <p className="text-xs text-gray-500 font-semibold">{record.method || 'USDT (BEP-20)'}</p>
                                                    {record.method === 'IMAX Token (BEP-20)' ? (
                                                        <p className="text-xs font-bold text-green-600 mt-0.5">Payout: {record.payableAmount?.toLocaleString(undefined, { maximumFractionDigits: 2 })} IMAX</p>
                                                    ) : (
                                                        <p className="text-xs font-bold text-blue-600 mt-0.5">Payout: {record.payableAmount?.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT</p>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Withdrawals;
