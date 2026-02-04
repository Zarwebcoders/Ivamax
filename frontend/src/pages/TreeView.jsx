import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { treeService } from '../services/tree.service';
import TreeNode from '../components/TreeNode';
import { useAuth } from '../context/AuthContext';

const TreeView = () => {
    const { user } = useAuth();
    const [treeData, setTreeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentRoot, setCurrentRoot] = useState(null);
    const [history, setHistory] = useState([]); // To navigate back up

    useEffect(() => {
        fetchTree(user?.userId);
    }, [user]);

    const fetchTree = async (userId) => {
        setLoading(true);
        try {
            const response = await treeService.getTree(userId);
            if (response.success) {
                setTreeData(response.data);
                setCurrentRoot(response.data.userId); // Track current root for back navigation
            }
        } catch (error) {
            console.error('Error fetching tree:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExpand = (userId) => {
        if (userId && userId !== currentRoot) {
            setHistory(prev => [...prev, currentRoot]);
            fetchTree(userId);
        }
    };

    const handleBack = () => {
        if (history.length > 0) {
            const prevRoot = history[history.length - 1];
            setHistory(prev => prev.slice(0, -1));
            fetchTree(prevRoot);
        }
    };

    // Helper to render tree recursively
    const renderTree = (node) => {
        if (!node) return null;

        return (
            <div className="flex flex-col items-center">
                <TreeNode node={node} onExpand={handleExpand} />

                {node.children && node.children.length > 0 && !node.empty && (
                    <div className="relative flex justify-center mt-8 gap-16">
                        {/* Horizontal Line Connector */}
                        <div className="absolute top-[-2rem] left-1/2 -translate-x-1/2 w-1/2 h-8 border-t-2 border-r-2 border-l-2 border-golden-300 rounded-t-xl z-0 pointer-events-none transform translate-y-4"></div>

                        {/* Vertical Line Connector from Parent */}
                        <div className="absolute top-[-2rem] left-1/2 -translate-x-1/2 h-4 border-l-2 border-golden-300 z-0 pointer-events-none"></div>

                        {node.children.map((child, index) => (
                            <div key={index} className="relative">
                                {/* Vertical Connector to Child */}
                                <div className="absolute top-[-1rem] left-1/2 -translate-x-1/2 h-4 border-l-2 border-golden-300 z-0 pointer-events-none"></div>
                                {renderTree(child)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glass p-6 border-2 border-gray-400 flex justify-between items-center shadow-lg shadow-gray-400"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2">
                        Genealogy Tree
                    </h1>
                    <p className="text-text-tertiary">
                        Visualize your binary network structure
                    </p>
                </div>

                {history.length > 0 && (
                    <button onClick={handleBack} className="btn-secondary">
                        ⬆ Back Up
                    </button>
                )}
            </motion.div>

            <div className="card overflow-auto min-h-[600px] flex justify-center p-12 bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                {treeData ? renderTree(treeData) : (
                    <div className="text-center text-gray-500">Tree data not found</div>
                )}
            </div>
        </div>
    );
};

export default TreeView;
