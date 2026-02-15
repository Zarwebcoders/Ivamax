import { useState, useEffect } from 'react';
import { Users, Copy, MessageCircle, Send, Check, Smartphone, ExternalLink, ArrowRightLeft, Instagram } from 'lucide-react';

const ReferralCard = ({ user, stats = {}, isMobile = false, onFlip }) => {
    const [activeRefTab, setActiveRefTab] = useState('placing-left');

    const isCurrentTabFilled = (activeRefTab === 'left' && stats.isLeftDirectFilled) || (activeRefTab === 'right' && stats.isRightDirectFilled);

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
                            <button
                                onClick={() => !stats.isLeftDirectFilled && setActiveRefTab('left')}
                                disabled={stats.isLeftDirectFilled}
                                className={`px-3 md:px-8 py-2 md:py-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wide transition-all shadow-md w-28 md:w-40 relative ${stats.isLeftDirectFilled
                                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-75'
                                    : activeRefTab === 'left'
                                        ? 'bg-amber-500 text-white shadow-amber-500/30 ring-4 ring-amber-500/20 transform scale-105'
                                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                {stats.isLeftDirectFilled ? 'Filled' : 'Left Link'}
                            </button>
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
                        <div className="w-px h-24 bg-gray-200 hidden md:block"></div>

                        {/* Right Side */}
                        <div className="flex flex-col items-center gap-3">
                            <button
                                onClick={() => !stats.isRightDirectFilled && setActiveRefTab('right')}
                                disabled={stats.isRightDirectFilled}
                                className={`px-3 md:px-8 py-2 md:py-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wide transition-all shadow-md w-28 md:w-40 relative ${stats.isRightDirectFilled
                                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-75'
                                    : activeRefTab === 'right'
                                        ? 'bg-amber-500 text-white shadow-amber-500/30 ring-4 ring-amber-500/20 transform scale-105'
                                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                {stats.isRightDirectFilled ? 'Filled' : 'Right Link'}
                            </button>
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

                    {/* Link Display & Sharing */}
                    {isCurrentTabFilled ? (
                        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 md:p-12 text-center animate-in fade-in zoom-in duration-300">
                            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="text-red-600" size={32} />
                            </div>
                            <h4 className="text-xl font-black text-red-700 mb-2 uppercase">This Position is Filled</h4>
                            <p className="text-red-500 font-medium text-sm">Please select a "Placing" link or the other side to continue growing your network.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-gray-50 border border-gray-200 rounded-[28px] p-2.5 md:p-3 flex items-center gap-3 shadow-inner group transition-all focus-within:ring-2 focus-within:ring-amber-500/20">
                                <div className="p-2 md:p-3 bg-white rounded-2xl text-amber-500 shadow-sm">
                                    <Users size={20} />
                                </div>
                                <input
                                    type="text"
                                    readOnly
                                    value={`${window.location.origin}/register?ref=${user?.userId}&position=${activeRefTab}`}
                                    className="bg-transparent flex-1 text-xs md:text-base font-medium text-gray-700 outline-none min-w-0 px-2 font-mono"
                                />
                                <button
                                    onClick={() => {
                                        const link = `${window.location.origin}/register?ref=${user?.userId}&position=${activeRefTab}`;
                                        navigator.clipboard.writeText(link);
                                        // Assuming toast is available globally or imported elsewhere
                                        if (typeof toast !== 'undefined') {
                                            toast.success('Link copied!');
                                        } else {
                                            alert('Link copied!');
                                        }
                                    }}
                                    className="bg-gray-900 text-white px-5 md:px-8 py-3 md:py-4 rounded-[20px] text-xs font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg active:scale-95 shrink-0"
                                >
                                    <Copy size={18} />
                                    <span className="hidden sm:inline">Copy Link</span>
                                </button>
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => {
                                        const link = `${window.location.origin}/register?ref=${user?.userId}&position=${activeRefTab}`;
                                        const text = `Join IVAMAX and start your journey today! Use my referral link: ${link}`;
                                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                    }}
                                    className="bg-[#25D366] text-white py-4 rounded-[24px] font-black uppercase text-xs md:text-sm shadow-lg shadow-[#25D366]/20 hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-3 active:scale-95 group"
                                >
                                    <MessageCircle size={22} className="group-hover:rotate-12 transition-transform" /> Share via WhatsApp
                                </button>
                                <button
                                    onClick={() => {
                                        const link = `${window.location.origin}/register?ref=${user?.userId}&position=${activeRefTab}`;
                                        // Fallback to Instagram App open or just copy
                                        alert("Share functionality opened. If Instagram isn't installed, please copy the link.");
                                        window.open(`https://www.instagram.com/`, '_blank');
                                    }}
                                    className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white py-4 rounded-[24px] font-black uppercase text-xs md:text-sm shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                                >
                                    <Instagram size={22} className="group-hover:rotate-12 transition-transform" /> Instagram Direct
                                </button>
                                <button
                                    onClick={() => {
                                        const link = `${window.location.origin}/register?ref=${user?.userId}&position=${activeRefTab}`;
                                        const text = `Join IVAMAX and start your journey today!`;
                                        window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`, '_blank');
                                    }}
                                    className="bg-[#0088cc] text-white py-4 rounded-[24px] font-black uppercase text-xs md:text-sm shadow-lg shadow-[#0088cc]/20 hover:bg-[#0077b5] transition-all flex items-center justify-center gap-3 active:scale-95 group"
                                >
                                    <Send size={22} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /> Send on Telegram
                                </button>
                            </div>
                        </div>
                    )}
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
