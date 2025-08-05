import React, { useState, useRef } from 'react';
import { FaCamera, FaTrash, FaUser, FaImage } from 'react-icons/fa';
import profileService from '../services/profileService';
import toast from 'react-hot-toast';
import './ProfilePicture.css';

const ProfilePicture = ({ 
  userId, 
  currentPicture, 
  onPictureUpdate, 
  size = 'large',
  editable = false,
  className = '',
  user = null
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
    xlarge: 'w-32 h-32'
  };

  const iconSizes = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl',
    xlarge: 'text-3xl'
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Prevent multiple uploads
    if (isUploading) {
      toast.error('Upload already in progress');
      return;
    }

    try {
      setIsUploading(true);
      console.log('Uploading file:', file.name, file.size, file.type);
      const response = await profileService.uploadProfilePicture(file);
      console.log('Upload response:', response);
      toast.success('Profile picture uploaded successfully!');
      if (onPictureUpdate) {
        onPictureUpdate(response.data.avatar);
      }
      // Clear the file input
      event.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      if (error.message.includes('Too many requests')) {
        toast.error('Please wait a moment before trying again');
      } else {
        toast.error(error.message || 'Error uploading profile picture');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePicture = async () => {
    if (!currentPicture) return;

    try {
      setIsDeleting(true);
      await profileService.deleteProfilePicture();
      toast.success('Profile picture deleted successfully!');
      setImageLoadError(false); // Reset error state
      if (onPictureUpdate) {
        onPictureUpdate('');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Error deleting profile picture');
    } finally {
      setIsDeleting(false);
    }
  };

  const getPictureUrl = () => {
    if (currentPicture && currentPicture.trim() !== '') {
      if (currentPicture.startsWith('http')) {
        return currentPicture;
      }
      // Always add a slash if missing
      const path = currentPicture.startsWith('/') ? currentPicture : `/${currentPicture}`;
      return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${path}`;
    }
    return null;
  };

  // Add a state to track if the image failed to load
  const [imageLoadError, setImageLoadError] = useState(false);

  const pictureUrl = getPictureUrl();

  return (
    <div className="profile-avatar-container">
      <div className="profile-avatar-wrapper">
        {pictureUrl && !imageLoadError ? (
          <img
            src={pictureUrl}
            alt="Avatar"
            className="profile-avatar-img"
            onError={() => setImageLoadError(true)}
          />
        ) : (
          <div className="profile-avatar-placeholder">
            {user?.firstName && user?.lastName
              ? `${user.firstName.charAt(0).toUpperCase()}${user.lastName.charAt(0).toUpperCase()}`
              : <FaUser className="profile-avatar-icon" />}
          </div>
        )}
        {editable && (
          <button
            className="profile-avatar-upload-btn"
            title="Upload new avatar"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaCamera />
          </button>
        )}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>
      {editable && (
        <div className="text-center mt-2 text-sm text-gray-600">Click the camera icon to upload a new avatar.</div>
      )}
    </div>
  );
};

export default ProfilePicture; 