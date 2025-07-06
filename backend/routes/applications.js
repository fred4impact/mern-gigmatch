const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

// Apply to an event (talents only)
router.post('/events/:eventId/apply', protect, applicationController.applyToEvent);

// Get my applications (talents only)
router.get('/my-applications', protect, applicationController.getMyApplications);

// Get applications for an event (planners/studios only)
router.get('/events/:eventId/applications', protect, applicationController.getEventApplications);

// Accept an application (planners/studios only)
router.put('/applications/:applicationId/accept', protect, applicationController.acceptApplication);

// Reject an application (planners/studios only)
router.put('/applications/:applicationId/reject', protect, applicationController.rejectApplication);

// Withdraw application (talents only)
router.put('/applications/:applicationId/withdraw', protect, applicationController.withdrawApplication);

// Mark application as read
router.put('/applications/:applicationId/read', protect, applicationController.markAsRead);

// Get application statistics
router.get('/applications/stats', protect, applicationController.getApplicationStats);

module.exports = router; 