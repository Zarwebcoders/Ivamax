import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Shield, Zap, Award, Gift, Clock, XCircle, CheckCircle } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import depositService from '../services/deposit.service';
import { toast } from 'react-hot-toast';

const Packages = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [depositHistory, setDepositHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [packageStatus, setPackageStatus] = useState(null); // 'active', 'pending', or null

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await depositService.getMyDeposits();
            if (response.data) {
                const history = response.data;
                setDepositHistory(history);

                // Check specifically for 'premium_starter' package status
                const activeDeposit = history.find(d =>
                    d.status === 'approved'
                );

                const pendingDeposit = history.find(d =>
                    d.status === 'pending'
                );

                if (activeDeposit) {
                    setPackageStatus('active');
                } else if (pendingDeposit) {
                    setPackageStatus('pending');
                } else {
                    setPackageStatus(null);
                }
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
            toast.error("Could not load package history");
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = (pkg) => {
        if (packageStatus) return;
        setSelectedPackage(pkg);
        setModalOpen(true);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    const features = [
        "Daily ROI up to 1.5%",
        "Direct Referral Bonus 10%",
        "Binary Matching 10%",
        "24/7 Priority Support",
        "Access to Premium Signals",
        "Weekly Payouts"
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'rejected': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="py-10 flex flex-col items-center justify-center relative overflow-hidden space-y-16"
        >
            {/* Hero Banner Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4 px-4 relative z-10"
            >
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                    Investment <span className="text-transparent bg-clip-text bg-gradient-to-r from-golden-500 to-golden-600">Packages</span>
                </h1>
                <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base font-medium">
                    Choose the perfect plan to accelerate your financial growth. Our binary-enabled packages offer the best ROI and referral rewards in the market.
                </p>
                <div className="flex items-center justify-center gap-4 pt-2">
                    <div className="h-1 w-12 bg-golden-400 rounded-full"></div>
                    <div className="h-1 w-1 bg-golden-500 rounded-full"></div>
                    <div className="h-1 w-12 bg-golden-400 rounded-full"></div>
                </div>
            </motion.div>

            <motion.div
                variants={cardVariants}
                className="w-full max-w-[280px] md:max-w-xs relative z-10 group"
            >
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-golden-300 via-golden-500 to-golden-300 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>

                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                    {/* Card Header */}
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-5 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-white/10 noise-bg opacity-20"></div>
                        <div className="absolute -right-8 -top-8 text-green-600/20 rotate-12">
                            <Star size={100} />
                        </div>

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: 'spring' }}
                            className="inline-flex items-center justify-center bg-green-600/20 backdrop-blur-md rounded-full px-4 py-1.5 mb-4 border border-green-600/30"
                        >
                            <Shield size={14} className="text-green-700 mr-2" />
                            <span className="text-green-800 text-xs font-bold tracking-wider uppercase">Most Popular</span>
                        </motion.div>

                        <h2 className="text-xl font-bold text-green-800 mb-1">Binary Pack</h2>
                        <div className="flex items-center justify-center text-green-800">
                            <span className="text-lg font-medium opacity-80">$</span>
                            <span className="text-4xl font-black tracking-tighter">250</span>
                        </div>
                        <p className="text-green-700 mt-1 text-xs font-medium">Lifetime Access</p>
                    </div>

                    {/* Features Body */}
                    <div className="p-5 bg-white relative">
                        {/* Decorative Line */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-golden-300 to-golden-500 rounded-b-full"></div>

                        <div className="mb-8 mt-4"></div>

                        {/* CTA Button */}
                        <button
                            onClick={() => handleActivate({ id: 'premium_starter', name: 'Premium Starter', price: 250 })}
                            disabled={!!packageStatus || loading}
                            className={`w-full font-bold py-3 rounded-xl shadow-lg flex items-center justify-center group overflow-hidden relative transition-all duration-300 ${packageStatus === 'active'
                                ? 'bg-green-600 text-white cursor-default'
                                : packageStatus === 'pending'
                                    ? 'bg-yellow-500 text-white cursor-default'
                                    : 'bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:shadow-xl hover:scale-[1.02]'
                                }`}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? 'Checking...' :
                                    packageStatus === 'active' ? 'Active' :
                                        packageStatus === 'pending' ? 'Pending Approval' :
                                            <>Activate Now <Zap size={18} className="group-hover:text-golden-400 transition-colors" /></>
                                }
                            </span>
                            {!packageStatus && !loading && (
                                <div className="absolute inset-0 bg-gradient-to-r from-golden-500 to-golden-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Payment History Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full max-w-4xl px-4"
            >
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gray-50 border-b border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Clock size={20} className="text-golden-600" />
                            Package Payment History
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4 text-left">Package</th>
                                    <th className="px-6 py-4 text-left">Amount</th>
                                    <th className="px-6 py-4 text-left">Date</th>
                                    <th className="px-6 py-4 text-left">Hash</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {depositHistory.length > 0 ? (
                                    depositHistory.map((deposit) => (
                                        <tr key={deposit._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-900">{deposit.packageName}</div>
                                                <div className="text-xs text-gray-500">{deposit.currency}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                ${deposit.amount}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(deposit.createdAt).toLocaleDateString()}
                                                <div className="text-xs text-gray-400">{new Date(deposit.createdAt).toLocaleTimeString()}</div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-gray-500 max-w-[150px] truncate" title={deposit.transactionHash}>
                                                {deposit.transactionHash}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                                                    {deposit.status === 'approved' && <CheckCircle size={10} className="mr-1" />}
                                                    {deposit.status === 'rejected' && <XCircle size={10} className="mr-1" />}
                                                    {deposit.status === 'pending' && <Clock size={10} className="mr-1" />}
                                                    {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                                            No payment history found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>

            <PaymentModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    fetchHistory(); // Refresh status on close
                }}
                packageInfo={selectedPackage}
            />
        </motion.div>
    );
};

export default Packages;
