import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiAlertTriangle, FiX, FiArrowRight } from 'react-icons/fi';
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

        // Check if user dismissed it in this specific session to avoid annoying them on every click,
        // but it will show up again if they refresh the page.
        const sessionDismissed = sessionStorage.getItem(`activation_dismissed_session_${user.userId}`);

        let shouldShow = !sessionDismissed && now <= deadline;

        if (shouldShow) {
            // Little delay so it doesn't pop up instantly before layout renders
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 800);

            // Cleanup timeout
            return () => clearTimeout(timer);
        }

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
        if (!sessionDismissed && now <= deadline) {
            updateTimer();
            timerInterval = setInterval(updateTimer, 1000);
        }

        return () => clearInterval(timerInterval);

    }, [user]);

    const handleDismiss = () => {
        setIsVisible(false);
        // Save to session storage so it doesn't pop up repeatedly during the same browsing session,
        // but will pop up again if they close the tab or refresh.
        sessionStorage.setItem(`activation_dismissed_session_${user?.userId}`, 'true');
    };

    const handleActivate = () => {
        setIsVisible(false);
        navigate('/packages');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Dark Background Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleDismiss}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 30 }}
                        transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
                        className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                    >
                        {/* Red Header Banner */}
                        <div className="bg-red-600 px-6 py-4 flex items-center justify-center relative">
                            <FiAlertTriangle className="text-white w-6 h-6 absolute left-6 animate-pulse" />
                            <h2 className="text-xl font-black text-white tracking-widest uppercase text-center ml-8">
                                flash pop up
                            </h2>
                            <button
                                onClick={handleDismiss}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-white/80 hover:bg-white/20 transition-colors"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="px-8 py-8 flex flex-col items-center flex-1">
                            <h3 className="text-2xl font-black text-red-600 text-center uppercase mb-6 leading-tight">
                                Notice for ID Activation in Limit Time
                            </h3>

                            <p className="text-gray-700 text-center font-medium mb-6 text-lg">
                                Your account is currently <span className="text-red-600 font-bold uppercase">inactive</span>.
                                <br />Please activate immediately to secure your position.
                            </p>

                            <div className="w-full bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex flex-col items-center justify-center mb-8 relative overflow-hidden">
                                <div className="absolute inset-0 bg-red-100/50 animate-pulse pointer-events-none"></div>
                                <span className="text-red-500 font-bold text-sm tracking-widest uppercase mb-1">Time Remaining</span>
                                <div className="flex items-center gap-3 font-mono text-3xl font-black text-red-700">
                                    <FiClock className={isUrgent ? 'animate-spin-slow' : ''} />
                                    <span>{timeLeft || 'Calculating...'}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleActivate}
                                className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-2xl font-black text-xl uppercase tracking-widest shadow-xl shadow-red-600/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                            >
                                Activate Now
                                <FiArrowRight size={24} />
                            </button>

                            <button
                                onClick={handleDismiss}
                                className="mt-4 text-gray-400 hover:text-gray-600 font-medium text-sm w-fit mx-auto transition-colors"
                            >
                                I understand the risks, remind me later
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ActivationReminder;
