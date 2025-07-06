const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');
const { protect } = require('../middleware/auth');

// Find talent matches for an event (planners/studios only)
router.get('/events/:eventId/matches', protect, matchingController.findEventMatches);

// Find events for a talent (reverse matching)
router.get('/talent/events', protect, matchingController.findTalentEvents);

// Get subscription recommendations for a talent
router.get('/talent/recommendations', protect, matchingController.getSubscriptionRecommendations);

module.exports = router; 