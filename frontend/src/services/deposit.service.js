import api from './api';

const depositService = {
    // Submit new deposit
    submitDeposit: (data) => {
        return api.post('/deposit', data);
    },

    // Get my deposit history
    getMyDeposits: () => {
        return api.get('/deposit/my-history');
    }
};

export default depositService;
