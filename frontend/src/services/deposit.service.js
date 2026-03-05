import api from './api';

const depositService = {
    // Submit new deposit
    submitDeposit: (data) => {
        return api.post('/deposit', data);
    },

    // Get my deposit history
    getMyDeposits: () => {
        return api.get('/deposit/my-history');
    },

    // Buy package using profit balance
    buyWithProfit: (data) => {
        return api.post('/deposit/buy-profit', data);
    }
};

export default depositService;
