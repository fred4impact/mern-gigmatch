const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiter for profile picture uploads
const uploadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 upload requests per minute
  message: 'Too many upload requests, please try again later.'
});

// Upload profile picture
router.post('/upload-picture', protect, uploadLimiter, profileController.upload.single('profilePicture'), profileController.uploadProfilePicture);

// Get profile picture
router.get('/picture/:userId', profileController.getProfilePicture);

// Delete profile picture
router.delete('/picture', protect, profileController.deleteProfilePicture);

// Get user profile
router.get('/:userId?', protect, profileController.getUserProfile);

module.exports = router; 