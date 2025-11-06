// Patient Service for API communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3200/api';

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url, options = {}) => {
  const defaultOptions = {
    credentials: 'include', // Include cookies for authentication
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...defaultOptions,
      ...options,
    });

    // Handle authentication errors specifically
    if (response.status === 401) {
      throw new Error('Authentication required. Please log in to access patient data.');
    }

    if (response.status === 403) {
      throw new Error('Access denied. You do not have permission to access patient data.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please ensure the backend server is running.');
    }
    throw error;
  }
};

// Patient CRUD Operations
export const patientService = {
  // Get all patients with pagination and filtering
  async getPatients(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const url = `/patients${queryString ? `?${queryString}` : ''}`;
    
    return makeAuthenticatedRequest(url);
  },

  // Get single patient by ID
  async getPatientById(id) {
    return makeAuthenticatedRequest(`/patients/${id}`);
  },

  // Create new patient
  async createPatient(patientData) {
    return makeAuthenticatedRequest('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  },

  // Update patient
  async updatePatient(id, patientData) {
    return makeAuthenticatedRequest(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    });
  },

  // Delete patient (soft delete)
  async deletePatient(id) {
    return makeAuthenticatedRequest(`/patients/${id}`, {
      method: 'DELETE',
    });
  },

  // Search patients
  async searchPatients(searchTerm, limit = 20) {
    return makeAuthenticatedRequest(`/patients/search?limit=${limit}`, {
      method: 'POST',
      body: JSON.stringify({ searchTerm }),
    });
  },

  // Get patient statistics
  async getPatientStatistics() {
    return makeAuthenticatedRequest('/patients/statistics');
  },

  // Reactivate patient
  async reactivatePatient(id) {
    return makeAuthenticatedRequest(`/patients/${id}/reactivate`, {
      method: 'PUT',
    });
  },

  // Export patients
  async exportPatients(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.format) queryParams.append('format', params.format);
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const url = `/patients/export${queryString ? `?${queryString}` : ''}`;
    
    // For export, we need to handle both CSV and JSON responses
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, defaultOptions);

      if (response.status === 401) {
        throw new Error('Authentication required. Please log in to export patient data.');
      }
      if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to export patient data.');
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Check content type to determine how to handle response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      } else {
        // For CSV or other text formats, return as text
        return response.text();
      }
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend server is running.');
      }
      throw error;
    }
  },
};

// Export individual functions for backward compatibility
export const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients,
  getPatientStatistics,
} = patientService;
