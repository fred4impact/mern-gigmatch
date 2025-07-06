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

const dashboardService = {
  // Get dashboard statistics for talents
  getTalentStats: async () => {
    try {
      const response = await createAuthInstance().get('/dashboard/talent-stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching talent stats');
    }
  },

  // Get dashboard statistics for planners/studios
  getPlannerStats: async () => {
    try {
      const response = await createAuthInstance().get('/dashboard/planner-stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching planner stats');
    }
  },

  // Get recent activity
  getRecentActivity: async () => {
    try {
      const response = await createAuthInstance().get('/dashboard/recent-activity');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching recent activity');
    }
  },

  // Get profile completion percentage
  getProfileCompletion: async () => {
    try {
      const response = await createAuthInstance().get('/dashboard/profile-completion');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching profile completion');
    }
  }
};

export default dashboardService; 