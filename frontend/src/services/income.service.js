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
};
