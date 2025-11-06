// Dashboard Service for API communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3200/api';

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url, options = {}) => {
  const defaultOptions = {
    credentials: 'include', // Include cookies for authentication
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

class DashboardService {
    /**
     * Get dashboard statistics
     * @returns {Promise} Dashboard statistics data
     */
    async getDashboardStats() {
        try {
            const response = await makeAuthenticatedRequest('/dashboard/stats', {
                method: 'GET',
            });
            return response;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }

    /**
     * Get recent activity
     * @returns {Promise} Recent activity data
     */
    async getRecentActivity() {
        try {
            const response = await makeAuthenticatedRequest('/dashboard/activity', {
                method: 'GET',
            });
            return response;
        } catch (error) {
            console.error('Error fetching recent activity:', error);
            throw error;
        }
    }
}

export default new DashboardService();

