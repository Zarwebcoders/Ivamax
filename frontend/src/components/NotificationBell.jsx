import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { getUnreadCount } from '../services/notification.service';
import NotificationPanel from './NotificationPanel';

const NotificationBell = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [showPanel, setShowPanel] = useState(false);
    const bellRef = useRef(null);

    useEffect(() => {
        fetchUnreadCount();

        // Poll for new notifications every 10 seconds
        const interval = setInterval(fetchUnreadCount, 10000);

        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await getUnreadCount();
            setUnreadCount(response.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const togglePanel = () => {
        setShowPanel(!showPanel);
    };

    const handleNotificationUpdate = () => {
        fetchUnreadCount();
    };

    return (
        <div className="relative" ref={bellRef}>
            <button
                onClick={togglePanel}
                className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                aria-label="Notifications"
            >
                <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[20px]">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {showPanel && (
                <NotificationPanel
                    onClose={() => setShowPanel(false)}
                    onUpdate={handleNotificationUpdate}
                />
            )}
        </div>
    );
};

export default NotificationBell;
