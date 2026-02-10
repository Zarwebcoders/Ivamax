import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, AlertCircle, Clock, CheckCircle, XCircle, ArrowRight, Wallet as WalletIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { withdrawalService } from '../services/withdrawal.service';
import toast from 'react-hot-toast';

const Withdrawals = () => {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [method, setMethod] = useState('USDT (TRC20)');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoadingData(true);
            const [statsData, historyData] = await Promise.all([
                withdrawalService.getWithdrawalStats(),
                withdrawalService.getWithdrawalHistory(20, 1)
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

        if (!amount || parseFloat(amount) < 50) {
            toast.error('Minimum withdrawal amount is $50');
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
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Withdrawal</h1>
                <p className="text-gray-500">Manage your payouts and fund requests</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Request Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl">
                        <p className="opacity-70 text-sm mb-1">Available Balance</p>
                        <h2 className="text-4xl font-bold mb-6">
                            ${stats?.availableBalance?.toFixed(2) || '0.00'}
                        </h2>
                        <div className="flex justify-between text-sm opacity-80 border-t border-white/10 pt-4">
                            <span>Pending: ${stats?.pendingAmount?.toFixed(2) || '0.00'}</span>
                            <span>Withdrawn: ${stats?.totalWithdrawn?.toFixed(2) || '0.00'}</span>
                        </div>
                    </div>

                    <form onSubmit={handleWithdrawal} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Request Payout</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-600 mb-1 block">Withdrawal Method</label>
                                <select
                                    value={method}
                                    onChange={(e) => setMethod(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-golden-500 outline-none bg-white"
                                >
                                    <option>USDT (TRC20)</option>
                                    <option>Bank Transfer</option>
                                </select>
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
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-golden-500 outline-none bg-white"
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
                                        min="50"
                                        step="0.01"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-golden-500 outline-none bg-white"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    Min withdrawal: $50. Fee: 2%
                                </p>
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
                                                    {record.walletAddress.substring(0, 10)}...
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
                                                <td className="px-6 py-4 text-right font-bold text-gray-800">
                                                    ${record.amount.toFixed(2)}
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
