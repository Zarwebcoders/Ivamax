import api from './api';

export const authService = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    updateProfile: async (userData) => {
        const response = await api.put('/auth/profile', userData);
        if (response.data) {
            // Update local storage if needed, or rely on fetching fresh "me"
            // But usually nice to update stored user
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            const updated = { ...stored, ...response.data };
            localStorage.setItem('user', JSON.stringify(updated));
        }
        return response.data;
    },

    forgotPassword: async (userId) => {
        const response = await api.post('/auth/forgot-password', { userId });
        return response.data;
    },

    resetPassword: async (data) => {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    },

    getStoredUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    getWalletHistory: async () => {
        const response = await api.get('/auth/wallet-history');
        return response.data;
    },
};
