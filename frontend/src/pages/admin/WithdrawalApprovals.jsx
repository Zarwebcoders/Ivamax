import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { withdrawalService } from '../../services/withdrawal.service';
import { DollarSign, CheckCircle, XCircle, Clock, User, Wallet, Calendar, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

const WithdrawalApprovals = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'approve' or 'reject'
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [transactionHash, setTransactionHash] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            const response = await withdrawalService.getPendingWithdrawals('pending');
            if (response.success) {
                setWithdrawals(response.data);
            }
        } catch (error) {
            console.error('Error fetching withdrawals:', error);
            toast.error('Failed to load withdrawals');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (withdrawal, type) => {
        setSelectedWithdrawal(withdrawal);
        setModalType(type);
        setShowModal(true);
        setTransactionHash('');
        setRejectionReason('');
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedWithdrawal(null);
        setTransactionHash('');
        setRejectionReason('');
    };

    const handleApprove = async () => {
        if (!selectedWithdrawal) return;

        try {
            setProcessing(selectedWithdrawal._id);
            const response = await withdrawalService.approveWithdrawal(
                selectedWithdrawal._id,
                transactionHash,
                'Approved by admin'
            );

            if (response.success) {
                toast.success('Withdrawal approved successfully!');
                fetchWithdrawals();
                closeModal();
            }
        } catch (error) {
            console.error('Error approving withdrawal:', error);
            toast.error(error.response?.data?.message || 'Failed to approve withdrawal');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async () => {
        if (!selectedWithdrawal || !rejectionReason) {
            toast.error('Please provide a rejection reason');
            return;
        }

        try {
            setProcessing(selectedWithdrawal._id);
            const response = await withdrawalService.rejectWithdrawal(
                selectedWithdrawal._id,
                rejectionReason
            );

            if (response.success) {
                toast.success('Withdrawal rejected and amount refunded');
                fetchWithdrawals();
                closeModal();
            }
        } catch (error) {
            console.error('Error rejecting withdrawal:', error);
            toast.error(error.response?.data?.message || 'Failed to reject withdrawal');
        } finally {
            setProcessing(null);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glass p-6 border-2 border-gray-400 shadow-lg shadow-gray-400"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text mb-2">Withdrawal Approvals</h1>
                        <p className="text-text-tertiary">Review and process withdrawal requests</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-12 h-12 text-golden-500" />
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Pending Requests</p>
                            <p className="text-2xl font-bold text-golden-600">{withdrawals.length}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Withdrawals Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card overflow-hidden"
            >
                {withdrawals.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-semibold">No pending withdrawals</p>
                        <p className="text-sm">All withdrawal requests have been processed</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">User</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Request Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Wallet Address</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Amount</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {withdrawals.map((withdrawal) => (
                                    <tr key={withdrawal._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-golden-100 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-golden-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{withdrawal.user?.fullName || 'N/A'}</p>
                                                    <p className="text-sm text-gray-500 font-mono">{withdrawal.userId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(withdrawal.requestDate)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Wallet className="w-4 h-4 text-gray-400" />
                                                <span className="font-mono text-sm text-gray-700">
                                                    {withdrawal.walletAddress.substring(0, 12)}...
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-lg font-bold text-gray-800">${withdrawal.amount.toFixed(2)}</p>
                                            <p className="text-xs text-gray-500">Fee: ${(withdrawal.amount * 0.02).toFixed(2)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openModal(withdrawal, 'approve')}
                                                    disabled={processing === withdrawal._id}
                                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    <CheckCircle size={16} />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => openModal(withdrawal, 'reject')}
                                                    disabled={processing === withdrawal._id}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    <XCircle size={16} />
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && selectedWithdrawal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        >
                            <h3 className="text-2xl font-bold mb-4">
                                {modalType === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
                            </h3>

                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <p className="text-sm text-gray-600 mb-2">User: <span className="font-semibold">{selectedWithdrawal.user?.fullName}</span></p>
                                <p className="text-sm text-gray-600 mb-2">Amount: <span className="font-semibold text-green-600">${selectedWithdrawal.amount.toFixed(2)}</span></p>
                                <p className="text-sm text-gray-600">Wallet: <span className="font-mono text-xs">{selectedWithdrawal.walletAddress}</span></p>
                            </div>

                            {modalType === 'approve' ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Transaction Hash (Optional)
                                        </label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                value={transactionHash}
                                                onChange={(e) => setTransactionHash(e.target.value)}
                                                placeholder="Enter transaction hash"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleApprove}
                                            disabled={processing}
                                            className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold disabled:opacity-50"
                                        >
                                            {processing ? 'Processing...' : 'Confirm Approval'}
                                        </button>
                                        <button
                                            onClick={closeModal}
                                            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Rejection Reason *
                                        </label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Enter reason for rejection"
                                            rows="4"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleReject}
                                            disabled={processing || !rejectionReason}
                                            className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold disabled:opacity-50"
                                        >
                                            {processing ? 'Processing...' : 'Confirm Rejection'}
                                        </button>
                                        <button
                                            onClick={closeModal}
                                            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WithdrawalApprovals;
