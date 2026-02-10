import React from 'react';
import { motion } from 'framer-motion';
import { Send, Instagram, Facebook, Twitter, Youtube, ExternalLink } from 'lucide-react';

const SocialMediaLinks = () => {
    const socialLinks = [
        {
            name: 'TELEGRAM CHANNEL',
            icon: Send,
            url: 'https://t.me/your_channel', // Replace with actual link
            color: 'from-blue-400 to-blue-600',
            bgColor: 'bg-blue-200',
            iconColor: 'text-blue-600'
        },
        {
            name: 'INSTAGRAM PAGE',
            icon: Instagram,
            url: 'https://instagram.com/your_page', // Replace with actual link
            color: 'from-pink-400 to-purple-600',
            bgColor: 'bg-pink-200',
            iconColor: 'text-pink-600'
        },
        {
            name: 'FACEBOOK PAGE',
            icon: Facebook,
            url: 'https://facebook.com/your_page', // Replace with actual link
            color: 'from-blue-500 to-blue-700',
            bgColor: 'bg-blue-200',
            iconColor: 'text-blue-700'
        },
        {
            name: 'TWITTER PAGE',
            icon: Twitter,
            url: 'https://twitter.com/your_page', // Replace with actual link
            color: 'from-sky-400 to-sky-600',
            bgColor: 'bg-sky-200',
            iconColor: 'text-sky-600'
        },
        {
            name: 'YOUTUBE CHANNEL',
            icon: Youtube,
            url: 'https://youtube.com/@your_channel', // Replace with actual link
            color: 'from-red-500 to-red-700',
            bgColor: 'bg-red-200',
            iconColor: 'text-red-600'
        }
    ];

    const handleConnect = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3">
                <h2 className="text-lg font-bold text-white">ALL SOCIAL MEDIA LINKS</h2>
            </div>

            {/* Grid Layout */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {socialLinks.map((social, index) => (
                    <motion.div
                        key={social.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                    >
                        <div className="bg-white border-2 border-gray-400 shadow-lg shadow-gray-400 rounded-xl p-4 hover:border-gray-400 hover:shadow-md transition-all duration-300">
                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-lg ${social.bgColor} flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform`}>
                                <social.icon className={`w-6 h-6 ${social.iconColor}`} />
                            </div>

                            {/* Name */}
                            <h3 className="text-xs font-bold text-gray-800 text-center mb-3 leading-tight">
                                {social.name}
                            </h3>

                            {/* Button */}
                            <button
                                onClick={() => handleConnect(social.url)}
                                className={`w-full px-3 py-2 bg-gradient-to-r ${social.color} text-white rounded-lg font-bold text-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-1.5`}
                            >
                                CONNECT
                                <ExternalLink size={12} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                    Stay connected with us on social media for updates and announcements
                </p>
            </div>
        </motion.div>
    );
};

export default SocialMediaLinks;
