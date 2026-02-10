import axios from 'axios';

const API_URL = 'http://localhost:5000/api/support';

// Create support ticket
const createTicket = async (ticketData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/ticket`, ticketData, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get user's tickets
const getUserTickets = async (params = {}) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/tickets`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        params
    });
    return response.data;
};

// Get ticket by ID
const getTicketById = async (ticketId) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/ticket/${ticketId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Admin: Get all tickets
const getAllTickets = async (params = {}) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/all`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        params
    });
    return response.data;
};

// Admin: Update ticket status
const updateTicketStatus = async (ticketId, status) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/ticket/${ticketId}/status`,
        { status },
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return response.data;
};

// Admin: Add admin note
const addAdminNote = async (ticketId, note) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/ticket/${ticketId}/note`,
        { note },
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return response.data;
};

export const supportService = {
    createTicket,
    getUserTickets,
    getTicketById,
    getAllTickets,
    updateTicketStatus,
    addAdminNote
};
