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
    const [historyFilter, setHistoryFilter] = useState('ALL');

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
                        {/* Daily Fix Return (New DFR) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            onClick={() => { setActiveTab('history'); setHistoryFilter('DFR'); }}
                            className="card p-6 border-2 border-gray-400 shadow-lg shadow-gray-400 cursor-pointer hover:bg-gray-50 transition-colors group"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center group-hover:bg-indigo-300 transition-colors">
                                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h3 className="font-bold text-lg group-hover:text-indigo-600 transition-colors">Daily Fix Return</h3>
                            </div>
                            <p className="text-3xl font-bold text-indigo-600 mb-2">
                                ${(currentIncome.dfrIncome || 0).toFixed(2)}
                            </p>
                            <div className="text-sm text-gray-600">
                                <p>ROI on capital investment</p>
                                <p className="text-xs mt-1">$0.325 per day ($9.75/mo)</p>
                            </div>
                        </motion.div>

                        {/* Pair Matching Royalty */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            onClick={() => { setActiveTab('history'); setHistoryFilter('PMR'); }}
                            className="card p-6 border-2 border-gray-400 shadow-lg shadow-gray-400 cursor-pointer hover:bg-gray-50 transition-colors group"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center group-hover:bg-blue-300 transition-colors">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">Pair Matching Royalty</h3>
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
                            onClick={() => { setActiveTab('history'); setHistoryFilter('DRR'); }}
                            className="card p-6 border-2 border-gray-400 shadow-lg shadow-gray-400 cursor-pointer hover:bg-gray-50 transition-colors group"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center group-hover:bg-green-300 transition-colors">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="font-bold text-lg group-hover:text-green-600 transition-colors">Direct Referral Royalty</h3>
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
                            onClick={() => { setActiveTab('history'); setHistoryFilter('FCR'); }}
                            className="card p-6 border-2 border-gray-400 shadow-lg shadow-gray-400 cursor-pointer hover:bg-gray-50 transition-colors group"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center group-hover:bg-purple-300 transition-colors">
                                    <Award className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="font-bold text-lg group-hover:text-purple-600 transition-colors">Founder Club Royalty</h3>
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


                        {/* RE-PR Income */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            onClick={() => { setActiveTab('history'); setHistoryFilter('REPR'); }}
                            className="card p-6 border-2 border-gray-400 shadow-lg shadow-gray-400 cursor-pointer hover:bg-gray-50 transition-colors group"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center group-hover:bg-orange-300 transition-colors">
                                    <Target className="w-6 h-6 text-orange-600" />
                                </div>
                                <h3 className="font-bold text-lg group-hover:text-orange-600 transition-colors">RE-PR Income</h3>
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
                <div className="space-y-6">
                    {/* Secondary Tabs for filtering */}
                    <div className="flex flex-wrap gap-3 p-2 bg-gray-50 rounded-2xl border border-gray-200 max-w-fit">
                        {['ALL', 'DFR', 'PMR', 'DRR', 'FCR', 'REPR'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setHistoryFilter(filter)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${historyFilter === filter
                                    ? 'bg-gradient-to-r from-golden-400 to-golden-600 text-white shadow-md shadow-golden-500/20'
                                    : 'bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                                    }`}
                            >
                                {filter === 'ALL' ? 'All History' :
                                    filter === 'DFR' ? 'Daily Fix Return' :
                                        filter === 'PMR' ? 'Pair Matching Royalty' :
                                            filter === 'DRR' ? 'Direct Referral Royalty' :
                                                filter === 'FCR' ? 'Founder Club Royalty' :
                                                    'RE-PR Income'}
                            </button>
                        ))}
                    </div>

                    {incomeHistory.length === 0 ? (
                        <div className="card-glass p-12 text-center text-gray-500 border-2 border-gray-400 shadow-lg shadow-gray-400">
                            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p>No income history available yet</p>
                        </div>
                    ) : (() => {
                        // Flatten and filter history
                        const allIncomes = incomeHistory.flatMap(monthData => monthData.incomes);

                        // Sort by date newest first
                        allIncomes.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

                        const filteredIncomes = (historyFilter === 'ALL'
                            ? allIncomes
                            : allIncomes.filter(inc => inc.incomeType === historyFilter))
                            .filter(inc => inc.status === 'paid' || inc.status === 'processed');

                        if (filteredIncomes.length === 0) {
                            return (
                                <div className="card p-12 text-center text-gray-500 border-2 border-gray-300 shadow-md">
                                    <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>No income of type {historyFilter} found.</p>
                                </div>
                            );
                        }

                        return (
                            <div className="card overflow-hidden shadow-lg shadow-gray-400 border-2 border-gray-400">
                                <div className="p-6 border-b border-gray-200 bg-gray-50">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {historyFilter === 'ALL' ? 'Complete Income History' : `${historyFilter} Income History`}
                                    </h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100 border-b border-gray-200">
                                                <th className="px-6 py-4 text-xs font-bold text-gray-800 uppercase tracking-widest whitespace-nowrap">Date</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-800 uppercase tracking-widest whitespace-nowrap">Income Type</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-800 uppercase tracking-widest whitespace-nowrap">Details</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-800 uppercase tracking-widest whitespace-nowrap">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-800 uppercase tracking-widest whitespace-nowrap text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {filteredIncomes.map((income, incIdx) => (
                                                <tr key={incIdx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            <span className="font-semibold text-gray-700 whitespace-nowrap">
                                                                {new Date(income.date || income.createdAt || new Date()).toLocaleDateString('en-GB', {
                                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
                                                            {income.incomeType === 'PMR' && <Users className="w-3.5 h-3.5 text-blue-500" />}
                                                            {income.incomeType === 'DRR' && <TrendingUp className="w-3.5 h-3.5 text-green-500" />}
                                                            {income.incomeType === 'DFR' && <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />}
                                                            {income.incomeType === 'FCR' && <Award className="w-3.5 h-3.5 text-purple-500" />}
                                                            {income.incomeType === 'REPR' && <Target className="w-3.5 h-3.5 text-orange-500" />}
                                                            {income.incomeType === 'RANK' && <Award className="w-3.5 h-3.5 text-pink-500" />}
                                                            {income.incomeType}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 min-w-48">
                                                        {income.incomeType === 'PMR' && <span>Rank: {income.rank || 'Member'} <br /> <span className="text-xs text-gray-400">Left: {income.leftCount || 0} | Right: {income.rightCount || 0}</span></span>}
                                                        {income.incomeType === 'DRR' && <span>Referral Package Bonus</span>}
                                                        {income.incomeType === 'DFR' && <span>Daily ROI on Capital</span>}
                                                        {income.incomeType === 'FCR' && <span>Founder Club Member Reward</span>}
                                                        {income.incomeType === 'REPR' && <span>Performance Bonus</span>}
                                                        {income.incomeType === 'RANK' && <span>{income.description || `Rank Advanced to ${income.rank}`}</span>}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${income.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                            income.status === 'processed' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-golden-100 text-golden-700'
                                                            }`}>
                                                            {income.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                                        <span className="text-xl font-black text-gray-900">
                                                            ${income.netAmount.toFixed(2)}
                                                        </span>
                                                        {income.tokenAmount > 0 && (
                                                            <p className="text-xs text-purple-600 font-bold mt-1">
                                                                + ${income.tokenAmount.toFixed(2)} Token
                                                            </p>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default Income;
