// Genders service for CRUD operations
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3200/api';

class GenderService {
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

    // Get all genders with pagination and search
    async getAllGenders(params = {}) {
        const queryParams = new URLSearchParams();
        
        if (params.status) queryParams.append('status', params.status);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.search) queryParams.append('search', params.search);

        const queryString = queryParams.toString();
        const endpoint = `/genders${queryString ? `?${queryString}` : ''}`;

        return this.makeRequest(endpoint, {
            method: 'GET',
        });
    }

    // Get single gender by ID
    async getGenderById(id) {
        return this.makeRequest(`/genders/${id}`, {
            method: 'GET',
        });
    }

    // Create new gender
    async createGender(genderData) {
        return this.makeRequest('/genders', {
            method: 'POST',
            body: JSON.stringify(genderData),
        });
    }

    // Update gender
    async updateGender(id, genderData) {
        return this.makeRequest(`/genders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(genderData),
        });
    }

    // Delete gender
    async deleteGender(id) {
        return this.makeRequest(`/genders/${id}`, {
            method: 'DELETE',
        });
    }

    // Toggle gender status
    async toggleGenderStatus(id) {
        return this.makeRequest(`/genders/${id}/toggle-status`, {
            method: 'PATCH',
        });
    }
}

export default new GenderService();
