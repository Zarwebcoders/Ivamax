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
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-black/30 flex items-center justify-center bg-gray-100 mb-2 shadow-md">
                    <span className="text-black text-2xl text-opacity-50">+</span>
                </div>
                <p className="text-sm text-gray-400">Empty</p>
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
                className={`w-40 p-3 rounded-xl border-2 ${isHighlighted ? 'border-golden-500 ring-4 ring-golden-400 ring-offset-2' : getRankColor(node.rank)} bg-white shadow-lg shadow-gray-300 cursor-pointer flex flex-col items-center relative transition-all`}
                onClick={() => onExpand && onExpand(node.userId)}
            >
                {/* Position Badge */}
                <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-base font-bold text-white shadow-md ${isLeft ? 'bg-blue-500' : 'bg-red-500'}`}>
                    {isLeft ? 'L' : 'R'}
                </div>

                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-2 ${getRankColor(node.rank)} ring-2 ring-white`}>
                    {node.fullName.charAt(0)}
                </div>

                <p className="text-lg font-bold text-gray-800 truncate w-full text-center leading-tight">
                    {node.fullName.split(' ')[0]}
                </p>
                <p className="text-base text-gray-400 truncate w-full text-center">
                    {node.userId}
                </p>
                <p className="text-sm font-bold text-golden-600 w-full text-center mt-1 px-2 whitespace-normal break-words">
                    {node.rank || '0 (Member)'}
                </p>

                <div className="flex justify-between w-full mt-3 pt-2 border-t-2 border-gray-100 text-base">
                    <div className="text-center w-1/2 flex flex-col items-center">
                        <span className="font-bold text-gray-800 leading-none text-lg">{node.totalLeft || 0}</span>
                        <span className="text-sm text-gray-400">L</span>
                    </div>
                    <div className="text-center w-1/2 flex flex-col items-center border-l-2 border-gray-100">
                        <span className="font-bold text-gray-800 leading-none text-lg">{node.totalRight || 0}</span>
                        <span className="text-sm text-gray-400">R</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TreeNode;
