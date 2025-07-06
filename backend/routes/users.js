const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Placeholder routes for user management
router.get('/', protect, (req, res) => {
  res.json({ message: 'Users route - coming soon' });
});

module.exports = router; 