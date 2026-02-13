const Announcement = require('../models/Announcement');

// Get all active announcements (for users)
const getActiveAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({ isActive: true })
            .sort({ priority: -1, createdAt: -1 })
            .limit(10)
            .select('-__v');

        res.json({
            success: true,
            data: announcements
        });
    } catch (error) {
        console.error('Error fetching active announcements:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch announcements'
        });
    }
};

// Get all announcements (for admin)
const getAllAnnouncements = async (req, res) => {
    try {
        const { page = 1, limit = 20, type, isActive } = req.query;

        const filter = {};
        if (type) filter.type = type;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const announcements = await Announcement.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-__v');

        const count = await Announcement.countDocuments(filter);

        res.json({
            success: true,
            data: announcements,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        console.error('Error fetching all announcements:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch announcements'
        });
    }
};

// Create new announcement (admin only)
const createAnnouncement = async (req, res) => {
    try {
        const { type, title, message, priority, image } = req.body;

        // Validation based on type
        if (type === 'banner') {
            if (!image) {
                return res.status(400).json({
                    success: false,
                    message: 'Image URL is required for banner'
                });
            }
        } else {
            if (!title || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'Title and message are required'
                });
            }
        }

        const announcement = new Announcement({
            type: type || 'announcement',
            title,
            message,
            image,
            priority: priority || 1,
            createdBy: req.user.userId
        });

        await announcement.save();

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            data: announcement
        });
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create announcement'
        });
    }
};

// Update announcement (admin only)
const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, title, message, priority, isActive, image } = req.body;

        const announcement = await Announcement.findById(id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        if (type) announcement.type = type;
        if (title !== undefined) announcement.title = title;
        if (message !== undefined) announcement.message = message;
        if (image !== undefined) announcement.image = image;
        if (priority !== undefined) announcement.priority = priority;
        if (isActive !== undefined) announcement.isActive = isActive;

        await announcement.save();

        res.json({
            success: true,
            message: 'Announcement updated successfully',
            data: announcement
        });
    } catch (error) {
        console.error('Error updating announcement:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update announcement'
        });
    }
};

// Delete announcement (admin only)
const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;

        const announcement = await Announcement.findByIdAndDelete(id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        res.json({
            success: true,
            message: 'Announcement deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete announcement'
        });
    }
};

// Toggle announcement status (admin only)
const toggleAnnouncementStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const announcement = await Announcement.findById(id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        announcement.isActive = !announcement.isActive;
        await announcement.save();

        res.json({
            success: true,
            message: `Announcement ${announcement.isActive ? 'activated' : 'deactivated'} successfully`,
            data: announcement
        });
    } catch (error) {
        console.error('Error toggling announcement status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle announcement status'
        });
    }
};

module.exports = {
    getActiveAnnouncements,
    getAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleAnnouncementStatus
};
