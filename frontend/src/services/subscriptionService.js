import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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

const subscriptionService = {
  // Get current user's subscription
  getMySubscription: async () => {
    try {
      const response = await api.get('/subscriptions/my-subscription');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching subscription');
    }
  },

  // Get subscription recommendations
  getRecommendations: async () => {
    try {
      const response = await api.get('/matching/talent/recommendations');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching recommendations');
    }
  },

  // Get subscription tiers and pricing
  getSubscriptionTiers: async () => {
    try {
      const response = await api.get('/subscriptions/tiers');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching subscription tiers');
    }
  },

  // Upgrade subscription (placeholder for payment integration)
  upgradeSubscription: async (tier) => {
    try {
      const response = await api.post('/subscriptions/upgrade', { tier });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error upgrading subscription');
    }
  },

  // Cancel subscription
  cancelSubscription: async () => {
    try {
      const response = await api.post('/subscriptions/cancel');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error cancelling subscription');
    }
  }
};

export default subscriptionService; 