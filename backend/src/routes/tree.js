const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTree } = require('../controllers/treeController');

router.use(protect);

router.get('/:userId', getTree);
router.get('/', getTree); // Get current user's tree

module.exports = router;
