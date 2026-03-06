import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, CheckCircle, Wallet, ArrowRight, Loader2, Zap, FileText } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import depositService from '../services/deposit.service';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';

// BSC Mainnet details
const BSC_CHAIN_ID = '0x38'; // 56
// TODO: ADMIN - Replace this placeholder with the actual IMAX Token BEP-20 Smart Contract Address
const IMAX_BEP20_ADDRESS = 'REPLACE_WITH_IMAX_CONTRACT_ADDRESS';

const ERC20_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address account) view returns (uint256)"
];

const ADMIN_WALLETS = {
    BEP20: "0xE39Fc24F26c60F0d56653606b5E0A25DEf3d98b0" // Admin BEP-20 Wallet Address
};

import { createPortal } from 'react-dom';

const PaymentModal = ({ isOpen, onClose, packageInfo }) => {
    const { connectWallet, isConnected } = useWallet();
    const [step, setStep] = useState(1); // 1: Method Selection, 2: Payment Action
    const [paymentMethod, setPaymentMethod] = useState(null); // 'auto' | 'manual'
    const [manualNetwork, setManualNetwork] = useState('BEP20'); // 'BEP20'
    const [autoNetwork, setAutoNetwork] = useState('BEP20'); // 'BEP20'
    const [copied, setCopied] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Reset state on close
    const handleClose = () => {
        setStep(1);
        setPaymentMethod(null);
        setManualNetwork('BEP20');
        setAutoNetwork('BEP20');
        setProcessing(false);
        onClose();
    };

    const handleMethodSelect = (method) => {
        setPaymentMethod(method);
        setStep(2);
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // --- Automatic Payment Flows ---

    const handleAutoPaymentSubmit = async () => {
        await handleBEP20AutoPayment();
    };

    const handleBEP20AutoPayment = async () => {
        setProcessing(true);
        try {
            if (!isConnected) {
                await connectWallet();
            }

            if (!window.ethereum) throw new Error("MetaMask is not installed");

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            // Switch to BSC
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: BSC_CHAIN_ID }],
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: BSC_CHAIN_ID,
                                chainName: 'Binance Smart Chain Mainnet',
                                rpcUrls: ['https://bsc-dataseed.binance.org/'],
                                nativeCurrency: {
                                    name: 'BNB',
                                    symbol: 'BNB',
                                    decimals: 18
                                },
                                blockExplorerUrls: ['https://bscscan.com']
                            },
                        ],
                    });
                } else {
                    throw switchError;
                }
            }

            // Create Contract
            const tokenContract = new ethers.Contract(IMAX_BEP20_ADDRESS, ERC20_ABI, signer);
            const decimals = await tokenContract.decimals();
            // Package costs 2500 IMAX Tokens (hardcoded value based on $250 package)
            const requiredTokens = "2500";
            const amount = ethers.parseUnits(requiredTokens, decimals);
            const adminAddress = ADMIN_WALLETS.BEP20;

            // Send Transaction
            const tx = await tokenContract.transfer(adminAddress, amount, { gasLimit: 100000 });

            toast.loading("Transaction submitted...", { id: 'txPending' });
            await tx.wait();
            toast.dismiss('txPending');
            toast.success("Transaction confirmed!");

            // Submit to Backend
            await handleSubmitToBackend(tx.hash, 'IMAX_BEP20');

        } catch (error) {
            console.error("Auto BEP20 Error:", error);
            const msg = error?.message || "Payment failed";
            if (msg.includes("user rejected")) toast.error("Transaction rejected");
            else toast.error(msg);
        } finally {
            setProcessing(false);
        }
    };

    // TRC20 code removed because IMAX token runs on BEP-20 only

    // --- Backend Submission Helper ---
    const handleSubmitToBackend = async (hash, currency) => {
        try {
            setProcessing(true);
            const data = {
                amount: packageInfo.price,
                currency: currency,
                transactionHash: hash,
                packageId: packageInfo.id,
                packageName: packageInfo.name,
                type: paymentMethod
            };

            console.log("Submitting Deposit Data:", data);

            if (!data.packageId) {
                toast.error("Internal Error: Package ID is missing. Please refresh the page.");
                setProcessing(false);
                return;
            }

            const response = await depositService.submitDeposit(data);
            if (paymentMethod === 'auto') {
                toast.success('Payment verified & Package activated!');
            } else {
                toast.success('Deposit submitted! Waiting for admin approval.');
            }
            handleClose();
            // Refresh page or stats if needed
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setProcessing(false);
        }
    };

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] relative"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white">Activate Package</h3>
                                <p className="text-golden-300 text-sm mt-1">{packageInfo?.name} - 2500 IMAX</p>
                            </div>
                            <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {step === 1 ? (
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Select Payment Method</h4>

                                    {/* Automatic Option */}
                                    <button
                                        onClick={() => handleMethodSelect('auto')}
                                        className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-golden-200 bg-golden-50/50 cursor-pointer shadow-md hover:border-golden-500 hover:bg-golden-100 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-golden-200 flex items-center justify-center text-golden-700 font-bold">
                                                <Zap size={20} fill="currentColor" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-gray-900">Automatic</p>
                                                <p className="text-xs text-gray-600">IMAX (BEP-20)</p>
                                            </div>
                                        </div>
                                        <div className="bg-golden-200 text-golden-800 text-[10px] font-bold px-2 py-1 rounded uppercase">Recommended</div>
                                    </button>

                                    {/* Manual Option */}
                                    <button
                                        onClick={() => handleMethodSelect('manual')}
                                        className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 cursor-pointer shadow-sm hover:border-gray-400 hover:bg-gray-50 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                                                <FileText size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-gray-900">Manual</p>
                                                <p className="text-xs text-gray-500">Hash Submission</p>
                                            </div>
                                        </div>
                                        <ArrowRight size={20} className="text-gray-300 group-hover:text-gray-600" />
                                    </button>

                                    {/* Profit Wallet Option */}
                                    <button
                                        onClick={async () => {
                                            if (processing) return;
                                            setProcessing(true);
                                            try {
                                                const data = {
                                                    packageId: packageInfo.id,
                                                    packageName: packageInfo.name,
                                                    price: packageInfo.price
                                                };
                                                const response = await depositService.buyWithProfit(data);
                                                if (response.data.success) {
                                                    toast.success(response.data.message || 'Package activated using Profit!');
                                                    handleClose();
                                                    window.location.reload();
                                                }
                                            } catch (error) {
                                                console.error("Profit Buy Error:", error);
                                                toast.error(error.response?.data?.message || 'Profit purchase failed');
                                            } finally {
                                                setProcessing(false);
                                            }
                                        }}
                                        disabled={processing}
                                        className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/50 cursor-pointer shadow-md hover:border-emerald-500 hover:bg-emerald-100 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                                                <Wallet size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-gray-900">Buy with Profit</p>
                                                <p className="text-xs text-gray-600">Use Profit Balance</p>
                                            </div>
                                        </div>
                                        {processing ? (
                                            <Loader2 size={20} className="animate-spin text-emerald-600" />
                                        ) : (
                                            <div className="bg-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded uppercase">Instant</div>
                                        )}
                                    </button>
                                </div>
                            ) : paymentMethod === 'auto' ? (
                                // --- Automatic Flow ---
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
                                            ← Back
                                        </button>
                                        <span className="text-xs font-bold px-2 py-1 bg-golden-100 text-golden-800 rounded">
                                            Automatic Payment
                                        </span>
                                    </div>

                                    {/* Network Selection for Auto */}
                                    <div className="flex p-1 bg-gray-100 rounded-lg">
                                        <button
                                            className="flex-1 py-2 text-sm font-bold rounded-md transition-all bg-white text-gray-900 shadow-sm ring-1 ring-gray-200 cursor-default"
                                        >
                                            IMAX (BEP-20)
                                        </button>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-gray-500 text-sm mb-2">Total Amount</p>
                                        <p className="text-3xl font-black text-gray-900 tracking-tight">2500 <span className="text-lg font-bold text-gray-400">IMAX</span></p>
                                    </div>

                                    {autoNetwork === 'BEP20' && !isConnected ? (
                                        <button
                                            onClick={connectWallet}
                                            className="w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
                                        >
                                            <Wallet size={20} /> Connect Wallet
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleAutoPaymentSubmit}
                                            disabled={processing}
                                            className="w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] bg-gradient-to-r from-golden-500 to-golden-600 shadow-golden-200 hover:shadow-golden-300"
                                        >
                                            {processing ? (
                                                <Loader2 size={24} className="animate-spin" />
                                            ) : (
                                                <>
                                                    <Zap size={20} fill="currentColor" />
                                                    Pay Now
                                                </>
                                            )}
                                        </button>
                                    )}
                                    <p className="text-xs text-center text-gray-400">
                                        Requires BEP-20 compatible wallet with IMAX Tokens
                                    </p>
                                </div>
                            ) : (
                                // --- Manual Flow ---
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
                                            ← Back
                                        </button>
                                        <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                            Manual Transfer
                                        </span>
                                    </div>

                                    {/* Network Tabs */}
                                    <div className="flex p-1 bg-gray-100 rounded-lg">
                                        <button
                                            className="flex-1 py-2 text-sm font-bold rounded-md transition-all bg-white text-gray-900 shadow-sm cursor-default"
                                        >
                                            IMAX Token (BEP-20)
                                        </button>
                                    </div>

                                    {/* Address Display & QR Code */}
                                    <div className="space-y-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                            <p className="text-[10px] text-gray-400 mb-1 uppercase font-bold tracking-wider">Deposit Address ({manualNetwork})</p>
                                            <div className="flex items-center justify-between gap-2">
                                                <code className="text-xs font-mono text-gray-800 break-all leading-relaxed">
                                                    {ADMIN_WALLETS[manualNetwork]}
                                                </code>
                                                <button
                                                    onClick={() => handleCopy(ADMIN_WALLETS[manualNetwork])}
                                                    className="p-2 bg-gray-50 hover:bg-golden-50 rounded-lg transition-colors text-gray-400 hover:text-golden-600 flex-shrink-0"
                                                >
                                                    {copied ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* QR Code Section */}
                                        <div className="flex flex-col items-center justify-center py-4 bg-white rounded-xl shadow-sm border border-gray-200">
                                            <div className="p-2 bg-white rounded-lg border border-gray-100 mb-2">
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${ADMIN_WALLETS[manualNetwork]}`}
                                                    alt="Payment QR Code"
                                                    className="w-36 h-36"
                                                    onLoad={() => console.log('QR Code Loaded')}
                                                    onError={(e) => {
                                                        console.error('QR Code failed to load');
                                                        e.target.src = 'https://via.placeholder.com/150?text=QR+Code+Error';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                <p className="text-[10px] uppercase font-bold tracking-widest">Scan with Wallet</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hash Input */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Hash</label>
                                            <input
                                                type="text"
                                                placeholder="Paste your transaction hash here..."
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-golden-500 focus:ring-1 focus:ring-golden-500 outline-none text-sm transition-all"
                                                id="txHashInput"
                                            />
                                        </div>

                                        <button
                                            onClick={() => {
                                                const hash = document.getElementById('txHashInput').value;
                                                if (!hash) return toast.error("Please enter hash");
                                                handleSubmitToBackend(hash, 'IMAX_BEP20');
                                            }}
                                            disabled={processing}
                                            className="w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-gray-900 to-gray-800 hover:shadow-xl transform hover:scale-[1.02]"
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
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default PaymentModal;
