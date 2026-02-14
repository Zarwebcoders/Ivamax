import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Bell } from 'lucide-react';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '../services/notification.service';
import NotificationItem from './NotificationItem';
import toast from 'react-hot-toast';

const NotificationPanel = ({ onClose, onUpdate }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread

    useEffect(() => {
        fetchNotifications();

        // Close panel when clicking outside
        const handleClickOutside = (e) => {
            if (!e.target.closest('.notification-panel')) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [filter]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const params = filter === 'unread' ? { unreadOnly: true } : {};
            const response = await getNotifications(params);
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
            onUpdate();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            onUpdate();
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Failed to mark all as read');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id);
            setNotifications(notifications.filter(n => n._id !== id));
            onUpdate();
            toast.success('Notification deleted');
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Failed to delete notification');
        }
    };

    // Group notifications by date
    const groupedNotifications = () => {
        const groups = {
            today: [],
            yesterday: [],
            thisWeek: [],
            older: []
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        notifications.forEach(notification => {
            const notifDate = new Date(notification.createdAt);
            const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate());

            if (notifDay.getTime() === today.getTime()) {
                groups.today.push(notification);
            } else if (notifDay.getTime() === yesterday.getTime()) {
                groups.yesterday.push(notification);
            } else if (notifDate >= weekAgo) {
                groups.thisWeek.push(notification);
            } else {
                groups.older.push(notification);
            }
        });

        return groups;
    };

    const groups = groupedNotifications();
    const hasUnread = notifications.some(n => !n.isRead);

    return (
        <div className="notification-panel fixed md:absolute right-4 md:right-0 top-20 md:top-14 w-[calc(100vw-2rem)] md:w-96 bg-white rounded-3xl md:rounded-2xl shadow-2xl border border-gray-200 z-[999] max-h-[70vh] md:max-h-[600px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
                <div>
                    <h3 className="text-xl font-black text-gray-900">Notifications</h3>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">Stay Updated</p>
                </div>
                <div className="flex items-center gap-3">
                    {hasUnread && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="p-2 bg-golden-50 text-golden-600 hover:bg-golden-100 rounded-xl transition-colors"
                            title="Mark all as read"
                        >
                            <Check className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex px-4 py-2 bg-gray-50/50 gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${filter === 'all'
                        ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${filter === 'unread'
                        ? 'bg-golden-500 text-white shadow-lg shadow-golden-200'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Unread
                </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                        <Bell className="w-12 h-12 mb-2 opacity-30" />
                        <p className="text-sm">No notifications</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {groups.today.length > 0 && (
                            <div>
                                <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                    Today
                                </div>
                                {groups.today.map(notification => (
                                    <NotificationItem
                                        key={notification._id}
                                        notification={notification}
                                        onMarkAsRead={handleMarkAsRead}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}

                        {groups.yesterday.length > 0 && (
                            <div>
                                <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                    Yesterday
                                </div>
                                {groups.yesterday.map(notification => (
                                    <NotificationItem
                                        key={notification._id}
                                        notification={notification}
                                        onMarkAsRead={handleMarkAsRead}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}

                        {groups.thisWeek.length > 0 && (
                            <div>
                                <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                    This Week
                                </div>
                                {groups.thisWeek.map(notification => (
                                    <NotificationItem
                                        key={notification._id}
                                        notification={notification}
                                        onMarkAsRead={handleMarkAsRead}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}

                        {groups.older.length > 0 && (
                            <div>
                                <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                    Older
                                </div>
                                {groups.older.map(notification => (
                                    <NotificationItem
                                        key={notification._id}
                                        notification={notification}
                                        onMarkAsRead={handleMarkAsRead}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;
