import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { incomeService } from '../services/income.service';
import { DollarSign, TrendingUp, Users, Award, Calendar, Coins, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const Income = () => {
    const [currentIncome, setCurrentIncome] = useState(null);
    const [incomeHistory, setIncomeHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('current');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [current, history] = await Promise.all([
                incomeService.getCurrentIncome(),
                incomeService.getIncomeHistory(12),
            ]);

            if (current.success) setCurrentIncome(current.data);
            if (history.success) setIncomeHistory(history.data);
        } catch (error) {
            console.error('Error fetching income data:', error);
            toast.error('Failed to load income data');
        } finally {
            setLoading(false);
        }
    };

    const getMonthName = (month) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[month - 1];
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glass p-6 border-2 border-gray-400 shadow-lg shadow-gray-400"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text mb-2">Income Dashboard</h1>
                        <p className="text-text-tertiary">Track your monthly earnings and income history</p>
                    </div>
                    <DollarSign className="w-12 h-12 text-golden-500" />
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('current')}
                    className={`px-6 py-3 font-semibold transition-all ${activeTab === 'current'
                        ? 'text-golden-600 border-b-2 border-golden-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Current Month
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 font-semibold transition-all ${activeTab === 'history'
                        ? 'text-golden-600 border-b-2 border-golden-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Income History
                </button>
            </div>

            {/* Current Month Tab */}
            {activeTab === 'current' && currentIncome && (
                <div className="space-y-6">
                    {/* Total Income Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card bg-gradient-to-br from-golden-400 to-golden-600 text-white p-8 shadow-lg shadow-gray-400"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 mb-2">Total Monthly Income</p>
                                <h2 className="text-5xl font-bold">${currentIncome.totalIncome.toFixed(2)}</h2>
                                <p className="text-white/80 mt-2">
                                    {getMonthName(currentIncome.month)} {currentIncome.year}
                                </p>
                            </div>
                            <TrendingUp className="w-20 h-20 text-white/30" />
                        </div>
                    </motion.div>

                    {/* Income Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Pair Matching Royalty */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="card p-6 hover:shadow-xl transition-shadow border-2 border-gray-400 shadow-lg shadow-gray-400"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-lg">Pair Matching</h3>
                            </div>
                            <p className="text-3xl font-bold text-blue-600 mb-2">
                                ${currentIncome.pairMatchingRoyalty.amount.toFixed(2)}
                            </p>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>Rank: {currentIncome.pairMatchingRoyalty.rankName || 'Member'}</p>
                                <p>Total ID: {currentIncome.pairMatchingRoyalty.totalId || 0}</p>
                                <p>Left: {currentIncome.pairMatchingRoyalty.leftCount} | Right: {currentIncome.pairMatchingRoyalty.rightCount}</p>
                            </div>
                        </motion.div>

                        {/* Direct Referral Royalty */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="card p-6 hover:shadow-xl transition-shadow border-2 border-gray-400 shadow-lg shadow-gray-400"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="font-bold text-lg">Direct Referral</h3>
                            </div>
                            <p className="text-3xl font-bold text-green-600 mb-2">
                                ${currentIncome.directReferralRoyalty.totalAmount.toFixed(2)}
                            </p>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>USDT: ${currentIncome.directReferralRoyalty.amountUSDT.toFixed(2)}</p>
                                <p>Token: ${currentIncome.directReferralRoyalty.amountToken.toFixed(2)}</p>
                                <p>Referrals: {currentIncome.directReferralRoyalty.referralDetails.length}</p>
                            </div>
                        </motion.div>

                        {/* Founder Club Royalty */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="card p-6 hover:shadow-xl transition-shadow border-2 border-gray-400 shadow-lg shadow-gray-400"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
                                    <Award className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="font-bold text-lg">Founder Club</h3>
                            </div>
                            <p className="text-3xl font-bold text-purple-600 mb-2">
                                ${currentIncome.founderClubRoyalty.amount.toFixed(2)}
                            </p>
                            <div className="text-sm text-gray-600">
                                <p className={currentIncome.founderClubRoyalty.qualified ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                                    {currentIncome.founderClubRoyalty.qualified ? '✓ Qualified' : '✗ Not Qualified'}
                                </p>
                                <p className="text-xs mt-1">Requires 2 Founder-rank directs</p>
                            </div>
                        </motion.div>

                        {/* Daily Fix Return (New DFR) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="card p-6 hover:shadow-xl transition-shadow border-2 border-gray-400 shadow-lg shadow-gray-400"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h3 className="font-bold text-lg">Daily Fix Return</h3>
                            </div>
                            <p className="text-3xl font-bold text-indigo-600 mb-2">
                                ${(currentIncome.dfrIncome || 0).toFixed(2)}
                            </p>
                            <div className="text-sm text-gray-600">
                                <p>ROI on capital investment</p>
                                <p className="text-xs mt-1">0.125% per day (3.75%/mo)</p>
                            </div>
                        </motion.div>

                        {/* Direct Referral Bonus (DIR) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="card p-6 hover:shadow-xl transition-shadow border-2 border-gray-400 shadow-lg shadow-gray-400"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-lg">Direct Bonus</h3>
                            </div>
                            <p className="text-3xl font-bold text-blue-600 mb-2">
                                ${(currentIncome.dirIncome || 0).toFixed(2)}
                            </p>
                            <div className="text-sm text-gray-600">
                                <p>One-time Referral Reward</p>
                                <p className="text-xs mt-1">5% of direct's package</p>
                            </div>
                        </motion.div>

                        {/* RE-PR Income */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="card p-6 hover:shadow-xl transition-shadow border-2 border-gray-400 shadow-lg shadow-gray-400"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center">
                                    <Target className="w-6 h-6 text-orange-600" />
                                </div>
                                <h3 className="font-bold text-lg">RE-PR Income</h3>
                            </div>
                            <p className="text-3xl font-bold text-orange-600 mb-2">
                                ${(currentIncome.reprIncome || 0).toFixed(2)}
                            </p>
                            <div className="text-sm text-gray-600">
                                <p>Re-Purchase / Performance Bonus</p>
                                <p className="text-xs mt-1">Calculated monthly</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Referral Details */}
                    {currentIncome.directReferralRoyalty.referralDetails.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="card p-6 border-2 border-gray-400 shadow-lg shadow-gray-400"
                        >
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-golden-600" />
                                Qualifying Referrals
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">User ID</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Rank</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Their Income</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Your Share</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentIncome.directReferralRoyalty.referralDetails.map((ref, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-mono">{ref.userId}</td>
                                                <td className="px-4 py-3 text-sm">Rank {ref.rank}</td>
                                                <td className="px-4 py-3 text-sm">${ref.income.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-sm font-semibold text-green-600">
                                                    ${(ref.income * 0.10).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="space-y-4">
                    {incomeHistory.length === 0 ? (
                        <div className="card p-12 text-center text-gray-500 border-2 border-gray-400 shadow-lg shadow-gray-400">
                            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p>No income history available yet</p>
                        </div>
                    ) : (
                        incomeHistory.map((monthData, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="card p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-golden-100 flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-golden-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">
                                                {getMonthName(monthData.month)} {monthData.year}
                                            </h3>
                                            <p className="text-sm text-gray-500">{monthData.incomes.length} income types</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-golden-600">${monthData.total.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {monthData.incomes.map((income, incIdx) => (
                                        <div key={incIdx} className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-xs text-gray-500 mb-1 flex flex-wrap items-center gap-1">
                                                {income.incomeType === 'PMR' && 'Pair Matching'}
                                                {income.incomeType === 'DRR' && 'Direct Referral'}
                                                {income.incomeType === 'FCR' && 'Founder Club'}
                                                {income.incomeType === 'DFR' && 'Daily Fix Return'}
                                                {income.incomeType === 'DIR' && 'Direct referral bonus'}
                                                {income.incomeType === 'REPR' && 'RE-PR Income'}
                                                {income.incomeType === 'RANK' && <><Award className="w-3 h-3 text-indigo-500" /> Rank Achieved</>}
                                            </p>
                                            {income.incomeType === 'RANK' ? (
                                                <p className="text-lg font-bold text-indigo-600 mt-1 bg-indigo-50 inline-block px-2 py-1 rounded w-max">
                                                    {income.rank}
                                                </p>
                                            ) : (
                                                <p className="text-xl font-bold">${income.netAmount.toFixed(2)}</p>
                                            )}
                                            {income.tokenAmount > 0 && (
                                                <p className="text-xs text-purple-600 flex items-center gap-1 mt-1">
                                                    <Coins className="w-3 h-3" />
                                                    ${income.tokenAmount.toFixed(2)} Token
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Income;
