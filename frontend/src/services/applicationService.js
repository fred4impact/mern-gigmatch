import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with auth token
const createAuthInstance = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    }
  });
};

const applicationService = {
  // Apply to an event
  applyToEvent: async (eventId, applicationData) => {
    try {
      const response = await createAuthInstance().post(`/applications/events/${eventId}/apply`, applicationData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error applying to event');
    }
  },

  // Get my applications (for talents)
  getMyApplications: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await createAuthInstance().get(`/applications/my-applications?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching applications');
    }
  },

  // Get applications for an event (for planners/studios)
  getEventApplications: async (eventId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await createAuthInstance().get(`/applications/events/${eventId}/applications?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching event applications');
    }
  },

  // Accept an application
  acceptApplication: async (applicationId, responseMessage = '') => {
    try {
      const response = await createAuthInstance().put(`/applications/applications/${applicationId}/accept`, {
        responseMessage
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error accepting application');
    }
  },

  // Reject an application
  rejectApplication: async (applicationId, responseMessage = '') => {
    try {
      const response = await createAuthInstance().put(`/applications/applications/${applicationId}/reject`, {
        responseMessage
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error rejecting application');
    }
  },

  // Withdraw application
  withdrawApplication: async (applicationId) => {
    try {
      const response = await createAuthInstance().put(`/applications/applications/${applicationId}/withdraw`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error withdrawing application');
    }
  },

  // Mark application as read
  markAsRead: async (applicationId) => {
    try {
      const response = await createAuthInstance().put(`/applications/applications/${applicationId}/read`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error marking application as read');
    }
  },

  // Get application statistics
  getApplicationStats: async () => {
    try {
      const response = await createAuthInstance().get('/applications/applications/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching application statistics');
    }
  }
};

export default applicationService; 