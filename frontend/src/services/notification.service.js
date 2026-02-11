import api from './api';

// Get all notifications
export const getNotifications = async (params = {}) => {
    try {
        const response = await api.get('/notifications', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Get unread notification count
export const getUnreadCount = async () => {
    try {
        const response = await api.get('/notifications/unread-count');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Mark notification as read
export const markAsRead = async (id) => {
    try {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
    try {
        const response = await api.patch('/notifications/read-all');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Delete notification
export const deleteNotification = async (id) => {
    try {
        const response = await api.delete(`/notifications/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Clear all read notifications
export const clearReadNotifications = async () => {
    try {
        const response = await api.delete('/notifications/clear-read');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
