import api from './api';

export const incomeService = {
    getIncomeHistory: async (limit = 12) => {
        const response = await api.get(`/income/history?limit=${limit}`);
        return response.data;
    },

    getCurrentIncome: async () => {
        const response = await api.get('/income/current');
        return response.data;
    },

    // Admin only
    processMonthlyIncome: async (month, year) => {
        const response = await api.post('/income/process', { month, year });
        return response.data;
    },

    getDfrHistory: async () => {
        const response = await api.get('/income/history/dfr');
        return response.data;
    },

    getMatchingHistory: async () => {
        const response = await api.get('/income/history/matching');
        return response.data;
    },

    getRankRewards: async () => {
        const response = await api.get('/income/history/rewards');
        return response.data;
    },

    getMonthlySales: async () => {
        const response = await api.get('/income/history/sales');
        return response.data;
    },
};
