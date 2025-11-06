const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3200/api';

const makeAuthenticatedRequest = async (url, options = {}) => {
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, { ...defaultOptions, ...options });

    if (response.status === 401) {
      throw new Error('Authentication required. Please log in to access doctor data.');
    }
    if (response.status === 403) {
      throw new Error('Access denied. You do not have permission to access doctor data.');
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please ensure the backend server is running.');
    }
    throw error;
  }
};

export const doctorService = {
  // Get all doctors
  getDoctors: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const url = `/doctors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return makeAuthenticatedRequest(url);
  },

  // Get single doctor by ID
  getDoctorById: async (id) => {
    return makeAuthenticatedRequest(`/doctors/${id}`);
  },

  // Create new doctor
  createDoctor: async (doctorData) => {
    return makeAuthenticatedRequest('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });
  },

  // Update doctor
  updateDoctor: async (id, doctorData) => {
    return makeAuthenticatedRequest(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(doctorData),
    });
  },

  // Delete doctor
  deleteDoctor: async (id) => {
    return makeAuthenticatedRequest(`/doctors/${id}`, {
      method: 'DELETE',
    });
  },

  // Get doctor statistics
  getDoctorStats: async () => {
    return makeAuthenticatedRequest('/doctors/stats');
  },

  // Reactivate doctor
  reactivateDoctor: async (id) => {
    return makeAuthenticatedRequest(`/doctors/${id}/reactivate`, {
      method: 'PUT',
    });
  },

  // Export doctors
  exportDoctors: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.format) queryParams.append('format', params.format);
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const url = `/doctors/export${queryString ? `?${queryString}` : ''}`;
    
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
        throw new Error('Authentication required. Please log in to export doctor data.');
      }
      if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to export doctor data.');
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
