import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, ArrowRight, Search, Filter, ChevronRight, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BusinessDetails = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Data
    const teamStats = {
        totalTeam: 256,
        leftTeam: 128,
        rightTeam: 128,
        directReferrals: 12,
        activeMembers: 210
    };

    const referrals = [
        { id: 'IVA100021', name: 'Alice Cooper', date: '2024-01-20', side: 'Left', status: 'Active', package: '$500' },
        { id: 'IVA100022', name: 'Bob Smith', date: '2024-01-22', side: 'Right', status: 'Active', package: '$1000' },
        { id: 'IVA100023', name: 'Charlie Brown', date: '2024-01-25', side: 'Left', status: 'Inactive', package: '$100' },
        { id: 'IVA100024', name: 'Diana Prince', date: '2024-02-01', side: 'Right', status: 'Active', package: '$5000' },
        { id: 'IVA100025', name: 'Evan Wright', date: '2024-02-02', side: 'Left', status: 'Active', package: '$500' },
    ];

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 min-h-screen bg-gray-50"
        >
            {/* Header with Tree Link */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-lg shadow-gray-400 border border-gray-400">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Business Overview</h1>
                    <p className="text-gray-500 text-sm md:text-base">Manage your network and direct referrals</p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                    <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-700 text-sm font-medium border border-gray-400 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                        <Share2 size={18} />
                        Refer Link
                    </button>
                    <button
                        onClick={() => navigate('/tree')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-golden-500 to-golden-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-golden-500/20 hover:-translate-y-0.5 transition-all"
                    >
                        <Users size={18} />
                        Visual Tree
                        <ArrowRight size={16} className="hidden sm:block" />
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {[
                    { label: 'Total Team', value: teamStats.totalTeam, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Left Volume', value: teamStats.leftTeam, icon: ChevronRight, rotate: 'rotate-180', color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Right Volume', value: teamStats.rightTeam, icon: ChevronRight, color: 'text-pink-600', bg: 'bg-pink-50' },
                    { label: 'Direct Referrals', value: teamStats.directReferrals, icon: UserPlus, color: 'text-golden-600', bg: 'bg-golden-50' },
                ].map((stat, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ y: -5 }}
                        className="bg-white p-4 md:p-6 rounded-2xl shadow-lg shadow-gray-400 hover:shadow-golden-400 border border-gray-400 flex items-center justify-between"
                    >
                        <div>
                            <p className="text-xs md:text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                            <h3 className={`text-xl md:text-3xl font-bold ${stat.color}`}>{stat.value}</h3>
                        </div>
                        <div className={`p-2 md:p-4 rounded-xl ${stat.bg} ${stat.color} ${stat.rotate || ''}`}>
                            <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Direct Referrals Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-400 overflow-hidden">
                <div className="p-3 border-b border-gray-400 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Direct Referrals</h2>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64 border border-gray-400 rounded-lg">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by ID or Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-golden-500"
                            />
                        </div>
                        <button className="p-2 bg-gray-50 border border-gray-400 rounded-lg text-gray-600 hover:bg-gray-100">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">User Details</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Join Date</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Side</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Package</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-center">
                            {referrals.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-300 transition-colors text-center">
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-golden-200 to-golden-300 flex items-center justify-center font-bold text-gray-600">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-800">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 text-center">{user.date}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.side === 'Left' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                                            }`}>
                                            {user.side}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-golden-600">{user.package}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="text-gray-400 hover:text-golden-600 transition-colors">
                                            <ChevronRight size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default BusinessDetails;
