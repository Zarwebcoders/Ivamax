import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Download, TrendingUp, BarChart2, Award, Users } from 'lucide-react';
import { incomeService } from '../services/income.service';
import toast from 'react-hot-toast';

const Reports = () => {
    const [reportType, setReportType] = useState('matching');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    useEffect(() => {
        fetchReportData();
    }, [reportType]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            let data;
            if (reportType === 'matching') {
                data = await incomeService.getMatchingHistory();
            } else if (reportType === 'rewards') {
                data = await incomeService.getRankRewards();
            } else if (reportType === 'sales') {
                data = await incomeService.getMonthlySales();
            }

            if (data?.success) {
                setReportData(data.data);
            } else {
                toast.error('Failed to fetch report data');
            }
        } catch (error) {
            console.error(`Error fetching ${reportType} report:`, error);
            toast.error(`Error loading ${reportType} report`);
        } finally {
            setLoading(false);
        }
    };

    const ReportCard = ({ title, icon: Icon, color, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`p-4 md:p-6 rounded-2xl border transition-all duration-300 text-left w-full group h-full ${isActive
                ? `bg-indigo-50 border-indigo-200 shadow-lg ring-2 ring-indigo-500/20 card-glass border-2 border-indigo-400 shadow-lg shadow-indigo-400`
                : 'bg-white border-gray-400 hover:bg-gray-50 shadow hover:-translate-y-1 card-glass border-2 border-gray-400 shadow-lg shadow-gray-400'
                }`}
        >
            <div className={`p-2 md:p-3 rounded-xl bg-white w-fit mb-3 md:mb-4 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform ${isActive ? 'text-indigo-600' : `text-${color}-600`}`}>
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className={`text-sm md:text-lg font-bold mb-1 ${isActive ? `text-indigo-800` : 'text-gray-800'}`}>{title}</h3>
            <p className={`text-xs md:text-sm ${isActive ? `text-indigo-600` : 'text-gray-500'}`}>View detailed statement</p>
        </button>
    );

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 min-h-screen bg-transparent"
        >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 card-glass p-6 border-2 border-gray-400 shadow-lg shadow-gray-400">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Business Reports</h1>
                    <p className="text-gray-500">Track your business growth and rewards with real-time data</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => toast.success('Period selection feature coming soon')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-400 rounded-lg hover:bg-gray-50 text-gray-600 card-glass p-6 border-2 border-gray-400"
                    >
                        <Calendar size={16} />
                        Select Period
                    </button>
                    <button
                        onClick={() => toast.success('PDF Export feature coming soon')}
                        className="flex items-center gap-2 px-4 py-2 bg-golden-100 text-golden-700 border border-golden-100 rounded-lg hover:bg-golden-200 card-glass p-6 border-2 border-gray-400"
                    >
                        <Download size={16} />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Report Type Selector */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                <ReportCard
                    title="Matching Bonus"
                    icon={TrendingUp}
                    color="blue"
                    isActive={reportType === 'matching'}
                    onClick={() => setReportType('matching')}
                />
                <ReportCard
                    title="Rank & Rewards"
                    icon={Award}
                    color="golden"
                    isActive={reportType === 'rewards'}
                    onClick={() => setReportType('rewards')}
                />
                <ReportCard
                    title="Monthly Sales"
                    icon={BarChart2}
                    color="purple"
                    isActive={reportType === 'sales'}
                    onClick={() => setReportType('sales')}
                />
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-400 overflow-hidden border-2 border-gray-400 shadow-lg shadow-gray-400">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">
                        {reportType === 'matching' && 'Daily Matching History'}
                        {reportType === 'rewards' && 'Rank & Rewards Achievement'}
                        {reportType === 'sales' && 'Monthly Sales Performance'}
                    </h3>
                    {loading && (
                        <div className="flex items-center gap-2 text-indigo-600">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            >
                                <BarChart2 size={20} />
                            </motion.div>
                            <span className="text-sm font-semibold">Updating...</span>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    {!loading && reportData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                            <FileText size={64} className="mb-4 opacity-20" />
                            <p className="text-lg">No data available for this report period</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            {reportType === 'matching' && (
                                <>
                                    <thead className="bg-gray-50 text-gray-600">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider">Left BV</th>
                                            <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider">Right BV</th>
                                            <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider">Matched</th>
                                            <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider">Flush</th>
                                            <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider text-indigo-600">Income</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {reportData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-indigo-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-700 font-medium">{row.date}</td>
                                                <td className="px-6 py-4 text-right font-medium text-gray-800">{row.leftBV.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right font-medium text-gray-800">{row.rightBV.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right font-bold text-indigo-600">{row.matched.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right text-red-500">{row.flush.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right font-bold text-green-600">+${row.income.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            )}

                            {reportType === 'rewards' && (
                                <>
                                    <thead className="bg-gray-50 text-gray-600">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Reward Type</th>
                                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Rank</th>
                                            <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider text-indigo-600">Amount</th>
                                            <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {reportData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-indigo-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-700 font-medium">{row.date}</td>
                                                <td className="px-6 py-4 text-sm text-gray-800 font-bold">{row.rewardType}</td>
                                                <td className="px-6 py-4 text-sm text-indigo-600 font-semibold">{row.rank || 'N/A'}</td>
                                                <td className="px-6 py-4 text-right font-bold text-green-600">+${row.amount.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${row.status === 'processed' ? 'bg-green-100 text-green-700' : 'bg-golden-100 text-golden-700'
                                                        }`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            )}

                            {reportType === 'sales' && (
                                <>
                                    <thead className="bg-gray-50 text-gray-600">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Period</th>
                                            <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider text-indigo-600">Direct Sales</th>
                                            <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider">Total Orders</th>
                                            <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider">Active Customers</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {reportData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-indigo-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-700 font-bold">{row.date}</td>
                                                <td className="px-6 py-4 text-right font-bold text-green-600">${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td className="px-6 py-4 text-right font-medium text-gray-800">{row.referrals}</td>
                                                <td className="px-6 py-4 text-right font-medium text-indigo-600">{row.activeMembers}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            )}
                        </table>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Reports;

