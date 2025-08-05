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

const reviewService = {
  // Create a new review
  createReview: async (reviewData) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error creating review');
    }
  },

  // Get reviews for a talent
  getTalentReviews: async (talentId, options = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      if (options.sort) params.append('sort', options.sort);

      const response = await api.get(`/reviews/talent/${talentId}?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching reviews');
    }
  },

  // Get reviews for an event
  getEventReviews: async (eventId, options = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      if (options.sort) params.append('sort', options.sort);

      const response = await api.get(`/reviews/event/${eventId}?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching reviews');
    }
  },

  // Get user's reviews (reviews they've written)
  getMyReviews: async (options = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);

      const response = await api.get(`/reviews/my-reviews?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching your reviews');
    }
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error updating review');
    }
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error deleting review');
    }
  },

  // Report a review
  reportReview: async (reviewId, reason) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/report`, { reason });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error reporting review');
    }
  },

  // Submit a review for a completed application/booking
  submitApplicationReview: async (applicationId, reviewData) => {
    try {
      const response = await api.post(`/applications/${applicationId}/review`, reviewData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error submitting review');
    }
  }
};

export default reviewService; 