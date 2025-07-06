import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with auth token
const createAxiosInstance = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });
};

const eventService = {
  // Create a new event
  createEvent: async (eventData) => {
    try {
      const response = await createAxiosInstance().post('/events', eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error creating event' };
    }
  },

  // Get all events with optional filters
  getEvents: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await createAxiosInstance().get(`/events?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching events' };
    }
  },

  // Get single event by ID
  getEventById: async (eventId) => {
    try {
      const response = await createAxiosInstance().get(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching event' };
    }
  },

  // Get events created by current user
  getMyEvents: async () => {
    try {
      const response = await createAxiosInstance().get('/events/my-events');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching your events' };
    }
  },

  // Update event
  updateEvent: async (eventId, eventData) => {
    try {
      const response = await createAxiosInstance().put(`/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error updating event' };
    }
  },

  // Delete event
  deleteEvent: async (eventId) => {
    try {
      const response = await createAxiosInstance().delete(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error deleting event' };
    }
  }
};

export default eventService; 