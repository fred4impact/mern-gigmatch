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

const matchingService = {
  // Find talent matches for an event (planners/studios)
  findEventMatches: async (eventId, options = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.radius) params.append('radius', options.radius);
      if (options.limit) params.append('limit', options.limit);
      if (options.includeInactive) params.append('includeInactive', options.includeInactive);

      const response = await api.get(`/matching/events/${eventId}/matches?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error finding event matches');
    }
  },

  // Find events for a talent (reverse matching)
  findTalentEvents: async (options = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.radius) params.append('radius', options.radius);
      if (options.limit) params.append('limit', options.limit);
      if (options.category) params.append('category', options.category);
      if (options.skills) params.append('skills', options.skills);

      const response = await api.get(`/matching/talent/events?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error finding talent events');
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
  }
};

export default matchingService; 