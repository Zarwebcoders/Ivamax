import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { User, Mail, Phone, Lock, CreditCard, Shield, Edit2, Save, X, Wallet, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
    const { user, login } = useAuth(); // We might need to update user in context
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('personal'); // personal, security, banking
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        userId: '',
        joinDate: '',
        walletAddress: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        // Password fields
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

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
                    bankName: u.bankName || '',
                    accountNumber: u.accountNumber || '',
                    ifscCode: u.ifscCode || '',
                    rank: u.rank || 'Member'
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
            className="space-y-8 min-h-screen bg-gray-50 pb-20"
        >
            {/* Header Section */}
            <div className="relative rounded-3xl bg-white p-8 shadow-xl shadow-gray-400/50 border border-gray-400 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-golden-50 rounded-bl-full opacity-50"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group cursor-pointer">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-golden-100 to-golden-200 p-1 shadow-xl">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                <User size={64} className="text-golden-500" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 p-2 bg-golden-500 rounded-full text-white shadow-lg border-2 border-white group-hover:bg-golden-600 transition-colors">
                            <Edit2 size={16} />
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                            <h1 className="text-3xl font-bold text-gray-800">{formData.fullName || 'User'}</h1>
                            <span className="px-3 py-1 bg-gradient-to-r from-golden-500 to-golden-600 text-white text-sm font-bold rounded-full shadow-md">
                                {formData.rank || 'Member'}
                            </span>
                        </div>
                        <p className="text-gray-500 mb-4 flex items-center justify-center md:justify-start gap-2">
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">ID: {formData.userId}</span>
                            <span className="text-gray-400">•</span>
                            <span>Joined {formData.joinDate}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-4">
                <TabButton id="personal" label="Personal Details" icon={User} />
                <TabButton id="security" label="Security" icon={Shield} />
                <TabButton id="banking" label="Banking & Wallet" icon={CreditCard} />
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-400 border border-gray-400 p-6">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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
                                        <input type="password" placeholder="Current Password" className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-400 focus:border-golden-500 outline-none bg-gray-300" />
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input type="password" placeholder="New Password" className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-400 focus:border-golden-500 outline-none bg-gray-300" />
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input type="password" placeholder="Confirm New Password" className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-400 focus:border-golden-500 outline-none bg-gray-300" />
                                    </div>
                                    <button className="px-6 py-3 bg-gray-800 text-white rounded-xl shadow hover:bg-gray-700 transition-colors">
                                        Update Password
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
                        <h2 className="text-xl font-bold text-gray-800">Banking & Wallet Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Wallet Card */}
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <CreditCard size={120} />
                                </div>
                                <div className="relative z-10">
                                    <p className="opacity-70 mb-1">USDT Wallet Address (TRC20)</p>
                                    <p className="font-mono text-lg break-all mb-4 h-16 flex items-center">
                                        {formData.walletAddress || 'Not Connected'}
                                    </p>

                                    <div className="flex flex-col gap-4">
                                        <button
                                            onClick={connectWallet}
                                            className="w-full py-2 bg-gradient-to-r from-golden-400 to-golden-600 text-black font-bold rounded-lg shadow-lg hover:shadow-golden-500/70 active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Wallet size={18} />
                                            {formData.walletAddress ? 'Change Wallet' : 'Connect Wallet'}
                                        </button>

                                        <div>
                                            <p className="text-xs opacity-50 uppercase tracking-widest mb-1">Status</p>
                                            <span className={`flex items-center gap-2 ${formData.walletAddress ? 'text-green-400' : 'text-red-400'} font-bold`}>
                                                <Shield size={16} /> {formData.walletAddress ? 'Verified' : 'Unverified'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Details Form */}
                            <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50">
                                <h3 className="font-bold text-gray-700 mb-4">Bank Account Information</h3>
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
                                </div>
                            </div>
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