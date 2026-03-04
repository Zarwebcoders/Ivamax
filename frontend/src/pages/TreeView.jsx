import { useState, useEffect, useRef } from 'react';
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
    const [zoom, setZoom] = useState(1.0); // Default zoom level at 100%

    // Drag to pan state
    const scrollRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setStartY(e.pageY - scrollRef.current.offsetTop);
        setScrollLeft(scrollRef.current.scrollLeft);
        setScrollTop(scrollRef.current.scrollTop);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const y = e.pageY - scrollRef.current.offsetTop;
        const walkX = (x - startX) * 1.5;
        const walkY = (y - startY) * 1.5;
        scrollRef.current.scrollLeft = scrollLeft - walkX;
        scrollRef.current.scrollTop = scrollTop - walkY;
    };

    // Zoom controls
    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.1, 2)); // Max zoom 2x
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.1, 0.5)); // Min zoom 0.5x
    };

    const handleResetZoom = () => {
        setZoom(1.0);
    };

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

    const [expandedNodes, setExpandedNodes] = useState({}); // Map of userId -> boolean

    // ... existing code ...

    const toggleNode = (userId) => {
        setExpandedNodes(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    // Helper to render tree recursively
    const renderTree = (node) => {
        if (!node) return null;

        const isExpanded = !!expandedNodes[node.userId];
        const hasChildren = node.children && node.children.length > 0 && !node.empty;

        return (
            <div className="flex flex-col items-center w-max relative">
                <TreeNode
                    node={node}
                    onExpand={handleExpand} // This is for traversing/focusing
                    isHighlighted={node.userId === highlightedUserId}
                />

                {/* Toggle Button for Expansion */}
                {hasChildren && (
                    <button
                        onClick={() => toggleNode(node.userId)}
                        className="mt-2 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-50 z-10 transition-colors"
                        title={isExpanded ? "Collapse" : "Expand"}
                    >
                        <span className="text-sm font-bold text-gray-600 mb-[1px]">
                            {isExpanded ? '−' : '+'}
                        </span>
                    </button>
                )}

                {/* Recursive Children Rendering */}
                <AnimatePresence>
                    {isExpanded && hasChildren && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="relative flex justify-center mt-4 gap-6 md:gap-12 px-4 py-2 w-max mx-auto"
                            style={{ overflow: 'visible' }}
                        >
                            {/* 
                                Dynamic Connector Lines 
                            */}

                            {/* Parent Vertical Line (Down) */}
                            <div className="absolute top-[-1rem] left-1/2 -translate-x-1/2 h-4 border-l border-gray-300 z-0"></div>

                            {/* Horizontal Bridge Line */}
                            <div className="absolute top-0 left-1/4 right-1/4 h-3 border-t border-r border-l border-gray-300 rounded-t-lg z-0"></div>

                            {node.children.map((child, index) => (
                                <div key={index} className="relative flex flex-col items-center pt-3 shrink-0">
                                    {/* Child Vertical Line (Up to bridge) */}
                                    {/* We need individual lines connecting up to the bridge */}
                                    <div className="absolute top-0 h-3 border-l border-gray-300 z-0"></div>
                                    {renderTree(child)}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
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

            <div className="relative card h-[600px] md:h-[700px] border-2 border-black shadow-lg shadow-gray-400 bg-gray-200 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-50"></div>

                {/* Zoom Controls - Absolute to the card, not the scrolling content */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-50">
                    <button
                        onClick={handleZoomIn}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border-2 border-gray-400 shadow-lg hover:bg-golden-100 hover:border-golden-500 transition-all active:scale-95"
                        title="Zoom In"
                    >
                        <span className="text-xl font-bold text-gray-700">+</span>
                    </button>
                    <button
                        onClick={handleResetZoom}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border-2 border-gray-400 shadow-lg hover:bg-golden-100 hover:border-golden-500 transition-all active:scale-95"
                        title="Reset Zoom"
                    >
                        <span className="text-xs font-bold text-gray-700">{Math.round(zoom * 100)}%</span>
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border-2 border-gray-400 shadow-lg hover:bg-golden-100 hover:border-golden-500 transition-all active:scale-95"
                        title="Zoom Out"
                    >
                        <span className="text-xl font-bold text-gray-700">−</span>
                    </button>
                </div>

                {/* Scrollable Area */}
                <div
                    ref={scrollRef}
                    className="w-full h-full overflow-auto relative z-10 custom-scrollbar cursor-grab active:cursor-grabbing"
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                >
                    {/* The crucial fix: inline-block on the wrapper ensures it wraps tightly around the content and expands the scroll container. p-24 adds space around. */}
                    <div className="inline-block min-w-full p-12 sm:p-24" style={{ textAlign: 'center' }}>
                        <div
                            className="inline-block text-left"
                            style={{
                                zoom: zoom,
                                width: 'max-content' // Forces container to grow with wide children
                            }}
                        >
                            {treeData ? renderTree(treeData) : (
                                <div className="text-center text-gray-500 mt-10">Tree data not found</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TreeView;
