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
            className={`p-6 rounded-2xl border transition-all duration-300 text-left w-full group ${isActive
                    ? `bg-${color}-50 border-${color}-200 shadow-lg ring-2 ring-${color}-500/20`
                    : 'bg-white border-gray-100 hover:bg-gray-50 shadow hover:-translate-y-1'
                }`}
        >
            <div className={`p-3 rounded-xl bg-white w-fit mb-4 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform text-${color}-600`}>
                <Icon size={24} />
            </div>
            <h3 className={`text-lg font-bold mb-1 ${isActive ? `text-${color}-800` : 'text-gray-800'}`}>{title}</h3>
            <p className={`text-sm ${isActive ? `text-${color}-600` : 'text-gray-500'}`}>View detailed statement</p>
        </button>
    );

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 min-h-screen p-6 bg-gray-50"
        >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Business Reports</h1>
                    <p className="text-gray-500">Track your business growth and rewards</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                        <Calendar size={16} />
                        Select Period
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-golden-50 text-golden-700 border border-golden-100 rounded-lg hover:bg-golden-100">
                        <Download size={16} />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Report Type Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
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
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Left BV</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Right BV</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Matched Volume</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Flush Out</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Income Generated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {matchingData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600">{row.date}</td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-800">{row.leftBV}</td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-800">{row.rightBV}</td>
                                        <td className="px-6 py-4 text-right font-bold text-blue-600">{row.matched}</td>
                                        <td className="px-6 py-4 text-right text-red-500">{row.flush}</td>
                                        <td className="px-6 py-4 text-right font-bold text-green-600">+${row.income}</td>
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
