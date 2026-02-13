const express = require('express');
const router = express.Router();
const {
    getActiveAnnouncements,
    getAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleAnnouncementStatus
} = require('../controllers/announcementController');
const { protect, admin } = require('../middleware/auth');

// Public/User routes
router.get('/active', protect, getActiveAnnouncements);

const upload = require('../middleware/uploadMiddleware');

// Admin routes
router.get('/all', protect, admin, getAllAnnouncements);
router.post('/', protect, admin, upload.single('image'), createAnnouncement);
router.put('/:id', protect, admin, upload.single('image'), updateAnnouncement);
router.delete('/:id', protect, admin, deleteAnnouncement);
router.patch('/:id/toggle', protect, admin, toggleAnnouncementStatus);

module.exports = router;
