import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Globe, Zap, Sparkles } from 'lucide-react';

const ComingSoon = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-[#FFFEF9] text-[#1A1A1A] flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden font-['Oswald']">
            {/* Soft Ambient Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-amber-500/50 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-500/50 blur-[120px] rounded-full" />
            
            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl w-full z-10 text-center space-y-16"
            >
                {/* Logo & Brand */}
                <motion.div variants={itemVariants} className="flex flex-col items-center gap-6">
                    <motion.div 
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-[2rem] flex items-center justify-center shadow-xl mb-4 relative"
                    >
                        <Zap size={48} className="text-white fill-current" />
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-2 border-2 border-dashed border-amber-300 rounded-[2.2rem] opacity-50" 
                        />
                    </motion.div>
                    <div className="space-y-2">
                        <h1 className="text-8xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-500 via-orange-600 to-amber-700">
                            IVAMAX
                        </h1>
                        <p className="text-amber-600/80 text-xl uppercase tracking-[0.6em] font-light">
                            Next Generation Ecosystem
                        </p>
                    </div>
                </motion.div>

                {/* Main "Coming Soon" Display */}
                <motion.div variants={itemVariants} className="relative py-2 px-4">
                    <div className="inline-block relative">
                        <motion.div 
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="absolute -top-4 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                        />
                        <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tight text-gray-800 flex items-center justify-center gap-4">
                            <Sparkles className="text-amber-500 hidden md:block" />
                            Launching Soon
                            <Sparkles className="text-amber-500 hidden md:block" />
                        </h2>
                        <motion.div 
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="absolute -bottom-4 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                        />
                    </div>
                    <p className="mt-8 text-gray-500 max-w-2xl mx-auto text-xl font-light leading-relaxed">
                        We're currently perfecting a revolutionary digital architecture. 
                        A new standard of excellence is about to be unveiled.
                    </p>
                </motion.div>

                {/* Trust Badges */}
                <motion.div variants={itemVariants} className="space-y-2">
                    <div className="flex flex-wrap justify-center gap-12 text-amber-900/60 font-medium tracking-wide">
                        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full border border-amber-100 shadow-sm transition-all hover:shadow-md hover:border-amber-200 group">
                            <ShieldCheck size={22} className="text-amber-500 group-hover:scale-110 transition-transform" /> 
                            <span className="uppercase text-sm">Military-Grade Security</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full border border-amber-100 shadow-sm transition-all hover:shadow-md hover:border-amber-200 group">
                            <Globe size={22} className="text-amber-500 group-hover:scale-110 transition-transform" /> 
                            <span className="uppercase text-sm">Global Scale Trading</span>
                        </div>
                    </div>

                    <div className="border-t border-amber-100 max-w-xs mx-auto pt-8">
                        <p className="text-amber-800/40 text-sm font-medium uppercase tracking-[0.2em]">
                            Excellence in Innovation
                        </p>
                        <p className="text-gray-400 text-xs mt-4">
                            &copy; 2026 IVAMAX. All Rights Reserved.
                        </p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Decorative Side Elements */}
            <div className="fixed left-0 top-1/2 -translate-y-1/2 h-32 w-1 bg-gradient-to-b from-transparent via-amber-400/30 to-transparent hidden lg:block" />
            <div className="fixed right-0 top-1/2 -translate-y-1/2 h-32 w-1 bg-gradient-to-b from-transparent via-orange-400/30 to-transparent hidden lg:block" />
        </div>
    );
};

export default ComingSoon;
