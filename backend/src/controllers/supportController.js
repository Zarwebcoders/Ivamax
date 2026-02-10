const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');

// Email configuration based on ticket type
const EMAIL_CONFIG = {
    inquiry: 'inquiry@ivamax.com',
    complaint: 'complaint@ivamax.com',
    support: 'support@ivamax.com'
};

// @desc    Create new support ticket
// @route   POST /api/support/ticket
// @access  Private
const createTicket = async (req, res) => {
    try {
        const { type, subject, priority, message } = req.body;
        const userId = req.user.userId;

        // Validation
        if (!type || !subject || !priority || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate message length
        if (message.length < 10 || message.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Message must be between 10 and 1000 characters'
            });
        }

        // Get user details
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Create ticket
        const ticket = new SupportTicket({
            userId,
            userEmail: user.email,
            userName: user.fullName,
            type: type.toLowerCase(),
            subject: subject.toLowerCase(),
            priority: priority.toLowerCase(),
            message
        });

        await ticket.save();

        // TODO: Send email notification to appropriate email address
        const targetEmail = EMAIL_CONFIG[type.toLowerCase()];
        console.log(`📧 Email should be sent to: ${targetEmail}`);
        console.log(`Ticket ${ticket.ticketId} created by ${user.fullName}`);

        res.status(201).json({
            success: true,
            message: 'Support ticket created successfully',
            data: {
                ticketId: ticket.ticketId,
                type: ticket.type,
                subject: ticket.subject,
                priority: ticket.priority,
                status: ticket.status,
                createdAt: ticket.createdAt
            }
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get user's tickets
// @route   GET /api/support/tickets
// @access  Private
const getUserTickets = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { status, limit = 20, page = 1 } = req.query;

        const query = { userId };
        if (status) {
            query.status = status;
        }

        const tickets = await SupportTicket.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .select('-__v');

        const total = await SupportTicket.countDocuments(query);

        res.json({
            success: true,
            data: tickets,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get single ticket details
// @route   GET /api/support/ticket/:id
// @access  Private
const getTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const ticket = await SupportTicket.findOne({
            ticketId: id,
            userId
        });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        res.json({
            success: true,
            data: ticket
        });
    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get all tickets (Admin)
// @route   GET /api/support/all
// @access  Private/Admin
const getAllTickets = async (req, res) => {
    try {
        const { status, type, priority, limit = 20, page = 1 } = req.query;

        const query = {};
        if (status) query.status = status;
        if (type) query.type = type;
        if (priority) query.priority = priority;

        const tickets = await SupportTicket.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .select('-__v');

        const total = await SupportTicket.countDocuments(query);

        // Get stats
        const stats = {
            total: await SupportTicket.countDocuments(),
            open: await SupportTicket.countDocuments({ status: 'open' }),
            inProgress: await SupportTicket.countDocuments({ status: 'in_progress' }),
            resolved: await SupportTicket.countDocuments({ status: 'resolved' }),
            closed: await SupportTicket.countDocuments({ status: 'closed' })
        };

        res.json({
            success: true,
            data: tickets,
            stats,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching all tickets:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update ticket status (Admin)
// @route   PUT /api/support/ticket/:id/status
// @access  Private/Admin
const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const adminId = req.user.userId;

        if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const ticket = await SupportTicket.findOne({ ticketId: id });
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        ticket.status = status;
        if (status === 'in_progress' && !ticket.assignedTo) {
            ticket.assignedTo = adminId;
        }
        if (status === 'resolved' || status === 'closed') {
            ticket.resolvedAt = new Date();
        }

        await ticket.save();

        res.json({
            success: true,
            message: 'Ticket status updated',
            data: ticket
        });
    } catch (error) {
        console.error('Error updating ticket status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Add admin note (Admin)
// @route   PUT /api/support/ticket/:id/note
// @access  Private/Admin
const addAdminNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;

        if (!note) {
            return res.status(400).json({
                success: false,
                message: 'Note is required'
            });
        }

        const ticket = await SupportTicket.findOne({ ticketId: id });
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        ticket.adminNotes = note;
        await ticket.save();

        res.json({
            success: true,
            message: 'Admin note added',
            data: ticket
        });
    } catch (error) {
        console.error('Error adding admin note:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    createTicket,
    getUserTickets,
    getTicketById,
    getAllTickets,
    updateTicketStatus,
    addAdminNote
};
