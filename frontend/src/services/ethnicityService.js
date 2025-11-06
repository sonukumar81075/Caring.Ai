// Ethnicities service for CRUD operations
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3200/api';

class EthnicityService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Make authenticated requests with credentials
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            credentials: 'include', // Include cookies
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Get all ethnicities with pagination and search
    async getAllEthnicities(params = {}) {
        const queryParams = new URLSearchParams();
        
        if (params.status) queryParams.append('status', params.status);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.search) queryParams.append('search', params.search);

        const queryString = queryParams.toString();
        const endpoint = `/ethnicities${queryString ? `?${queryString}` : ''}`;

        return this.makeRequest(endpoint, {
            method: 'GET',
        });
    }

    // Get single ethnicity by ID
    async getEthnicityById(id) {
        return this.makeRequest(`/ethnicities/${id}`, {
            method: 'GET',
        });
    }

    // Create new ethnicity
    async createEthnicity(ethnicityData) {
        return this.makeRequest('/ethnicities', {
            method: 'POST',
            body: JSON.stringify(ethnicityData),
        });
    }

    // Update ethnicity
    async updateEthnicity(id, ethnicityData) {
        return this.makeRequest(`/ethnicities/${id}`, {
            method: 'PUT',
            body: JSON.stringify(ethnicityData),
        });
    }

    // Delete ethnicity
    async deleteEthnicity(id) {
        return this.makeRequest(`/ethnicities/${id}`, {
            method: 'DELETE',
        });
    }

    // Toggle ethnicity status
    async toggleEthnicityStatus(id) {
        return this.makeRequest(`/ethnicities/${id}/toggle-status`, {
            method: 'PATCH',
        });
    }
}

export default new EthnicityService();
