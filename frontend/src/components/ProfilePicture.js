import React, { useState, useRef } from 'react';
import { FaCamera, FaTrash, FaUser, FaImage } from 'react-icons/fa';
import profileService from '../services/profileService';
import toast from 'react-hot-toast';

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
        onPictureUpdate(response.data.profilePicture);
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
      // If it's a relative path, construct the full URL
      if (currentPicture.startsWith('/')) {
        return `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${currentPicture}`;
      }
      // If it's just a path, use the profile service
      return profileService.getProfilePictureUrl(userId);
    }
    return null;
  };

  // Add a state to track if the image failed to load
  const [imageLoadError, setImageLoadError] = useState(false);

  const pictureUrl = getPictureUrl();

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Profile Picture Container */}
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-white shadow-xl`}>
        {pictureUrl && !imageLoadError ? (
          <img
            src={pictureUrl}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Image load error for URL:', pictureUrl);
              setImageLoadError(true);
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', pictureUrl);
              setImageLoadError(false);
            }}
          />
        ) : null}
        
        {/* Placeholder with User Initials or Icon */}
        <div 
          className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 ${pictureUrl && !imageLoadError ? 'hidden' : 'flex'}`}
        >
          {user?.firstName && user?.lastName ? (
            <div className="text-center">
              <span className={`text-white font-bold block ${size === 'small' ? 'text-sm' : size === 'medium' ? 'text-lg' : size === 'large' ? 'text-xl' : 'text-2xl'}`}>
                {user.firstName.charAt(0).toUpperCase()}{user.lastName.charAt(0).toUpperCase()}
              </span>
              {size !== 'small' && user?.role && (
                <span className={`text-white opacity-75 block ${size === 'medium' ? 'text-xs' : 'text-sm'}`}>
                  {user.role === 'talent' ? 'Talent' : user.role === 'planner' ? 'Planner' : 'Studio'}
                </span>
              )}
            </div>
          ) : (
            <div className="text-center">
              <FaUser className={`text-white ${iconSizes[size]}`} />
              {size !== 'small' && user?.role && (
                <span className={`text-white opacity-75 block ${size === 'medium' ? 'text-xs' : 'text-sm'}`}>
                  {user.role === 'talent' ? 'Talent' : user.role === 'planner' ? 'Planner' : 'Studio'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {(isUploading || isDeleting) && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
              <span className="text-white text-xs font-medium">
                {isUploading ? 'Uploading...' : 'Deleting...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {editable && (
        <div className="absolute -bottom-1 -right-1 flex gap-1">
          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isDeleting}
            className="w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 z-10"
            title="Upload new picture"
          >
            <FaCamera className="text-xs" />
          </button>

          {/* Delete Button */}
          {pictureUrl && (
            <button
              onClick={handleDeletePicture}
              disabled={isUploading || isDeleting}
              className="w-8 h-8 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 z-10"
              title="Delete picture"
            >
              <FaTrash className="text-xs" />
            </button>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ProfilePicture; 