import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth token
const createAuthInstance = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  });
};

const profileService = {
  // Upload profile picture
  uploadProfilePicture: async (file) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      console.log('Sending upload request to:', '/profile/upload-picture');
      console.log('FormData:', formData);
      
      const response = await createAuthInstance().post('/profile/upload-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Profile service upload error:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error uploading profile picture');
    }
  },

  // Delete profile picture
  deleteProfilePicture: async () => {
    try {
      const response = await createAuthInstance().delete('/profile/picture');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error deleting profile picture');
    }
  },

  // Get user profile
  getUserProfile: async (userId = null) => {
    try {
      const url = userId ? `/profile/${userId}` : '/profile';
      const response = await createAuthInstance().get(url);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching user profile');
    }
  },

  // Get profile picture URL
  getProfilePictureUrl: (userId) => {
    return `${API_URL}/profile/picture/${userId}`;
  }
};

export default profileService; 