import api from './api';

const adminService = {
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    getAllUsers: async (page = 1, limit = 10, search = '') => {
        const response = await api.get(`/admin/users?page=${page}&limit=${limit}&search=${search}`);
        return response.data;
    },

    createUser: async (userData) => {
        const response = await api.post('/admin/create-user', userData);
        return response.data;
    },

    updateUser: async (userId, userData) => {
        const response = await api.put(`/admin/users/${userId}`, userData);
        return response.data;
    },

    toggleUserStatus: async (userId) => {
        const response = await api.put(`/admin/users/${userId}/toggle-status`);
        return response.data;
    },

    // Add more admin services as needed
};

export default adminService;
