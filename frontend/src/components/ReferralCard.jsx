import { useState, useEffect } from 'react';
import { Users, Copy, MessageCircle, Send, Check, Smartphone, ExternalLink, ArrowRightLeft } from 'lucide-react';

const ReferralCard = ({ user, stats = {}, isMobile = false, onFlip }) => {
    const [activeRefTab, setActiveRefTab] = useState('left');

    // Manage tab state based on filled status
    useEffect(() => {
        if (stats.isLeftDirectFilled && activeRefTab === 'left') {
            setActiveRefTab('placing-right');
        } else if (stats.isRightDirectFilled && activeRefTab === 'right') {
            setActiveRefTab('placing-right');
        }
    }, [stats, activeRefTab]);

    return (
        <div className="bg-white rounded-3xl p-5 md:p-8 shadow-xl overflow-hidden relative h-full flex flex-col w-full">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full flex-grow">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-2xl">
                            <Users className="text-amber-500" size={28} />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-black text-gray-900">Referral Center</h1>
                            <p className="text-gray-500 font-medium text-sm md:text-base">Manage and grow your network</p>
                        </div>
                    </div>
                    {onFlip && (
                        <button
                            onClick={onFlip}
                            className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <span className="text-xs font-bold uppercase hidden md:inline">Business Overview</span>
                            <ArrowRightLeft size={18} />
                        </button>
                    )}
                </div>

                <div className="flex-grow flex flex-col justify-center w-full mx-auto">
                    {/* Prominent User ID */}
                    <div className="text-center mb-6 md:mb-10">
                        <span className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest">Your Referral ID</span>
                        <div className="text-3xl md:text-3xl font-black text-amber-500 tracking-tight mt-2 flex items-center justify-center gap-4 ts">
                            {user?.userId}
                            <CopyButton link={user?.userId} simple={true} />
                        </div>
                    </div>

                    {/* Placement Controls */}
                    <div className="flex items-center justify-center gap-3 md:gap-8 mb-6 md:mb-12">
                        {/* Left Side */}
                        <div className="flex flex-col items-center gap-2 md:gap-3">
                            <div className="relative">
                                <span className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider">Left Link</span>
                                {stats.isLeftDirectFilled && (
                                    <span className="absolute -top-4 -right-8 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm">Filled</span>
                                )}
                            </div>
                            <button
                                onClick={() => setActiveRefTab('placing-left')}
                                className={`px-3 md:px-8 py-2 md:py-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wide transition-all shadow-md w-28 md:w-40 ${activeRefTab === 'placing-left'
                                    ? 'bg-amber-500 text-white shadow-amber-500/30 ring-4 ring-amber-500/20 transform scale-105'
                                    : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                Placing Left
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-16 bg-gray-200 hidden md:block"></div>

                        {/* Right Side */}
                        <div className="flex flex-col items-center gap-2 md:gap-3">
                            <div className="relative">
                                <span className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider">Right Link</span>
                                {stats.isRightDirectFilled && (
                                    <span className="absolute -top-4 -right-8 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm">Filled</span>
                                )}
                            </div>
                            <button
                                onClick={() => setActiveRefTab('placing-right')}
                                className={`px-3 md:px-8 py-2 md:py-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wide transition-all shadow-md w-28 md:w-40 ${activeRefTab === 'placing-right'
                                    ? 'bg-amber-500 text-white shadow-amber-500/30 ring-4 ring-amber-500/20 transform scale-105'
                                    : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                Placing Right
                            </button>
                        </div>
                    </div>

                    {/* Link & Socials */}
                    <div className="space-y-1 md:space-y-6">
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-2 md:p-2 flex items-center gap-2 shadow-inner">
                            <input
                                type="text"
                                readOnly
                                value={`${window.location.origin}/register?ref=${user?.userId}&position=${activeRefTab === 'placing-left' ? 'left' : 'right'}`}
                                className="bg-transparent flex-1 text-xs md:text-base font-medium text-gray-700 outline-none min-w-0 px-2 font-mono"
                            />
                            <CopyButton link={`${window.location.origin}/register?ref=${user?.userId}&position=${activeRefTab === 'placing-left' ? 'left' : 'right'}`} />
                        </div>

                        {isMobile && (
                            <a
                                href="/referral-center"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full text-center bg-blue-50 text-blue-600 py-3 rounded-xl font-bold uppercase text-xs shadow-sm flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                            >
                                <ExternalLink size={16} /> Referral Center
                            </a>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                            <button className="bg-[#25D366] text-white py-3 rounded-xl font-bold uppercase text-xs md:text-sm shadow-md hover:shadow-lg hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 active:scale-95 group">
                                <MessageCircle size={18} className="group-hover:rotate-12 transition-transform" /> <span className="hidden md:inline">Share via</span> WhatsApp
                            </button>
                            <button className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white py-3 rounded-xl font-bold uppercase text-xs md:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 group">
                                <Smartphone size={18} className="group-hover:rotate-12 transition-transform" /> Instagram <span className="hidden md:inline">Direct</span>
                            </button>
                            <button className="bg-[#0088cc] text-white py-3 rounded-xl font-bold uppercase text-xs md:text-sm shadow-md hover:shadow-lg hover:bg-[#0077b5] transition-all flex items-center justify-center gap-2 active:scale-95 group">
                                <Send size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /> <span className="hidden md:inline">Send on</span> Telegram
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CopyButton = ({ link, simple = false }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (simple) {
        return (
            <button
                onClick={handleCopy}
                className="text-gray-400 hover:text-amber-500 transition-colors"
            >
                {copied ? <Check size={24} className="text-green-500" /> : <Copy size={24} />}
            </button>
        )
    }

    return (
        <button
            onClick={handleCopy}
            className="bg-gray-900 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl text-xs md:text-sm font-bold uppercase hover:bg-black transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95 shrink-0"
        >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>
    );
};

export default ReferralCard;
