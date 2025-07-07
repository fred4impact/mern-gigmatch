const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Protect all admin routes and restrict to admin role
router.use(protect, authorize('admin'));

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/ban', adminController.banUser);
router.patch('/users/:id/unban', adminController.unbanUser);
router.delete('/users/:id', adminController.deleteUser);

// Event management
router.get('/events', adminController.getAllEvents);
router.get('/events/:id', adminController.getEventById);
router.patch('/events/:id/approve', adminController.approveEvent);
router.patch('/events/:id/remove', adminController.removeEvent);

// Booking management
router.get('/bookings', adminController.getAllBookings);
router.get('/bookings/:id', adminController.getBookingById);

// Moderation
router.get('/disputes', adminController.getAllDisputes);
router.patch('/disputes/:id/resolve', adminController.resolveDispute);

// Analytics
router.get('/analytics/overview', adminController.getAnalyticsOverview);
router.get('/analytics/revenue', adminController.getRevenueAnalytics);

// Subscription management
router.get('/subscriptions', adminController.getAllSubscriptions);
router.get('/subscriptions/:id', adminController.getSubscriptionById);
router.patch('/subscriptions/:id/cancel', adminController.cancelSubscription);

module.exports = router; 