const Notification = require('../models/Notification');

// Icon and color mapping for notification types
const NOTIFICATION_CONFIG = {
    REGISTRATION: { icon: 'UserPlus', color: 'green' },
    RANK_ACHIEVED: { icon: 'Trophy', color: 'golden' },
    PAYMENT_RELEASED: { icon: 'CheckCircle', color: 'green' },
    PACKAGE_ACTIVATED: { icon: 'Package', color: 'blue' },
    NEW_TEAM_MEMBER: { icon: 'Users', color: 'blue' },
    DIRECT_REFERRAL: { icon: 'UserCheck', color: 'golden' },
    PAYMENT_GENERATED: { icon: 'DollarSign', color: 'green' },
    WITHDRAWAL_REQUEST: { icon: 'ArrowDownLeft', color: 'orange' },
    WITHDRAWAL_RELEASED: { icon: 'CheckCircle', color: 'green' },
    INQUIRY_CREATED: { icon: 'MessageCircle', color: 'orange' },
    INQUIRY_RESOLVED: { icon: 'CheckCircle2', color: 'green' },
    COMPANY_UPDATE: { icon: 'Megaphone', color: 'purple' },
    PROFILE_UPDATED: { icon: 'Settings', color: 'blue' }
};

// @desc    Create notification (internal use)
const createNotification = async (data) => {
    try {
        const config = NOTIFICATION_CONFIG[data.type] || { icon: 'Bell', color: 'blue' };

        const notification = await Notification.create({
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            icon: data.icon || config.icon,
            color: data.color || config.color,
            link: data.link || null,
            metadata: data.metadata || {}
        });

        console.log(`📢 Notification created for ${data.userId}: ${data.title}`);
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly = false } = req.query;

        const query = { userId: req.user.userId };
        if (unreadOnly === 'true') {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Notification.countDocuments(query);

        res.json({
            success: true,
            data: notifications,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            userId: req.user.userId,
            isRead: false
        });

        res.json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Error marking as read:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.userId, isRead: false },
            { isRead: true }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/clear-read
// @access  Private
const clearReadNotifications = async (req, res) => {
    try {
        const result = await Notification.deleteMany({
            userId: req.user.userId,
            isRead: true
        });

        res.json({
            success: true,
            message: `${result.deletedCount} notifications deleted`
        });
    } catch (error) {
        console.error('Error clearing notifications:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    createNotification,
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications
};
