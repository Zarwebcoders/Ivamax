import axios from 'axios';

const API_URL = 'http://localhost:5000/api/announcements';

// Get active announcements (for users)
export const getActiveAnnouncements = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/active`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Get all announcements (for admin)
export const getAllAnnouncements = async (params = {}) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/all`, {
            headers: { Authorization: `Bearer ${token}` },
            params
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Create announcement (admin only)
export const createAnnouncement = async (data) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(API_URL, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Update announcement (admin only)
export const updateAnnouncement = async (id, data) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_URL}/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Delete announcement (admin only)
export const deleteAnnouncement = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Toggle announcement status (admin only)
export const toggleAnnouncementStatus = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${API_URL}/${id}/toggle`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
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
