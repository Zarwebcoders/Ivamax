import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Megaphone, Sparkles, X } from 'lucide-react';
import { announcementService } from '../services/announcement.service';

const NewsTicker = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    useEffect(() => {
        if (announcements.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % announcements.length);
            }, 5000); // Change every 5 seconds

            return () => clearInterval(interval);
        }
    }, [announcements.length]);

    const fetchAnnouncements = async () => {
        try {
            const response = await announcementService.getActiveAnnouncements();
            if (response.success && response.data.length > 0) {
                setAnnouncements(response.data);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    };

    const getTypeConfig = (type) => {
        const configs = {
            news: {
                icon: Bell,
                gradient: 'from-blue-500 to-cyan-500',
                bg: 'from-blue-50 to-cyan-50',
                text: 'text-blue-700',
                label: 'NEWS'
            },
            announcement: {
                icon: Megaphone,
                gradient: 'from-purple-500 to-pink-500',
                bg: 'from-purple-50 to-pink-50',
                text: 'text-purple-700',
                label: 'ANNOUNCEMENT'
            },
            update: {
                icon: Sparkles,
                gradient: 'from-green-500 to-emerald-500',
                bg: 'from-green-50 to-emerald-50',
                text: 'text-green-700',
                label: 'UPDATE'
            }
        };
        return configs[type] || configs.announcement;
    };

    if (!isVisible || announcements.length === 0) return null;

    const current = announcements[currentIndex];
    const config = getTypeConfig(current.type);
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative bg-gradient-to-r ${config.bg} border-2 border-gray-200 rounded-xl overflow-hidden shadow-md`}
        >
            <div className="flex items-center gap-3 px-4 py-3">
                {/* Icon Section */}
                <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br ${config.gradient} rounded-lg flex items-center justify-center shadow-lg`}>
                    <Icon className="text-white" size={20} />
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold ${config.text} uppercase tracking-wider`}>
                            {config.label}
                        </span>
                        {announcements.length > 1 && (
                            <span className="text-xs text-gray-400">
                                {currentIndex + 1}/{announcements.length}
                            </span>
                        )}
                    </div>

                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <h4 className="text-sm font-bold text-gray-800 truncate">
                            {current.title}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-1">
                            {current.message}
                        </p>
                    </motion.div>
                </div>

                {/* Close Button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                    <X size={14} className="text-gray-500" />
                </button>
            </div>

            {/* Progress Bar */}
            {announcements.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                    <motion.div
                        key={currentIndex}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 5, ease: 'linear' }}
                        className={`h-full bg-gradient-to-r ${config.gradient}`}
                    />
                </div>
            )}
        </motion.div>
    );
};

export default NewsTicker;
