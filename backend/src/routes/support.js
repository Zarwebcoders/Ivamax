const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
    createTicket,
    getUserTickets,
    getTicketById,
    getAllTickets,
    updateTicketStatus,
    addAdminNote
} = require('../controllers/supportController');

// User routes
router.post('/ticket', protect, createTicket);
router.get('/tickets', protect, getUserTickets);
router.get('/ticket/:id', protect, getTicketById);

// Admin routes
router.get('/all', protect, admin, getAllTickets);
router.put('/ticket/:id/status', protect, admin, updateTicketStatus);
router.put('/ticket/:id/note', protect, admin, addAdminNote);

module.exports = router;
