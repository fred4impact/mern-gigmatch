import axios from 'axios';

// Use relative URL for proxy support
const API_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Ensure cookies/credentials are sent
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const authService = {
  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response;
  },

  // Get current user profile
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/me', profileData);
    return response;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response;
  }
};

export default authService; 