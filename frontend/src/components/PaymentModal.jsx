import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, CheckCircle, Wallet, ArrowRight, Loader2 } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import depositService from '../services/deposit.service';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';

// BSC Mainnet details
const BSC_CHAIN_ID = '0x38'; // 56
const USDT_BEP20_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'; // Mainnet USDT
// const USDT_BEP20_ADDRESS = '0x337610d27c682E347C9cD60BD4b3b107C9d343DD'; // Testnet USDT (optional for testing)

const USDT_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address account) view returns (uint256)"
];

const USDT_TRC20_ADDRESS = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // Mainnet USDT (TRC20)

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

    const handleNetworkSelect = async (selectedNetwork) => {
        setNetwork(selectedNetwork);
        if (selectedNetwork === 'BEP20') {
            await handleBEP20Payment();
        } else if (selectedNetwork === 'TRC20') {
            await handleTRC20Payment();
        } else {
            setStep(2);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Helper to ensure wallet is connected before payment
    const ensureWalletConnected = async () => {
        if (!isConnected) {
            try {
                await connectWallet();
                return true;
            } catch (e) {
                console.error("Failed to connect", e);
                return false;
            }
        }
        return true;
    };

    const handlePaymentSubmit = async () => {
        // This is now mainly for TRC20 or retry scenarios
        if (network === 'BEP20') {
            await handleBEP20Payment();
        } else if (network === 'TRC20') {
            await handleTRC20Payment();
        }
    };

    const handleTRC20Payment = async () => {
        // specific logic for TronLink
        if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
            toast.error("TronLink is not installed or locked. Opening manual entry.");
            setStep(2); // Fallback to manual
            return;
        }

        setProcessing(true);
        try {
            const tronWeb = window.tronWeb;
            const adminAddress = ADMIN_WALLETS.TRC20;
            const amount = packageInfo.price * 1000000; // USDT TRC20 has 6 decimals

            // Use contract interaction for USDT
            const contract = await tronWeb.contract().at(USDT_TRC20_ADDRESS);

            // Check balance (Optional, likely handled by wallet but good for UX)
            // const balance = await contract.balanceOf(tronWeb.defaultAddress.base58).call();
            // if (balance.toNumber() < amount) throw new Error("Insufficient USDT (TRC20) balance");

            const txHash = await contract.transfer(adminAddress, amount).send({
                feeLimit: 100_000_000
            });

            toast.success("Transaction submitted to Tron Network!");
            await handleManualSubmit(txHash);

        } catch (error) {
            console.error("Tron Payment Error:", error);
            toast.error(error.message || "Tron payment failed");
            setStep(2); // Fallback to manual on error so they can retry or see the manual screen
        } finally {
            setProcessing(false);
        }
    };

    const handleBEP20Payment = async () => {
        setProcessing(true);
        try {
            const connected = await ensureWalletConnected();
            if (!connected) {
                setProcessing(false);
                return;
            }

            if (!window.ethereum) throw new Error("MetaMask is not installed");

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();

            // Switch to BSC
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: BSC_CHAIN_ID }],
                });
            } catch (switchError) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902) {
                    try {
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
                    } catch (addError) {
                        throw new Error("Failed to add BSC network to MetaMask");
                    }
                } else {
                    throw switchError;
                }
            }

            // Create Contract instance
            const usdtContract = new ethers.Contract(USDT_BEP20_ADDRESS, USDT_ABI, signer);

            // Get decimals (usually 18 for USDT on BSC, but safe to check)
            const decimals = await usdtContract.decimals();

            // Calculate amount
            const amount = ethers.parseUnits(packageInfo.price.toString(), decimals);

            // Check Balance (Optional: Commented out to allow testing flow even with 0 balance)
            /*
            const balance = await usdtContract.balanceOf(userAddress);
            if (balance < amount) {
                throw new Error("Insufficient USDT balance. Please ensure you have enough USDT (BEP20) in your wallet.");
            }
            */

            // Admin address
            const adminAddress = ADMIN_WALLETS.BEP20;

            // Send Transaction
            // We add a manual gasLimit to bypass the automatic estimateGas check,
            // which fails if the user has insufficient funds. This ensures MetaMask opens.
            const tx = await usdtContract.transfer(adminAddress, amount, { gasLimit: 100000 });

            toast.loading("Transaction submitted. Waiting for confirmation...", { id: 'txPending' });

            // Wait for confirmation
            await tx.wait();

            toast.dismiss('txPending');
            toast.success("Transaction confirmed!");

            // Submit to Backend
            await handleManualSubmit(tx.hash);

        } catch (error) {
            console.error("Payment Error:", error);

            // Parse error message
            const errorMessage = error?.message || "";

            if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
                toast.error("User rejected the transaction");
            } else if (errorMessage.includes("transfer amount exceeds balance") || errorMessage.includes("insufficient funds")) {
                toast.error("Insufficient USDT balance to complete this transaction.");
            } else {
                toast.error(error.reason || error.message || "Payment failed");
            }
        } finally {
            setProcessing(false);
        }
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
                                    disabled={processing}
                                    className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-400 cursor-pointer shadow-lg shadow-gray-400 hover:border-golden-400 hover:bg-golden-50 transition-all group hover:translate-x-2 hover:shadow-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold">B</div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-900">USDT (BEP20)</p>
                                            <p className="text-xs text-gray-500">Binance Smart Chain</p>
                                        </div>
                                    </div>
                                    {processing && network === 'BEP20' ? (
                                        <Loader2 size={20} className="animate-spin text-golden-500" />
                                    ) : (
                                        <ArrowRight size={20} className="text-gray-300 group-hover:text-golden-500" />
                                    )}
                                </button>

                                <button
                                    onClick={() => handleNetworkSelect('TRC20')}
                                    disabled={processing}
                                    className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-400 cursor-pointer shadow-lg shadow-gray-400 hover:border-red-400 hover:bg-red-50 transition-all group hover:translate-x-2 hover:shadow-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">T</div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-900">USDT (TRC20)</p>
                                            <p className="text-xs text-gray-500">Tron Network</p>
                                        </div>
                                    </div>
                                    {processing && network === 'TRC20' ? (
                                        <Loader2 size={20} className="animate-spin text-red-500" />
                                    ) : (
                                        <ArrowRight size={20} className="text-gray-300 group-hover:text-red-500" />
                                    )}
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
                                ) : network === 'BEP20' ? (
                                    <button
                                        onClick={handlePaymentSubmit}
                                        disabled={processing}
                                        className="w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-yellow-200 hover:shadow-yellow-300 transform hover:scale-[1.02]"
                                    >
                                        {processing ? (
                                            <Loader2 size={24} className="animate-spin" />
                                        ) : (
                                            <>
                                                <Wallet size={20} />
                                                Pay ${packageInfo?.price} with MetaMask
                                            </>
                                        )}
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
                                            className="w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-red-500 to-red-600 shadow-red-200 hover:shadow-red-300 hover:scale-[1.02]"
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
                                    {network === 'BEP20' ? 'Requires MetaMask / Web3 Wallet. Ensure you have BNB for gas.' : 'Requires TronLink Extension or Manual Transfer'}
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
