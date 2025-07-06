const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Placeholder routes for talent management
router.get('/', protect, (req, res) => {
  res.json({ message: 'Talents route - coming soon' });
});

module.exports = router; 