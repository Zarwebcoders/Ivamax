import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Headphones, Mail, Phone, MessageCircle, HelpCircle, Clock, Send, AlertCircle, CheckCircle, Loader, FileText, Lock, User, Zap, AlertTriangle, Download, Video, Image } from 'lucide-react';
import SocialMediaLinks from '../components/SocialMediaLinks';
import { supportService } from '../services/support.service';
import toast from 'react-hot-toast';

const Support = () => {
    const [formData, setFormData] = useState({
        type: '',
        subject: '',
        priority: 'medium',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(true);

    const typeOptions = [
        { value: 'inquiry', label: 'Inquiry', color: 'blue' },
        { value: 'complaint', label: 'Complaint', color: 'red' },
        { value: 'support', label: 'Support', color: 'green' },
        { value: 'other', label: 'Other', color: 'yellow' }
    ];

    const subjectOptions = [
        { value: 'access', label: 'Access Issues' },
        { value: 'password', label: 'Password Reset' },
        { value: 'account_change', label: 'Account Changes' },
        { value: 'technical', label: 'Technical Support' },
        { value: 'general', label: 'General Inquiry' },
        { value: 'other', label: 'Other' }
    ];

    const priorityOptions = [
        { value: 'high', label: 'High', color: 'red' },
        { value: 'medium', label: 'Medium', color: 'yellow' },
        { value: 'low', label: 'Low', color: 'green' }
    ];

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await supportService.getUserTickets({ limit: 10 });
            setTickets(response.data || []);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoadingTickets(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.type || !formData.subject || !formData.priority || !formData.message) {
            toast.error('All fields are required');
            return;
        }

        if (formData.message.length < 10) {
            toast.error('Message must be at least 10 characters');
            return;
        }

        if (formData.message.length > 1000) {
            toast.error('Message must not exceed 1000 characters');
            return;
        }

        setLoading(true);
        try {
            const response = await supportService.createTicket(formData);
            toast.success(`Ticket ${response.data.ticketId} created successfully!`);

            // Reset form
            setFormData({
                type: '',
                subject: '',
                priority: 'medium',
                message: ''
            });

            // Refresh tickets
            fetchTickets();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            open: 'bg-blue-100 text-blue-700',
            in_progress: 'bg-yellow-100 text-yellow-700',
            resolved: 'bg-green-100 text-green-700',
            closed: 'bg-gray-100 text-gray-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: 'bg-red-100 text-red-700',
            medium: 'bg-yellow-100 text-yellow-700',
            low: 'bg-green-100 text-green-700'
        };
        return colors[priority] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-5 text-white"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Headphones size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Support Center</h1>
                            <p className="text-sm text-blue-100">We're here to help you 24/7</p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 text-xs bg-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                        <Clock size={14} />
                        <span>Response: 48-72 hours</span>
                    </div>
                </div>
            </motion.div>

            {/* Quick Contact Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
                {/* Inquiry Button */}
                <motion.a
                    href="mailto:inquiry@ivamax.com"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-md hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 border border-blue-400"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                            <HelpCircle size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold mb-0.5">Inquiry</h3>
                            <p className="text-xs text-blue-100 flex items-center gap-1">
                                <Mail size={12} />
                                inquiry@ivamax.com
                            </p>
                        </div>
                    </div>
                </motion.a>

                {/* Support Button */}
                <motion.a
                    href="mailto:support@ivamax.com"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white shadow-md hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 border border-green-400"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                            <Headphones size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold mb-0.5">Support</h3>
                            <p className="text-xs text-green-100 flex items-center gap-1">
                                <Mail size={12} />
                                support@ivamax.com
                            </p>
                        </div>
                    </div>
                </motion.a>

                {/* Complaint Button */}
                <motion.a
                    href="mailto:complaint@ivamax.com"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white shadow-md hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 border border-red-400"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                            <AlertCircle size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold mb-0.5">Complaint</h3>
                            <p className="text-xs text-red-100 flex items-center gap-1">
                                <Mail size={12} />
                                complaint@ivamax.com
                            </p>
                        </div>
                    </div>
                </motion.a>
            </motion.div>

            {/* Ticket Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-200 p-8"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                        <FileText className="text-white" size={20} />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create Support Ticket</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Type Selection */}
                    <div className="group">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                            <Mail size={16} className="text-blue-600" />
                            Ticket Type <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl appearance-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all cursor-pointer hover:border-blue-400 font-medium text-gray-700"
                                required
                            >
                                <option value="" disabled>Select Ticket Type</option>
                                {typeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Subject Selection */}
                    <div className="group">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                            <HelpCircle size={16} className="text-purple-600" />
                            Subject <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl appearance-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all cursor-pointer hover:border-purple-400 font-medium text-gray-700"
                                required
                            >
                                <option value="" disabled>Select Subject</option>
                                {subjectOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Priority Selection */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                            <Zap size={16} className="text-orange-600" />
                            Priority <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {priorityOptions.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority: option.value })}
                                    className={`relative px-4 py-3.5 rounded-xl font-bold text-sm transition-all border-2 overflow-hidden group ${formData.priority === option.value
                                        ? option.value === 'high'
                                            ? 'border-red-500 bg-red-50 text-red-700 shadow-lg shadow-red-200'
                                            : option.value === 'medium'
                                                ? 'border-yellow-500 bg-yellow-50 text-yellow-700 shadow-lg shadow-yellow-200'
                                                : 'border-green-500 bg-green-50 text-green-700 shadow-lg shadow-green-200'
                                        : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        {option.value === 'high' && <AlertTriangle size={16} />}
                                        {option.value === 'medium' && <AlertCircle size={16} />}
                                        {option.value === 'low' && <CheckCircle size={16} />}
                                        {option.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                            <MessageCircle size={16} className="text-green-600" />
                            Message <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="6"
                                placeholder="Describe your issue in detail..."
                                className="w-full px-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all resize-none shadow-sm hover:border-green-400"
                                required
                                minLength={10}
                                maxLength={1000}
                            />
                            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                                <span className={`text-xs font-medium ${formData.message.length > 1000
                                    ? 'text-red-500'
                                    : formData.message.length > 800
                                        ? 'text-orange-500'
                                        : 'text-gray-500'
                                    }`}>
                                    {formData.message.length}/1000
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <AlertCircle size={12} />
                            Minimum 10 characters required
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="relative w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <Loader className="animate-spin" size={22} />
                                    Submitting Ticket...
                                </>
                            ) : (
                                <>
                                    <Send size={22} />
                                    Submit Ticket
                                </>
                            )}
                        </div>
                    </button>
                </form>
            </motion.div>

            {/* Ticket History */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg border-2 border-gray-300 p-6"
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Tickets</h2>

                {loadingTickets ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader className="animate-spin text-blue-600" size={32} />
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No tickets found. Create your first ticket above!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket._id}
                                className="border-2 border-gray-200 rounded-xl p-4 hover:border-gray-400 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">
                                            {ticket.ticketId}
                                        </h3>
                                        <p className="text-sm text-gray-600 capitalize">
                                            {ticket.type} - {ticket.subject.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(ticket.status)}`}>
                                            {ticket.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                                    {ticket.message}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                    {ticket.resolvedAt && (
                                        <span className="flex items-center gap-1 text-green-600">
                                            <CheckCircle size={14} />
                                            Resolved: {new Date(ticket.resolvedAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Plan Material Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl border-2 border-purple-200 p-8"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <FileText className="text-white" size={20} />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Plan Material</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* PDF Download */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-xl p-6 border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all"
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                                <Download className="text-white" size={28} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Plan in PDF</h3>
                                <p className="text-sm text-gray-600 mb-4">Download complete business plan documentation</p>
                            </div>
                            <button className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-lg font-bold hover:shadow-lg hover:shadow-red-300 transition-all duration-300 flex items-center justify-center gap-2">
                                <Download size={18} />
                                Download PDF
                            </button>
                        </div>
                    </motion.div>

                    {/* YouTube Video */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-xl p-6 border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all"
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center">
                                <Video className="text-white" size={28} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Plan in Video</h3>
                                <p className="text-sm text-gray-600 mb-4">Watch detailed video explanation</p>
                            </div>
                            <button
                                onClick={() => window.open('https://youtube.com', '_blank')}
                                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg font-bold hover:shadow-lg hover:shadow-red-300 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <Video size={18} />
                                Watch Video
                            </button>
                        </div>
                    </motion.div>

                    {/* Marketing Banner */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-xl p-6 border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all"
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                                <Image className="text-white" size={28} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Marketing Banner</h3>
                                <p className="text-sm text-gray-600 mb-4">Download promotional materials</p>
                            </div>
                            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-bold hover:shadow-lg hover:shadow-purple-300 transition-all duration-300 flex items-center justify-center gap-2">
                                <Download size={18} />
                                Get Banner
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Info Note */}
                <div className="mt-6 bg-purple-100 border-2 border-purple-300 rounded-xl p-4">
                    <p className="text-sm text-purple-800 flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <span>These materials are designed to help you understand and promote IVAMAX effectively. Use them for personal reference and marketing purposes.</span>
                    </p>
                </div>
            </motion.div>

            {/* Social Media Links */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h2 className="text-xl font-bold text-gray-800 mb-4">Connect With Us</h2>
                <SocialMediaLinks />
            </motion.div>

            {/* Quick Tips */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6"
            >
                <h3 className="text-lg font-bold text-gray-800 mb-3">💡 Quick Tips</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>Check your spam folder if you don't receive our email response</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>Have your User ID ready when contacting support</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>Browse our Help Center for instant answers to common questions</span>
                    </li>
                </ul>
            </motion.div>
        </div>
    );
};

export default Support;
