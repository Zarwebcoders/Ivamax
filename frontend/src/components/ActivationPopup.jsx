import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, ChevronRight, ShieldAlert, X } from 'lucide-react';

const ActivationPopup = ({ deadline, onClose }) => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (!deadline) return;

        const targetDate = new Date(deadline).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                setIsExpired(true);
                setTimeLeft('EXPIRED');
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Format hours to show total remaining hours (could be > 24 if they just joined)
            const totalHours = Math.floor(distance / (1000 * 60 * 60));

            setTimeLeft(`${totalHours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
        };

        updateTimer(); // Initial call
        const timerId = setInterval(updateTimer, 1000);

        return () => clearInterval(timerId);
    }, [deadline]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                {/* Flashing background glow */}
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                    <div className="w-[300px] h-[300px] bg-red-600/20 rounded-full blur-[100px] animate-pulse"></div>
                </div>

                <motion.div
                    initial={{ scale: 0.9, y: 50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 50, opacity: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-red-100"
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
                    >
                        <X size={18} />
                    </button>

                    {/* Header Strip */}
                    <div className="bg-red-600 p-6 flex flex-col items-center justify-center text-white relative overflow-hidden">
                        {/* Diagonal stripes overlay */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)' }}></div>

                        <div className="bg-white/20 p-4 rounded-full mb-3 shadow-inner">
                            <ShieldAlert size={48} className="text-white drop-shadow-md" />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-widest text-center shadow-sm">ID Activation Required</h2>
                    </div>

                    {/* Content */}
                    <div className="p-8 flex flex-col items-center text-center">
                        <p className="text-gray-600 font-medium mb-6">
                            Your account is not activated. In order to keep your position and start earning, you must activate your package before the deadline.
                        </p>

                        {/* Countdown Box */}
                        <div className="w-full bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8 relative overflow-hidden group">
                            {/* Flash effect animation */}
                            <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-white/40 transform -skew-x-[30deg] group-hover:animate-[flash_1.5s_infinite]"></div>

                            <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
                                <Clock size={16} />
                                <span className="font-bold text-xs uppercase tracking-wider">Time Remaining</span>
                            </div>

                            <div className={`text-4xl md:text-5xl font-black tracking-tighter tabular-nums ${isExpired ? 'text-red-700' : 'text-red-500'}`}>
                                {timeLeft || '00h 00m 00s'}
                            </div>

                            {isExpired && (
                                <p className="text-red-700 font-bold text-sm mt-3 animate-pulse uppercase tracking-wide">
                                    Deadline Passed! Activate immediately.
                                </p>
                            )}
                        </div>

                        {/* CTA Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/packages')}
                            className="w-full relative overflow-hidden group bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl py-4 px-6 font-black text-lg uppercase tracking-wider shadow-[0_0_20px_rgba(220,38,38,0.4)] flex justify-center items-center gap-2"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Activate Now <ChevronRight size={20} />
                            </span>
                            {/* Shimmer effect inside button */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                        </motion.button>

                    </div>

                    {/* Bottom strip */}
                    <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                        <AlertTriangle size={14} className="text-gray-400" />
                        Inactive IDs will be permanently removed.
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ActivationPopup;
