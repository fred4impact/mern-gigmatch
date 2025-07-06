const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profile-pictures';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    console.log('Upload profile picture request received');
    console.log('File:', req.file);
    console.log('User:', req.user);

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Current user profile picture:', user.profilePicture);

    // Delete old profile picture if exists
    if (user.profilePicture && user.profilePicture !== '') {
      const oldPicturePath = path.join(__dirname, '..', user.profilePicture);
      console.log('Old picture path:', oldPicturePath);
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
        console.log('Old picture deleted');
      }
    }

    // Update user with new profile picture path
    const profilePicturePath = req.file.path.replace(/\\/g, '/'); // Normalize path for cross-platform
    console.log('New picture path:', profilePicturePath);
    user.profilePicture = profilePicturePath;
    await user.save();

    console.log('User saved with new profile picture');

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: `/api/profile/picture/${userId}`
      }
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Error uploading profile picture' });
  }
};

// Get profile picture
const getProfilePicture = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Get profile picture for user:', userId);
    
    const user = await User.findById(userId);
    console.log('User found:', user ? 'yes' : 'no');
    console.log('User profile picture:', user?.profilePicture);

    if (!user || !user.profilePicture) {
      console.log('No user or profile picture found');
      return res.status(404).json({ message: 'Profile picture not found' });
    }

    const picturePath = path.join(__dirname, '..', user.profilePicture);
    console.log('Picture path:', picturePath);
    console.log('File exists:', fs.existsSync(picturePath));
    
    if (!fs.existsSync(picturePath)) {
      console.log('Profile picture file not found');
      return res.status(404).json({ message: 'Profile picture file not found' });
    }

    console.log('Sending profile picture file');
    res.sendFile(picturePath);
  } catch (error) {
    console.error('Get profile picture error:', error);
    res.status(500).json({ message: 'Error retrieving profile picture' });
  }
};

// Delete profile picture
const deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.profilePicture) {
      return res.status(404).json({ message: 'No profile picture to delete' });
    }

    // Delete file from filesystem
    const picturePath = path.join(__dirname, '..', user.profilePicture);
    if (fs.existsSync(picturePath)) {
      fs.unlinkSync(picturePath);
    }

    // Remove reference from user document
    user.profilePicture = '';
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({ message: 'Error deleting profile picture' });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add profile picture URL if exists
    const profileData = user.toObject();
    if (user.profilePicture) {
      profileData.profilePictureUrl = `/api/profile/picture/${user._id}`;
    }

    res.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Error retrieving user profile' });
  }
};

module.exports = {
  upload,
  uploadProfilePicture,
  getProfilePicture,
  deleteProfilePicture,
  getUserProfile
}; 