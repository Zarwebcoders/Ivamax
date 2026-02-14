import api from './api';

export const withdrawalService = {
    // User functions
    requestWithdrawal: async (amount, walletAddress, method = 'USDT (TRC20)') => {
        const response = await api.post('/withdrawal/request', {
            amount,
            walletAddress,
            method
        });
        return response.data;
    },

    getWithdrawalHistory: async (limit = 20, page = 1, status = '') => {
        const url = `/withdrawal/history?limit=${limit}&page=${page}${status ? `&status=${status}` : ''}`;
        const response = await api.get(url);
        return response.data;
    },

    getWithdrawalStats: async () => {
        const response = await api.get('/withdrawal/stats');
        return response.data;
    },

    // Admin functions
    getPendingWithdrawals: async (status = 'pending') => {
        const response = await api.get(`/withdrawal/pending?status=${status}`);
        return response.data;
    },

    getAllWithdrawals: async (limit = 50, page = 1, status = '') => {
        const url = `/withdrawal/all?limit=${limit}&page=${page}${status ? `&status=${status}` : ''}`;
        const response = await api.get(url);
        return response.data;
    },

    approveWithdrawal: async (id, transactionHash = '', notes = '') => {
        const response = await api.put(`/withdrawal/${id}/approve`, {
            transactionHash,
            notes
        });
        return response.data;
    },

    rejectWithdrawal: async (id, reason) => {
        const response = await api.put(`/withdrawal/${id}/reject`, {
            reason
        });
        return response.data;
    },
};
