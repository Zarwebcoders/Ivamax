import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, CheckCircle, Wallet, ArrowRight, Loader2, Zap, FileText } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import depositService from '../services/deposit.service';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';

// BSC Mainnet details
const BSC_CHAIN_ID = '0x38'; // 56
const USDT_BEP20_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'; // Mainnet USDT

// Tron Mainnet details
const USDT_TRC20_ADDRESS = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

const USDT_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address account) view returns (uint256)"
];

const ADMIN_WALLETS = {
    BEP20: "0x1234567890123456789012345678901234567890", // Replace with real admin address
    TRC20: "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb" // Replace with real admin address
};

const PaymentModal = ({ isOpen, onClose, packageInfo }) => {
    const { connectWallet, isConnected } = useWallet();
    const [step, setStep] = useState(1); // 1: Method Selection, 2: Payment Action
    const [paymentMethod, setPaymentMethod] = useState(null); // 'auto' | 'manual'
    const [manualNetwork, setManualNetwork] = useState('BEP20'); // 'BEP20' | 'TRC20'
    const [autoNetwork, setAutoNetwork] = useState('BEP20'); // 'BEP20' | 'TRC20'
    const [copied, setCopied] = useState(false);
    const [processing, setProcessing] = useState(false);

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
        if (autoNetwork === 'BEP20') {
            await handleBEP20AutoPayment();
        } else {
            await handleTRC20AutoPayment();
        }
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
            const usdtContract = new ethers.Contract(USDT_BEP20_ADDRESS, USDT_ABI, signer);
            const decimals = await usdtContract.decimals();
            const amount = ethers.parseUnits(packageInfo.price.toString(), decimals);
            const adminAddress = ADMIN_WALLETS.BEP20;

            // Send Transaction
            const tx = await usdtContract.transfer(adminAddress, amount, { gasLimit: 100000 });

            toast.loading("Transaction submitted...", { id: 'txPending' });
            await tx.wait();
            toast.dismiss('txPending');
            toast.success("Transaction confirmed!");

            // Submit to Backend
            await handleSubmitToBackend(tx.hash, 'USDT_BEP20');

        } catch (error) {
            console.error("Auto BEP20 Error:", error);
            const msg = error?.message || "Payment failed";
            if (msg.includes("user rejected")) toast.error("Transaction rejected");
            else toast.error(msg);
        } finally {
            setProcessing(false);
        }
    };

    const handleTRC20AutoPayment = async () => {
        setProcessing(true);
        try {
            if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
                throw new Error("TronLink is not installed or locked. Please unlock it.");
            }

            const tronWeb = window.tronWeb;
            const adminAddress = ADMIN_WALLETS.TRC20;
            const amount = packageInfo.price * 1000000; // USDT TRC20 has 6 decimals

            // Use contract interaction for USDT
            const contract = await tronWeb.contract().at(USDT_TRC20_ADDRESS);

            // Send Transaction
            const txHash = await contract.transfer(adminAddress, amount).send({
                feeLimit: 100_000_000
            });

            toast.success("Transaction submitted to Tron Network!");

            // Wait a bit for propagation (optional, but good for Tron)
            // await new Promise(resolve => setTimeout(resolve, 3000));

            await handleSubmitToBackend(txHash, 'USDT_TRC20');

        } catch (error) {
            console.error("Auto TRC20 Error:", error);
            toast.error(error.message || "Tron payment failed");
        } finally {
            setProcessing(false);
        }
    };

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

            await depositService.submitDeposit(data);
            toast.success('Deposit submitted! Waiting for approval.');
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
                            <h3 className="text-xl font-bold text-white">Activate Package (V2)</h3>
                            <p className="text-golden-300 text-sm mt-1">{packageInfo?.name} - ${packageInfo?.price} - TEST</p>
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
                                            <p className="text-xs text-gray-600">MetaMask (BEP20) / TronLink</p>
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
                                    {['BEP20', 'TRC20'].map((net) => (
                                        <button
                                            key={net}
                                            onClick={() => setAutoNetwork(net)}
                                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${autoNetwork === net
                                                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {net === 'BEP20' ? 'BSC (MetaMask)' : 'Tron (TronLink)'}
                                        </button>
                                    ))}
                                </div>

                                <div className="text-center">
                                    <p className="text-gray-500 text-sm mb-2">Total Amount</p>
                                    <p className="text-3xl font-black text-gray-900 tracking-tight">${packageInfo?.price} <span className="text-lg font-bold text-gray-400">USDT</span></p>
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
                                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] ${autoNetwork === 'TRC20'
                                            ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-200 hover:shadow-red-300'
                                            : 'bg-gradient-to-r from-golden-500 to-golden-600 shadow-golden-200 hover:shadow-golden-300'
                                            }`}
                                    >
                                        {processing ? (
                                            <Loader2 size={24} className="animate-spin" />
                                        ) : (
                                            <>
                                                <Zap size={20} fill="currentColor" />
                                                Pay with {autoNetwork === 'TRC20' ? 'TronLink' : 'MetaMask'}
                                            </>
                                        )}
                                    </button>
                                )}
                                <p className="text-xs text-center text-gray-400">
                                    {autoNetwork === 'TRC20' ? 'Requires TronLink Extension' : 'Requires MetaMask / Web3 Wallet'}
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
                                    {['BEP20', 'TRC20'].map((net) => (
                                        <button
                                            key={net}
                                            onClick={() => setManualNetwork(net)}
                                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${manualNetwork === net
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            USDT ({net})
                                        </button>
                                    ))}
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
                                            handleSubmitToBackend(hash, `USDT_${manualNetwork}`);
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
        </AnimatePresence>
    );
};

export default PaymentModal;
