import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, CheckCircle, Wallet, ArrowRight, Loader2 } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import depositService from '../services/deposit.service';
import { toast } from 'react-hot-toast';

const ADMIN_WALLETS = {
    BEP20: "0x1234567890123456789012345678901234567890", // Replace with real admin address
    TRC20: "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb" // Replace with real admin address
};

const PaymentModal = ({ isOpen, onClose, packageInfo }) => {
    const { connectWallet, isConnected, walletAddress } = useWallet();
    const [network, setNetwork] = useState(null); // 'BEP20' | 'TRC20'
    const [step, setStep] = useState(1); // 1: Select Network, 2: Payment
    const [copied, setCopied] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Reset state on close
    const handleClose = () => {
        setNetwork(null);
        setStep(1);
        setProcessing(false);
        onClose();
    };

    const handleNetworkSelect = (selectedNetwork) => {
        setNetwork(selectedNetwork);
        setStep(2);
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePaymentSubmit = async () => {
        if (!isConnected) {
            await connectWallet();
            return;
        }

        // For BEP20 (Automatic), we would do Web3 logic here
        // For TRC20 (Manual), we take the hash input

        // Currently implementing Manual Flow for TRC20 (and simulating BEP20 success -> manual entry for now? or keeping as is?)
        // Let's assume for this specific step the user is sending a "Manual Transaction Hash" even for BEP20 if auto fails, or we just focus on TRC20 manual entry.

        // Let's modify the UI to ASK for a hash after "payment" or provide a distinct "Manual Entry" step.
        // But the current UI in step 2 is different. Let me read the UI again.
        // Wait, I need to see the UI code to know where to inject the input field.
    };

    const handleManualSubmit = async (hash) => {
        try {
            setProcessing(true);
            const data = {
                amount: packageInfo.price,
                currency: network === 'BEP20' ? 'USDT_BEP20' : 'USDT_TRC20',
                transactionHash: hash,
                packageId: packageInfo.id,
                packageName: packageInfo.name
            };

            await depositService.submitDeposit(data);
            toast.success('Deposit submitted! Waiting for admin approval.');
            handleClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white">Activate Package</h3>
                            <p className="text-golden-300 text-sm mt-1">{packageInfo?.name} - ${packageInfo?.price}</p>
                        </div>
                        <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        {step === 1 ? (
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Select Payment Network</h4>

                                <button
                                    onClick={() => handleNetworkSelect('BEP20')}
                                    className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-400 cursor-pointer shadow-lg shadow-gray-400 hover:border-golden-400 hover:bg-golden-50 transition-all group hover:translate-x-2 hover:shadow-gray-600"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold">B</div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-900">USDT (BEP20)</p>
                                            <p className="text-xs text-gray-500">Binance Smart Chain</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={20} className="text-gray-300 group-hover:text-golden-500" />
                                </button>

                                <button
                                    onClick={() => handleNetworkSelect('TRC20')}
                                    className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-400 cursor-pointer shadow-lg shadow-gray-400 hover:border-red-400 hover:bg-red-50 transition-all group hover:translate-x-2 hover:shadow-gray-600"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">T</div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-900">USDT (TRC20)</p>
                                            <p className="text-xs text-gray-500">Tron Network</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={20} className="text-gray-300 group-hover:text-red-500" />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-2">
                                    <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
                                        ← Back
                                    </button>
                                    <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-600">
                                        Network: {network === 'TRC20' ? 'TRC20 (Tron)' : 'BEP20 (BSC)'}
                                    </span>
                                </div>

                                <div className="text-center">
                                    <p className="text-gray-500 text-sm mb-2">Send exactly</p>
                                    <p className="text-3xl font-black text-gray-900 tracking-tight">${packageInfo?.price} <span className="text-lg font-bold text-gray-400">USDT</span></p>
                                </div>

                                {/* Wallet Address Box */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-2 uppercase font-bold tracking-wider">Admin Wallet Address</p>
                                    <div className="flex items-center justify-between gap-2">
                                        <code className="text-sm font-mono text-gray-800 break-all">
                                            {ADMIN_WALLETS[network]}
                                        </code>
                                        <button
                                            onClick={() => handleCopy(ADMIN_WALLETS[network])}
                                            className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500 hover:text-golden-600"
                                        >
                                            {copied ? <CheckCircle size={20} className="text-green-500" /> : <Copy size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {!isConnected && network === 'BEP20' ? (
                                    <button
                                        onClick={connectWallet}
                                        className="w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
                                    >
                                        <Wallet size={20} /> Connect Wallet
                                    </button>
                                ) : (
                                    <div className="space-y-4 pt-2">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Enter Transaction Hash"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-golden-500 focus:ring-1 focus:ring-golden-500 outline-none text-sm transition-all"
                                                id="txHashInput"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                const hash = document.getElementById('txHashInput').value;
                                                if (!hash) {
                                                    alert("Please enter a transaction hash");
                                                    return;
                                                }
                                                handleManualSubmit(hash);
                                            }}
                                            disabled={processing}
                                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${network === 'BEP20'
                                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-yellow-200 hover:shadow-yellow-300'
                                                : 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-200 hover:shadow-red-300'
                                                }`}
                                        >
                                            {processing ? (
                                                <Loader2 size={24} className="animate-spin" />
                                            ) : (
                                                <>
                                                    <CheckCircle size={20} />
                                                    Submit Payment
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                                <p className="text-xs text-center text-gray-400">
                                    {network === 'BEP20' ? 'Requires MetaMask / Web3 Wallet' : 'Requires TronLink Extension'}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PaymentModal;
