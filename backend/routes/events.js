const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createEvent,
  getEvents,
  getEventById,
  getMyEvents,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');

// Public routes
router.get('/', getEvents);

// Protected routes
router.use(protect);

// User's events (must come before /:id to avoid conflicts)
router.get('/my-events', getMyEvents);

// Get single event by ID (must come after specific routes)
router.get('/:id', getEventById);

// Create event (Planners/Studios only)
router.post('/', createEvent);

// Update/Delete event (Event creator only)
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router; 