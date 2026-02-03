import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const WalletApprovals = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await api.get('/admin/wallet/requests');
            if (response.data.success) {
                setRequests(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching wallet requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId, status) => {
        setProcessing(requestId);
        try {
            await api.put(`/admin/wallet/approve/${requestId}`, {
                status,
                adminNotes: status === 'approved' ? 'Approved by admin' : 'Rejected by admin'
            });
            // Remove from list
            setRequests(prev => prev.filter(req => req._id !== requestId));
        } catch (error) {
            alert('Failed to process request');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><div className="spinner"></div></div>;

    return (
        <div className="space-y-6">
            <div className="card-glass p-6">
                <h1 className="text-2xl font-bold gradient-text">Wallet Approvals</h1>
                <p className="text-text-tertiary">Review and approve wallet change requests</p>
            </div>

            <div className="grid gap-4">
                {requests.length > 0 ? (
                    requests.map((req) => (
                        <motion.div
                            key={req._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="card flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-lg">{req.userName}</span>
                                    <span className="text-sm text-gray-400">({req.userId})</span>
                                </div>
                                <div className="text-sm space-y-1">
                                    <p><span className="text-gray-500">Old Wallet:</span> <span className="font-mono bg-gray-50 px-2 rounded">{req.oldWallet || 'None'}</span></p>
                                    <p><span className="text-gray-500">New Wallet:</span> <span className="font-mono bg-yellow-50 text-yellow-800 px-2 rounded border border-yellow-200">{req.newWallet}</span></p>
                                    <p className="text-xs text-gray-400">Requested: {new Date(req.requestDate).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleAction(req._id, 'approved')}
                                    disabled={processing === req._id}
                                    className="btn px-4 py-2 bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleAction(req._id, 'rejected')}
                                    disabled={processing === req._id}
                                    className="btn px-4 py-2 bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                                >
                                    Reject
                                </button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="card text-center py-12 text-gray-500">
                        No pending wallet requests
                    </div>
                )}
            </div>
        </div>
    );
};

export default WalletApprovals;
