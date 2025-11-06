const API_BASE_URL = import.meta.env.VITE_API_URL;

class OrganizationService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/organizations`;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Get current organization
  async getMyOrganization() {
    return this.makeRequest('/my-organization', {
      method: 'GET',
    });
  }

  // Get contract status
  async getContractStatus() {
    return this.makeRequest('/contract-status', {
      method: 'GET',
    });
  }

  // Request contract renewal
  async requestRenewal(data) {
    return this.makeRequest('/request-renewal', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get all organizations (SuperAdmin only)
  async getAllOrganizations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/?${queryString}`, {
      method: 'GET',
    });
  }

  // Update organization
  async updateOrganization(data) {
    return this.makeRequest('/my-organization', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Create organization
  async createOrganization(data) {
    return this.makeRequest('/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update contract (SuperAdmin only)
  async updateContract(organizationId, data) {
    return this.makeRequest(`/${organizationId}/contract`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Approve renewal request (SuperAdmin only)
  async approveRenewal(organizationId, requestId, data) {
    return this.makeRequest(`/${organizationId}/renewal/${requestId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reject renewal request (SuperAdmin only)
  async rejectRenewal(organizationId, requestId, data) {
    return this.makeRequest(`/${organizationId}/renewal/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Extend contract (SuperAdmin only) - Add more time
  async extendContract(organizationId, data) {
    return this.makeRequest(`/${organizationId}/extend`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reduce contract (SuperAdmin only) - Remove time
  async reduceContract(organizationId, data) {
    return this.makeRequest(`/${organizationId}/reduce`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export default new OrganizationService();
