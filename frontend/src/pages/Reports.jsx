import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Download, TrendingUp, BarChart2, Award } from 'lucide-react';

const Reports = () => {
    const [reportType, setReportType] = useState('matching');

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    // Mock Data for Matching Report
    const matchingData = [
        { date: '2024-02-03', leftBV: 500, rightBV: 500, matched: 500, income: 50, flush: 0 },
        { date: '2024-02-02', leftBV: 300, rightBV: 300, matched: 300, income: 30, flush: 0 },
        { date: '2024-02-01', leftBV: 1200, rightBV: 1000, matched: 1000, income: 100, flush: 200 },
    ];

    const ReportCard = ({ title, icon: Icon, color, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`p-4 md:p-6 rounded-2xl border transition-all duration-300 text-left w-full group h-full ${isActive
                ? `bg-${color}-50 border-${color}-200 shadow-lg ring-2 ring-${color}-500/20 card-glass border-2 border-gray-400 shadow-lg shadow-gray-400`
                : 'bg-white border-gray-400 hover:bg-gray-50 shadow hover:-translate-y-1 card-glass border-2 border-gray-400 shadow-lg shadow-gray-400'
                }`}
        >
            <div className={`p-2 md:p-3 rounded-xl bg-white w-fit mb-3 md:mb-4 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform text-${color}-600`}>
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className={`text-sm md:text-lg font-bold mb-1 ${isActive ? `text-${color}-800` : 'text-gray-800'}`}>{title}</h3>
            <p className={`text-xs md:text-sm ${isActive ? `text-${color}-600` : 'text-gray-500'}`}>View detailed statement</p>
        </button>
    );

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 min-h-screen bg-gray-50"
        >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 card-glass p-6 border-2 border-gray-400 shadow-lg shadow-gray-400">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Business Reports</h1>
                    <p className="text-gray-500">Track your business growth and rewards</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-400 rounded-lg hover:bg-gray-50 text-gray-600 card-glass p-6 border-2 border-gray-400">
                        <Calendar size={16} />
                        Select Period
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-golden-100 text-golden-700 border border-golden-100 rounded-lg hover:bg-golden-200 card-glass p-6 border-2 border-gray-400">
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
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">
                        {reportType === 'matching' && 'Daily Matching History'}
                        {reportType === 'rewards' && 'Rank Achievement Status'}
                        {reportType === 'sales' && 'Monthly Sales Analysis'}
                    </h3>
                </div>

                {reportType === 'matching' && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Date</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 whitespace-nowrap">Left BV</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 whitespace-nowrap">Right BV</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 whitespace-nowrap">Matched Volume</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 whitespace-nowrap">Flush Out</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 whitespace-nowrap">Income Generated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {matchingData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-300 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{row.date}</td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-800 whitespace-nowrap">{row.leftBV}</td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-800 whitespace-nowrap">{row.rightBV}</td>
                                        <td className="px-6 py-4 text-right font-bold text-blue-600 whitespace-nowrap">{row.matched}</td>
                                        <td className="px-6 py-4 text-right text-red-500 whitespace-nowrap">{row.flush}</td>
                                        <td className="px-6 py-4 text-right font-bold text-green-600 whitespace-nowrap">+${row.income}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {reportType !== 'matching' && (
                    <div className="p-12 text-center text-gray-400">
                        <BarChart2 size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Detailed {reportType} report interface coming soon.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Reports;
