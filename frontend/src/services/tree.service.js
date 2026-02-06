import api from './api';

export const treeService = {
    getTree: async (userId) => {
        // If userId is provided, fetch specific tree, otherwise fetch current user's tree
        const url = userId ? `/tree/${userId}` : '/tree';
        const response = await api.get(url);
        return response.data;
    },
    searchUsers: async (query) => {
        const response = await api.get(`/tree/search?q=${query}`);
        return response.data;
    }
};
