import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Search, Filter, Loader2, DollarSign, Calendar, User } from 'lucide-react';
import adminService from '../../services/admin.service';
import { toast } from 'react-hot-toast';

const DepositApprovals = () => {
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // all, pending, approved, rejected

    useEffect(() => {
        fetchDeposits();
    }, []);

    const fetchDeposits = async () => {
        try {
            const response = await adminService.getDeposits();
            if (response.data.success) {
                setDeposits(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching deposits:', error);
            toast.error('Failed to load deposits');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Are you sure you want to approve this deposit? This will activate the package for the user.')) return;

        try {
            toast.loading('Approving...');
            await adminService.approveDeposit(id);
            toast.dismiss();
            toast.success('Deposit Approved & Package Activated');
            fetchDeposits(); // Refresh
        } catch (error) {
            toast.dismiss();
            console.error(error);
            toast.error('Approval failed');
        }
    };

    const filteredDeposits = deposits.filter(dep => {
        if (filter === 'all') return true;
        return dep.status === filter;
    });

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Deposit Requests</h2>
                    <p className="text-gray-500 text-sm">Manage incoming package payments</p>
                </div>

                <div className="flex gap-2">
                    {['pending', 'approved', 'all'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-golden-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4">
                {filteredDeposits.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No {filter} deposits found.</p>
                    </div>
                ) : (
                    filteredDeposits.map((deposit) => (
                        <motion.div
                            key={deposit._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${deposit.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            deposit.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {deposit.status}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        Action Date: {new Date(deposit.createdAt).toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <DollarSign size={18} className="text-golden-500" />
                                        {deposit.amount}
                                        <span className="text-sm font-normal text-gray-500">({deposit.currency})</span>
                                    </h3>
                                    <div className="h-4 w-px bg-gray-300"></div>
                                    <p className="font-medium text-gray-700">{deposit.packageName}</p>
                                </div>

                                <div className="space-y-1 text-sm text-gray-600">
                                    <p className="flex items-center gap-2">
                                        <User size={14} className="text-gray-400" />
                                        User ID: <span className="font-mono text-gray-900">{deposit.userId}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="font-bold text-xs uppercase text-gray-400">TX Hash:</span>
                                        <span className="font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-200 break-all select-all">
                                            {deposit.transactionHash}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {deposit.status === 'pending' && (
                                <div className="flex items-center gap-3 md:self-center">
                                    <button
                                        onClick={() => handleApprove(deposit._id)}
                                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5"
                                    >
                                        <Check size={18} /> Approve
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DepositApprovals;
