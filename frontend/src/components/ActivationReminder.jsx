import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiAlertCircle, FiX, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ActivationReminder = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);

    // Get the exact deadline (EndOfNextDay)
    const getDeadline = (registrationDate) => {
        if (!registrationDate) return new Date(0);
        const regDate = new Date(registrationDate);
        const nextDay = new Date(regDate);
        nextDay.setDate(regDate.getDate() + 1);
        nextDay.setHours(23, 59, 59, 999);
        return nextDay;
    };

    useEffect(() => {
        // Only proceed if user is logged in, NOT active, and has a registration date
        if (!user || user.isActive || !user.createdAt) {
            setIsVisible(false);
            return;
        }

        const deadline = getDeadline(user.createdAt);
        const now = new Date();

        // If deadline passed, the scheduler will delete them soon. We can still show urgent msg.
        // But for logic, let's focus on active countdowns
        const checkVisibility = () => {
            const lastDismissedStr = localStorage.getItem(`activation_dismissed_${user.userId}`);
            let shouldShow = true;

            if (lastDismissedStr) {
                const lastDismissed = new Date(lastDismissedStr);
                const hoursSinceDismissed = (now - lastDismissed) / (1000 * 60 * 60);
                const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);

                // Normal interval: 6 hours. Urgent interval (< 12h left): 2 hours.
                if (hoursUntilDeadline <= 12) {
                    setIsUrgent(true);
                    shouldShow = hoursSinceDismissed >= 2;
                } else {
                    setIsUrgent(false);
                    shouldShow = hoursSinceDismissed >= 6;
                }
            }

            if (shouldShow && now <= deadline) {
                // Little delay so it doesn't pop up instantly on page load
                const timer = setTimeout(() => {
                    setIsVisible(true);
                }, 1500);
                return () => clearTimeout(timer);
            }
        };

        checkVisibility();

        // Setup Countdown Timer
        const updateTimer = () => {
            const currentTime = new Date();
            const difference = deadline - currentTime;

            if (difference > 0) {
                const hours = Math.floor((difference / (1000 * 60 * 60)));
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);

                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);

                if (hours < 12) setIsUrgent(true);
            } else {
                setTimeLeft('Time Expired');
            }
        };

        let timerInterval;
        if (isVisible || !localStorage.getItem(`activation_dismissed_${user.userId}`)) {
            updateTimer();
            timerInterval = setInterval(updateTimer, 1000);
        }

        return () => clearInterval(timerInterval);

    }, [user]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem(`activation_dismissed_${user?.userId}`, new Date().toISOString());
    };

    const handleActivate = () => {
        setIsVisible(false);
        navigate('/packages');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 50 }}
                    transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
                    className="fixed bottom-6 right-6 z-[200] w-[calc(100%-3rem)] md:w-96"
                >
                    <div className={`p-6 rounded-3xl border-2 shadow-2xl backdrop-blur-xl ${isUrgent
                            ? 'bg-red-50/95 border-red-500 shadow-red-500/30'
                            : 'bg-white/95 border-golden-400 shadow-golden-500/20'
                        }`}>
                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isUrgent ? 'text-red-400 hover:bg-red-100 hover:text-red-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                }`}
                        >
                            <FiX size={20} />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-2xl flex-shrink-0 ${isUrgent ? 'bg-red-100 text-red-600' : 'bg-golden-100 text-golden-600'
                                }`}>
                                <FiAlertCircle size={28} className={isUrgent ? 'animate-pulse' : ''} />
                            </div>

                            <div className="flex-1 pr-6">
                                <h3 className={`text-lg font-bold mb-1 ${isUrgent ? 'text-red-700' : 'text-gray-900'
                                    }`}>
                                    Account Activation Required
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                    Your account is currently <span className="font-semibold text-gray-800">inactive</span>.
                                    Please activate a package to start earning and secure your position in the tree.
                                </p>

                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl mb-5 font-mono text-lg font-bold justify-center border ${isUrgent
                                        ? 'bg-white text-red-600 border-red-200'
                                        : 'bg-gray-900 text-golden-400 border-gray-800'
                                    }`}>
                                    <FiClock />
                                    <span>{timeLeft}</span>
                                </div>

                                <div className="space-y-2">
                                    <button
                                        onClick={handleActivate}
                                        className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-transform hover:-translate-y-0.5 shadow-lg ${isUrgent
                                                ? 'bg-red-600 text-white shadow-red-600/30 hover:bg-red-700'
                                                : 'bg-gradient-to-r from-golden-500 to-golden-600 text-white shadow-golden-500/30'
                                            }`}
                                    >
                                        Activate Now
                                        <FiArrowRight />
                                    </button>
                                    <button
                                        onClick={handleDismiss}
                                        className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${isUrgent ? 'text-red-600 hover:bg-red-100' : 'text-gray-500 hover:bg-gray-100'
                                            }`}
                                    >
                                        Remind me later
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ActivationReminder;
