const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// Get talent dashboard statistics
router.get('/talent-stats', protect, dashboardController.getTalentStats);

// Get planner/studio dashboard statistics
router.get('/planner-stats', protect, dashboardController.getPlannerStats);

// Get recent activity
router.get('/recent-activity', protect, dashboardController.getRecentActivity);

// Get profile completion percentage
router.get('/profile-completion', protect, dashboardController.getProfileCompletion);

// Public stats for homepage
router.get('/public-stats', dashboardController.getPublicStats);

module.exports = router; 