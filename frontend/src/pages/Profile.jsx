import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { User, Mail, Phone, Lock, CreditCard, Shield, Edit2, Save, X, Wallet, CheckCircle, DollarSign, TrendingUp, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReferralCard from '../components/ReferralCard';
import { dashboardService } from '../services/dashboard.service';

const Profile = () => {
    const { user, login } = useAuth(); // We might need to update user in context
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('personal'); // personal, security, banking, income, referral
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({});

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        userId: '',
        joinDate: '',
        walletAddress: '',
        walletNetwork: 'TRC20', // Default network
        walletAddressTRC20: '',
        walletAddressBEP20: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        // Income wallet fields
        profitWallet: '0.00',
        capitalWallet: '0.00',
        availableProfit: '0.00',
        withdrawalReleased: '0.00',
        withdrawalPending: '0.00',
        // Password fields
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        loadProfile();
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await dashboardService.getStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    const loadProfile = async () => {
        try {
            const data = await authService.getCurrentUser();
            if (data && data.success && data.data) {
                const u = data.data;
                setFormData(prev => ({
                    ...prev,
                    fullName: u.fullName || '',
                    email: u.email || '',
                    mobile: u.mobile || '',
                    userId: u.userId || '',
                    joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
                    walletAddress: u.walletAddress || '',
                    walletAddressTRC20: u.walletAddressTRC20 || '',
                    walletAddressBEP20: u.walletAddressBEP20 || '',
                    bankName: u.bankName || '',
                    accountNumber: u.accountNumber || '',
                    ifscCode: u.ifscCode || '',
                    rank: u.rank || 'Member',
                    sponsherId: u.sponsherId || null,
                    sponsherUsername: u.sponsherUsername || null,
                    // Income wallet fields
                    profitWallet: u.profitWallet || '0.00',
                    capitalWallet: u.capitalWallet || '0.00',
                    availableProfit: u.availableProfit || '0.00',
                    withdrawalReleased: u.withdrawalReleased || '0.00',
                    withdrawalPending: u.withdrawalPending || '0.00'
                }));
            }
        } catch (error) {
            console.error('Failed to load profile', error);
            toast.error('Failed to load profile data');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.updateProfile(formData);
            toast.success('Profile updated successfully');
            setIsEditing(false);
            loadProfile(); // Refresh
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordUpdate = async () => {
        if (!passwordForm.newPassword) {
            toast.error("Please enter a new password");
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        // Note: Backend currently doesn't enforce current password check on this endpoint
        // sending only the new password to updateProfile

        setLoading(true);
        try {
            await authService.updateProfile({ password: passwordForm.newPassword });
            toast.success("Password updated successfully");
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts.length > 0) {
                    const address = accounts[0];
                    setFormData(prev => ({ ...prev, walletAddress: address }));

                    // Auto-save wallet ? Or let user save manually?
                    // Let's auto save for convenience or just set in form
                    toast.success('Wallet Connected!');
                    // Optionally save immediately
                    await authService.updateProfile({ walletAddress: address });
                }
            } catch (error) {
                console.error(error);
                toast.error('User rejected connection');
            }
        } else {
            toast.error('Please install MetaMask or TrustWallet');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-medium ${activeTab === id
                ? 'bg-gradient-to-r from-golden-500 to-golden-600 text-white shadow-lg shadow-gray-400'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-400 shadow-lg shadow-gray-300'
                }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6 md:space-y-8 min-h-screen bg-gray-50 pb-20"
        >
            {/* Header Section */}
            <div className="relative rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-10 shadow-2xl overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-golden-500/20 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-golden-600/10 to-transparent rounded-full blur-2xl"></div>

                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 right-20 w-32 h-32 border-2 border-golden-400 rounded-full"></div>
                    <div className="absolute bottom-20 left-10 w-24 h-24 border-2 border-golden-400 rounded-lg rotate-45"></div>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Avatar Section */}
                    <div className="relative group cursor-pointer">
                        <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-golden-400 via-golden-500 to-golden-600 p-1 shadow-2xl shadow-golden-500/50 group-hover:shadow-golden-500/70 transition-all duration-300 group-hover:scale-105">
                            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                                <User size={72} className="text-golden-400" />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 p-3 bg-gradient-to-br from-golden-400 to-golden-600 rounded-xl text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 cursor-pointer">
                            <Edit2 size={18} />
                        </div>
                    </div>

                    {/* User Info Section */}
                    <div className="flex-1 text-center md:text-left">
                        {/* Name and Rank */}
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-4">
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                                {formData.fullName || 'User'}
                            </h1>
                            <span className="px-4 py-2 bg-gradient-to-r from-golden-400 via-golden-500 to-golden-600 text-gray-900 text-sm font-bold rounded-full shadow-lg shadow-golden-500/50 uppercase tracking-wider">
                                {formData.rank || 'Member'}
                            </span>
                        </div>

                        {/* User Details Grid */}
                        <div className="grid grid-cols-1 gap-4 mt-6">
                            {/* User ID Card */}
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-golden-500/20 rounded-lg">
                                        <User size={20} className="text-golden-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">User ID</p>
                                        <p className="text-white font-mono font-bold text-lg">{formData.userId}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Join Date Card */}
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-golden-500/20 rounded-lg">
                                        <CheckCircle size={20} className="text-golden-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Member Since</p>
                                        <p className="text-white font-semibold text-lg">{formData.joinDate}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-4">
                <TabButton id="personal" label="Personal Details" icon={User} />
                <TabButton id="security" label="Security" icon={Shield} />
                <TabButton id="banking" label="Wallet" icon={CreditCard} />
                <TabButton id="income" label="Income" icon={DollarSign} />
                <TabButton id="referral" label="Referral Link" icon={Users} />
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-400 border border-gray-400 p-4 md:p-6">
                {activeTab === 'personal' && (
                    <motion.form
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onSubmit={handleSave}
                        className="space-y-8"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
                            <button
                                type="button"
                                onClick={() => setIsEditing(!isEditing)}
                                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all font-medium border ${isEditing
                                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                    : 'bg-golden-50 text-golden-600 border-golden-400 hover:bg-golden-300 hover:text-black shadow-lg shadow-golden-500/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:shadow-black/30'
                                    }`}
                            >
                                {isEditing ? <><X size={18} /> Cancel</> : <><Edit2 size={18} /> Edit Details</>}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="text-black group-focus-within:text-golden-500 transition-colors" size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-300 border-transparent text-gray-500 cursor-not-allowed font-medium"
                                        placeholder="Enter full name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="text-gray-400" size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        disabled={true}
                                        value={formData.email}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-300 border-transparent text-gray-500 cursor-not-allowed font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Mobile Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Phone className="text-black group-focus-within:text-golden-500 transition-colors" size={20} />
                                    </div>
                                    <input
                                        type="tel"
                                        disabled={!isEditing}
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-300 border-transparent text-gray-500 cursor-not-allowed font-medium"
                                        placeholder="Enter mobile number"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">User Name (ID)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="text-gray-400" size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        disabled={true}
                                        value={formData.userId}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-300 border-transparent text-gray-500 cursor-not-allowed font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Activation Date</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <CheckCircle className="text-gray-400" size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        disabled={true}
                                        value={formData.joinDate}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-300 border-transparent text-gray-500 cursor-not-allowed font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Sponsor ID</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="text-gray-400" size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        disabled={true}
                                        value={formData.sponsherId || 'N/A'}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-300 border-transparent text-gray-500 cursor-not-allowed font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Sponsor User Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="text-gray-400" size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        disabled={true}
                                        value={formData.sponsherUsername || 'N/A'}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-300 border-transparent text-gray-500 cursor-not-allowed font-medium"
                                    />
                                </div>
                            </div>

                        </div>

                        {isEditing && (
                            <div className="flex justify-end pt-6 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-golden-500 to-golden-600 text-white rounded-xl shadow-lg shadow-golden-500/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 font-bold tracking-wide disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                                </button>
                            </div>
                        )}
                    </motion.form>
                )}

                {activeTab === 'security' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <h2 className="text-xl font-bold text-gray-800">Security Settings</h2>
                        {/* Security UI same as before, simplified for this diff */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-md font-semibold text-gray-700">Change Password</h3>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="password"
                                            placeholder="Current Password"
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-400 focus:border-golden-500 outline-none bg-gray-300"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="password"
                                            placeholder="New Password"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-400 focus:border-golden-500 outline-none bg-gray-300"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="password"
                                            placeholder="Confirm New Password"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-400 focus:border-golden-500 outline-none bg-gray-300"
                                        />
                                    </div>
                                    <button
                                        onClick={handlePasswordUpdate}
                                        disabled={loading}
                                        className="px-6 py-3 bg-gray-800 text-white rounded-xl shadow hover:bg-gray-700 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'banking' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <h2 className="text-xl font-bold text-gray-800">Wallet Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Wallet Card */}
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden md:col-span-2">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <CreditCard size={120} />
                                </div>
                                <div className="relative z-10">
                                    <p className="opacity-70 mb-4 text-sm">USDT Wallet Addresses</p>

                                    {/* Network Selection */}
                                    <div className="mb-6">
                                        <label className="text-xs opacity-70 uppercase tracking-wider mb-2 block">Select Network</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, walletNetwork: 'TRC20' })}
                                                className={`py-3 px-4 rounded-lg font-bold text-sm transition-all ${formData.walletNetwork === 'TRC20'
                                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                    }`}
                                            >
                                                TRC20 (Tron)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, walletNetwork: 'BEP20' })}
                                                className={`py-3 px-4 rounded-lg font-bold text-sm transition-all ${formData.walletNetwork === 'BEP20'
                                                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg'
                                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                    }`}
                                            >
                                                BEP20 (BSC)
                                            </button>
                                        </div>
                                    </div>

                                    {/* Wallet Address Inputs */}
                                    <div className="space-y-4">
                                        {/* Single Dynamic Wallet Address Field */}
                                        <div>
                                            <label className="text-xs opacity-70 uppercase tracking-wider mb-2 block">
                                                {formData.walletNetwork === 'TRC20' ? 'TRC20 Wallet Address' : 'BEP20 Wallet Address'}
                                            </label>
                                            <div className="relative">
                                                <Wallet
                                                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${formData.walletNetwork === 'TRC20' ? 'text-green-400' : 'text-yellow-400'
                                                        }`}
                                                    size={20}
                                                />
                                                <input
                                                    type="text"
                                                    value={formData.walletNetwork === 'TRC20' ? formData.walletAddressTRC20 : formData.walletAddressBEP20}
                                                    onChange={(e) => {
                                                        if (formData.walletNetwork === 'TRC20') {
                                                            setFormData({ ...formData, walletAddressTRC20: e.target.value });
                                                        } else {
                                                            setFormData({ ...formData, walletAddressBEP20: e.target.value });
                                                        }
                                                    }}
                                                    placeholder={`Enter ${formData.walletNetwork} wallet address`}
                                                    className={`w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all font-mono text-sm ${formData.walletNetwork === 'TRC20'
                                                        ? 'focus:border-green-400 focus:ring-green-400/50'
                                                        : 'focus:border-yellow-400 focus:ring-yellow-400/50'
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="w-full py-3 bg-gradient-to-r from-golden-400 to-golden-600 text-black font-bold rounded-lg shadow-lg hover:shadow-golden-500/70 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Save size={18} />
                                            {loading ? 'Updating...' : 'Update Wallet Addresses'}
                                        </button>

                                        <div>
                                            <p className="text-xs opacity-50 uppercase tracking-widest mb-1">Status</p>
                                            <span className={`flex items-center gap-2 ${formData.walletAddressTRC20 || formData.walletAddressBEP20
                                                ? 'text-green-400'
                                                : 'text-red-400'
                                                } font-bold`}>
                                                <Shield size={16} />
                                                {formData.walletAddressTRC20 || formData.walletAddressBEP20 ? 'Verified' : 'Unverified'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Details Form */}
                            {/* <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50"> */}
                            {/* <h3 className="font-bold text-gray-700 mb-4">Bank Account Information</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Bank Name"
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-400 focus:border-golden-500 outline-none bg-gray-300"
                                />
                                <input
                                    type="text"
                                    placeholder="Account Number"
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-400 focus:border-golden-500 outline-none bg-gray-300"
                                />
                                <input
                                    type="text"
                                    placeholder="IFSC / Swift Code"
                                    value={formData.ifscCode}
                                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-400 focus:border-golden-500 outline-none bg-gray-300"
                                />
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-golden-500 to-golden-600 text-white rounded-xl shadow-lg font-semibold hover:-translate-y-1 transition-transform"
                                >
                                    {loading ? 'Updating...' : 'Update Bank Details'}
                                </button>
                            </div> */}
                            {/* </div> */}
                        </div>
                    </motion.div>
                )}

                {/* Income Tab */}
                {activeTab === 'income' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <h2 className="text-xl font-bold text-gray-800">Income Overview</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* 1. Capital Wallet (Moved First) */}
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 md:p-6 rounded-2xl shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Wallet size={100} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Wallet size={24} />
                                        <p className="text-sm opacity-80 uppercase tracking-wider">Capital Wallet</p>
                                    </div>
                                    <p className="text-3xl font-bold mb-1">
                                        ${formData.capitalWallet || '0.00'}
                                    </p>
                                    <p className="text-xs opacity-70">Total Purchased Amount</p>
                                </div>
                            </div>

                            {/* 2. Profit Wallet (Moved Second) */}
                            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 md:p-6 rounded-2xl shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <TrendingUp size={100} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign size={24} />
                                        <p className="text-sm opacity-80 uppercase tracking-wider">Profit Wallet</p>
                                    </div>
                                    <p className="text-3xl font-bold mb-1">
                                        ${formData.profitWallet || '0.00'}
                                    </p>
                                    <p className="text-xs opacity-70">Total Profit Balance</p>
                                </div>
                            </div>

                            {/* 3. Available Profit */}
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 md:p-6 rounded-2xl shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <DollarSign size={100} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle size={24} />
                                        <p className="text-sm opacity-80 uppercase tracking-wider">Available Profit</p>
                                    </div>
                                    <p className="text-3xl font-bold mb-1">
                                        ${formData.availableProfit || '0.00'}
                                    </p>
                                    <p className="text-xs opacity-70">Withdrawal - Profit</p>
                                </div>
                            </div>

                            {/* 4. Withdrawal Released */}
                            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-4 md:p-6 rounded-2xl shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <CheckCircle size={100} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle size={24} />
                                        <p className="text-sm opacity-80 uppercase tracking-wider">Withdrawal Released</p>
                                    </div>
                                    <p className="text-3xl font-bold mb-1">
                                        ${formData.withdrawalReleased || '0.00'}
                                    </p>
                                    <p className="text-xs opacity-70">Admin Approved Amount</p>
                                </div>
                            </div>

                            {/* 5. Withdrawal Pending */}
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 md:p-6 rounded-2xl shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <X size={100} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <X size={24} />
                                        <p className="text-sm opacity-80 uppercase tracking-wider">Withdrawal Pending</p>
                                    </div>
                                    <p className="text-3xl font-bold mb-1">
                                        ${formData.withdrawalPending || '0.00'}
                                    </p>
                                    <p className="text-xs opacity-70">Pending Approval</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'referral' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="px-2">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Referral Management</h2>
                            <p className="text-gray-500 font-medium text-sm">Grow your network and track your power leg placements.</p>
                        </div>
                        <div className="max-w-4xl mx-auto w-full">
                            <ReferralCard user={user} stats={stats} />
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default Profile;


// http://localhost:5173/register?ref=IVA100001&position=left
// http://localhost:5173/register?ref=IVA100001&position=right
// http://localhost:5173/register?ref=IVA100001&position=placing-left
// http://localhost:5173/register?ref=IVA100001&position=placing-right