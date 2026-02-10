import { useState } from 'react';
import { motion } from 'framer-motion';
import { incomeService } from '../../services/income.service';
import { DollarSign, Calendar, Play, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const IncomeProcessing = () => {
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handleProcessIncome = async () => {
        if (!confirm(`Process income for ${months[selectedMonth - 1]} ${selectedYear}?`)) {
            return;
        }

        try {
            setProcessing(true);
            setResult(null);
            const response = await incomeService.processMonthlyIncome(selectedMonth, selectedYear);

            if (response.success) {
                setResult(response);
                toast.success(`Successfully processed ${response.successCount} users!`);
            } else {
                toast.error('Failed to process income');
            }
        } catch (error) {
            console.error('Error processing income:', error);
            toast.error(error.response?.data?.message || 'Failed to process income');
        } finally {
            setProcessing(false);
        }
    };

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
                        <h1 className="text-3xl font-bold gradient-text mb-2">Monthly Income Processing</h1>
                        <p className="text-text-tertiary">Process monthly income for all active users</p>
                    </div>
                    <DollarSign className="w-12 h-12 text-golden-500" />
                </div>
            </motion.div>

            {/* Processing Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-8"
            >
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-golden-600" />
                        Select Period
                    </h2>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        {/* Month Selector */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Month</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-400 focus:border-transparent"
                                disabled={processing}
                            >
                                {months.map((month, idx) => (
                                    <option key={idx} value={idx + 1}>{month}</option>
                                ))}
                            </select>
                        </div>

                        {/* Year Selector */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Year</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-400 focus:border-transparent"
                                disabled={processing}
                            >
                                {[2024, 2025, 2026, 2027].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Process Button */}
                    <button
                        onClick={handleProcessIncome}
                        disabled={processing}
                        className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? (
                            <>
                                <div className="spinner border-white"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5" />
                                Process Monthly Income
                            </>
                        )}
                    </button>

                    {/* Warning */}
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                                <p className="font-semibold mb-1">Important Notes:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>This will calculate and process income for ALL active users</li>
                                    <li>Income will be added to user wallet balances</li>
                                    <li>Already processed months will be skipped</li>
                                    <li>This action cannot be undone</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Results */}
            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-8"
                >
                    <div className="max-w-2xl mx-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <h2 className="text-2xl font-bold">Processing Complete</h2>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                                <p className="text-sm text-blue-600 mb-1">Total Users</p>
                                <p className="text-3xl font-bold text-blue-700">{result.totalUsers}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center">
                                <p className="text-sm text-green-600 mb-1">Successful</p>
                                <p className="text-3xl font-bold text-green-700">{result.successCount}</p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4 text-center">
                                <p className="text-sm text-red-600 mb-1">Errors</p>
                                <p className="text-3xl font-bold text-red-700">{result.errorCount}</p>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Period:</strong> {months[result.month - 1]} {result.year}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>Message:</strong> {result.message}
                            </p>
                        </div>

                        {/* Top Earners */}
                        {result.results && result.results.length > 0 && (
                            <div className="mt-6">
                                <h3 className="font-bold text-lg mb-4">Top Earners</h3>
                                <div className="space-y-2">
                                    {result.results
                                        .filter(r => r.totalIncome > 0)
                                        .sort((a, b) => b.totalIncome - a.totalIncome)
                                        .slice(0, 10)
                                        .map((user, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-golden-100 flex items-center justify-center text-golden-600 font-bold text-sm">
                                                        {idx + 1}
                                                    </div>
                                                    <span className="font-mono text-sm">{user.userId}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-green-600">${user.totalIncome.toFixed(2)}</p>
                                                    <p className="text-xs text-gray-500">{user.incomeCount} types</p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default IncomeProcessing;
