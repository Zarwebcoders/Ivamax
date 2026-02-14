import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const WalletAddress = ({ address }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!address) return <span className="text-gray-400">N/A</span>;

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(address);
        setCopied(true);
        toast.success('Address copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="flex items-center gap-2">
            <span
                onClick={toggleExpand}
                className="font-mono text-sm text-gray-700 cursor-pointer hover:text-golden-600 transition-colors"
                title="Click to expand/collapse"
            >
                {isExpanded ? address : `${address.substring(0, 12)}...${address.substring(address.length - 6)}`}
            </span>
            <button
                onClick={handleCopy}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-golden-600"
                title="Copy address"
            >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
        </div>
    );
};

export default WalletAddress;
