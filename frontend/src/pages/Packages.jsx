import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Shield, Zap, Award, Gift } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

const Packages = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);

    const handleActivate = (pkg) => {
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

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="py-5 flex items-center justify-center relative overflow-hidden"
        >
            <PaymentModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                packageInfo={selectedPackage}
            />

            <motion.div
                variants={cardVariants}
                className="w-full max-w-[280px] md:max-w-xs relative z-10 group"
            >
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-golden-300 via-golden-500 to-golden-300 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>

                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                    {/* Card Header */}
                    <div className="bg-gradient-to-br from-golden-500 to-golden-600 p-5 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-white/10 noise-bg opacity-20"></div>
                        <div className="absolute -right-8 -top-8 text-white/20 rotate-12">
                            <Star size={100} />
                        </div>

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: 'spring' }}
                            className="inline-flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full px-4 py-1.5 mb-4 border border-white/20"
                        >
                            <Shield size={14} className="text-white mr-2" />
                            <span className="text-white text-xs font-bold tracking-wider uppercase">Most Popular</span>
                        </motion.div>

                        <h2 className="text-xl font-bold text-white mb-1">Premium Starter</h2>
                        <div className="flex items-center justify-center text-white">
                            <span className="text-lg font-medium opacity-80">$</span>
                            <span className="text-4xl font-black tracking-tighter">1</span>
                        </div>
                        <p className="text-golden-100 mt-1 text-xs font-medium">Lifetime Access (Testing)</p>
                    </div>

                    {/* Features Body */}
                    <div className="p-5 bg-white relative">
                        {/* Decorative Line */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-golden-300 to-golden-500 rounded-b-full"></div>

                        <ul className="space-y-4 mb-8 mt-4">
                            {features.map((feature, idx) => (
                                <motion.li
                                    key={idx}
                                    variants={{
                                        hidden: { opacity: 0, x: -20 },
                                        visible: { opacity: 1, x: 0 }
                                    }}
                                    className="flex items-center text-gray-700"
                                >
                                    <div className="mr-3 flex-shrink-0 w-5 h-5 rounded-full bg-golden-100 flex items-center justify-center text-golden-600">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                    <span className="font-medium text-xs md:text-sm">{feature}</span>
                                </motion.li>
                            ))}
                        </ul>

                        {/* CTA Button */}
                        <button
                            onClick={() => handleActivate({ name: 'Premium Starter', price: 1 })}
                            className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-gray-400 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center group overflow-hidden relative"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Activate Now <Zap size={18} className="group-hover:text-golden-400 transition-colors" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-golden-500 to-golden-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Packages;
