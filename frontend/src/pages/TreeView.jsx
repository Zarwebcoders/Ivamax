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
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const [highlightedUserId, setHighlightedUserId] = useState(null);

    // Debounced Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                try {
                    const response = await treeService.searchUsers(searchQuery);
                    if (response.success) {
                        setSearchResults(response.data);
                    }
                } catch (error) {
                    console.error("Search failed", error);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    useEffect(() => {
        fetchTree(user?.userId);
    }, [user]);

    const fetchTree = async (userId) => {
        setLoading(true);
        try {
            const response = await treeService.getTree(userId);
            if (response.success) {
                setTreeData(response.data);
                // Only update currentRoot if we are authentically navigating, 
                // but here we trust the navigation flow.
                setCurrentRoot(response.data.userId);
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
            setHighlightedUserId(null); // Clear highlight on manual navigation
        }
    };

    const handleSearchClick = (result) => {
        // If the user has a parent, show the parent's tree so the user is visible as a child
        const targetId = result.parentId || result.userId;

        if (targetId !== currentRoot) {
            setHistory(prev => [...prev, currentRoot]);
            fetchTree(targetId);
        }

        setHighlightedUserId(result.userId);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleBack = () => {
        if (history.length > 0) {
            const prevRoot = history[history.length - 1];
            setHistory(prev => prev.slice(0, -1));
            fetchTree(prevRoot);
            setHighlightedUserId(null);
        }
    };

    // Helper to render tree recursively
    const renderTree = (node) => {
        if (!node) return null;

        return (
            <div className="flex flex-col items-center">
                <TreeNode
                    node={node}
                    onExpand={handleExpand}
                    isHighlighted={node.userId === highlightedUserId}
                />

                {node.children && node.children.length > 0 && !node.empty && (
                    <div className="relative flex justify-center mt-6 gap-6 md:gap-12">
                        {/* 
                            Dynamic Connector Lines 
                            Logic: We need a bridge spanning from the center of Left Child to center of Right Child.
                            And a vertical line from Parent to that bridge.
                        */}

                        {/* Parent Vertical Line (Down) */}
                        <div className="absolute top-[-1.5rem] left-1/2 -translate-x-1/2 h-3 border-l border-gray-300 z-0"></div>

                        {/* Horizontal Bridge Line - Only if we have multiple children (standard 2 in binary) */}
                        <div className="absolute top-[-0.75rem] left-1/4 right-1/4 h-3 border-t border-r border-l border-gray-300 rounded-t-lg z-0"></div>

                        {node.children.map((child, index) => (
                            <div key={index} className="relative flex flex-col items-center">
                                {/* Child Vertical Line (Up to bridge) */}
                                <div className="absolute top-[-0.75rem] h-3 border-l border-gray-300 z-0"></div>
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

                <div className="flex items-center gap-4">
                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="flex items-center bg-gray-100 rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-golden-400 focus-within:border-transparent transition-all">
                            <span className="pl-3 text-gray-500">🔍</span>
                            <input
                                type="text"
                                placeholder="Search User (ID/Name)..."
                                className="bg-transparent border-none focus:ring-0 text-sm py-2 px-3 w-64 outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="pr-3 text-gray-400 hover:text-gray-600">×</button>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {searchResults.length > 0 && searchQuery && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
                                >
                                    {searchResults.map(result => (
                                        <div
                                            key={result.userId}
                                            onClick={() => handleSearchClick(result)}
                                            className="p-3 hover:bg-golden-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors flex items-center justify-between group/item"
                                        >
                                            <div>
                                                <p className="font-bold text-sm text-gray-800">{result.fullName}</p>
                                                <p className="text-xs text-gray-500">{result.userId}</p>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-gray-100 rounded group-hover/item:bg-golden-200 transition-colors">
                                                Go →
                                            </span>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {history.length > 0 && (
                        <button onClick={handleBack} className="btn-secondary">
                            ⬆ Back Up
                        </button>
                    )}
                </div>
            </motion.div>

            <div className="card overflow-auto min-h-[600px] border-2 border-black shadow-lg shadow-gray-400 flex justify-center p-12 bg-gray-200 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                {treeData ? renderTree(treeData) : (
                    <div className="text-center text-gray-500">Tree data not found</div>
                )}
            </div>
        </div>
    );
};

export default TreeView;
