import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

const TreeNode = ({ node, onExpand, isHighlighted }) => {
    const nodeRef = useRef(null);

    useEffect(() => {
        if (isHighlighted && nodeRef.current) {
            nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [isHighlighted]);

    if (node.empty) {
        return (
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border border-dashed border-black/30 flex items-center justify-center bg-gray-100 mb-1 shadow-sm">
                    <span className="text-black text-sm text-opacity-50">+</span>
                </div>
                <p className="text-[9px] text-gray-400">Empty</p>
            </div>
        );
    }

    const getRankColor = (rank) => {
        switch (rank?.toLowerCase()) {
            case 'admin': return 'bg-purple-100 text-purple-600 border-purple-200';
            case 'diamond': return 'bg-blue-100 text-blue-600 border-blue-200';
            case 'gold': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
            case 'silver': return 'bg-gray-100 text-gray-600 border-gray-200';
            default: return 'bg-golden-50 text-golden-600 border-golden-200';
        }
    };

    const isLeft = node.position === 'left';

    return (
        <div className="flex flex-col items-center z-10 relative">
            <motion.div
                ref={nodeRef}
                whileHover={{ scale: 1.05 }}
                animate={isHighlighted ? { scale: 1.15, boxShadow: "0 0 20px rgba(234, 179, 8, 0.6)" } : {}}
                transition={{ duration: 0.3 }}
                className={`w-20 p-1.5 rounded-lg border ${isHighlighted ? 'border-golden-500 ring-2 ring-golden-400 ring-offset-2' : getRankColor(node.rank)} bg-white shadow-md shadow-gray-300 cursor-pointer flex flex-col items-center relative transition-all`}
                onClick={() => onExpand && onExpand(node.userId)}
            >
                {/* Position Badge */}
                <div className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-sm ${isLeft ? 'bg-blue-500' : 'bg-red-500'}`}>
                    {isLeft ? 'L' : 'R'}
                </div>

                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${getRankColor(node.rank)} ring-1 ring-white`}>
                    {node.fullName.charAt(0)}
                </div>

                <p className="text-[9px] font-bold text-gray-800 truncate w-full text-center leading-tight">
                    {node.fullName.split(' ')[0]}
                </p>
                <p className="text-[8px] text-gray-400 truncate w-full text-center scale-90">
                    {node.userId}
                </p>

                <div className="flex justify-between w-full mt-1.5 pt-1 border-t border-gray-100 text-[8px]">
                    <div className="text-center w-1/2 flex flex-col items-center">
                        <span className="font-bold text-gray-800 leading-none">{node.totalLeft || 0}</span>
                        <span className="text-[7px] text-gray-400 scale-90">L</span>
                    </div>
                    <div className="text-center w-1/2 flex flex-col items-center border-l border-gray-100">
                        <span className="font-bold text-gray-800 leading-none">{node.totalRight || 0}</span>
                        <span className="text-[7px] text-gray-400 scale-90">R</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TreeNode;
