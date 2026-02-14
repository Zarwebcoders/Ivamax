import api from './api';

// Get active announcements (for users)
export const getActiveAnnouncements = async () => {
    try {
        const response = await api.get('/announcements/active');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Get all announcements (for admin)
export const getAllAnnouncements = async (params = {}) => {
    try {
        const response = await api.get('/announcements/all', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Create announcement (admin only)
export const createAnnouncement = async (data) => {
    try {
        const response = await api.post('/announcements', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Update announcement (admin only)
export const updateAnnouncement = async (id, data) => {
    try {
        const response = await api.put(`/announcements/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Delete announcement (admin only)
export const deleteAnnouncement = async (id) => {
    try {
        const response = await api.delete(`/announcements/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Toggle announcement status (admin only)
export const toggleAnnouncementStatus = async (id) => {
    try {
        const response = await api.patch(`/announcements/${id}/toggle`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const announcementService = {
    getActiveAnnouncements,
    getAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleAnnouncementStatus
};
