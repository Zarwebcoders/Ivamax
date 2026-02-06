const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTree, checkRawNodes, searchUsers } = require('../controllers/treeController');

// Public Debug Route
router.get('/raw-check', checkRawNodes);

// Protected Routes
router.use(protect);
router.get('/search', searchUsers); // Must be before /:userId
router.get('/:userId', getTree);
router.get('/', getTree);

module.exports = router;
