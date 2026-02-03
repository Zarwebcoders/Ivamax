import { motion } from 'framer-motion';

const TreeNode = ({ node, onExpand }) => {
    if (node.empty) {
        return (
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 mb-2">
                    <span className="text-gray-300 text-xl">+</span>
                </div>
                <p className="text-xs text-text-tertiary">Empty</p>
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

    return (
        <div className="flex flex-col items-center z-10 relative">
            <motion.div
                whileHover={{ scale: 1.05 }}
                className={`w-32 p-3 rounded-xl border-2 ${getRankColor(node.rank)} bg-white shadow-lg cursor-pointer flex flex-col items-center`}
                onClick={() => onExpand && onExpand(node.userId)}
            >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${getRankColor(node.rank)} ring-2 ring-white`}>
                    {node.fullName.charAt(0)}
                </div>
                <p className="text-xs font-bold text-gray-800 truncate w-full text-center">{node.fullName}</p>
                <p className="text-[10px] text-gray-500">{node.userId}</p>

                <div className="flex justify-between w-full mt-2 pt-2 border-t border-gray-100 text-[10px]">
                    <div className="text-center">
                        <span className="block font-bold text-gray-700">{node.totalLeft || 0}</span>
                        <span className="text-gray-400">L</span>
                    </div>
                    <div className="text-center border-l border-gray-100 pl-2">
                        <span className="block font-bold text-gray-700">{node.totalRight || 0}</span>
                        <span className="text-gray-400">R</span>
                    </div>
                </div>
            </motion.div>

            {/* Connector line for children would go here ideally, but simplified logic handled in TreeView */}
        </div>
    );
};

export default TreeNode;
