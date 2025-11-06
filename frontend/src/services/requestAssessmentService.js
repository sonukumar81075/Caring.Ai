// Request Assessment service for API communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3200/api';

class RequestAssessmentService {
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
                // Create an error object that preserves the full response data
                const error = new Error(data.message || `HTTP error! status: ${response.status}`);
                error.response = { data, status: response.status };
                throw error;
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Create a new assessment request
    async createRequestAssessment(data) {
        try {
            return await this.makeRequest('/request-assessments', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        } catch (error) {
            console.error('Error creating assessment request:', error);
            throw error;
        }
    }

    // Get all assessment requests with pagination and filtering
    async getRequestAssessments(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            // Add pagination params
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            
            // Add search param (comprehensive search across multiple fields)
            if (params.search) queryParams.append('search', params.search);
            
            // Add filter params
            if (params.status) queryParams.append('status', params.status);
            if (params.patientName) queryParams.append('patientName', params.patientName);
            if (params.assessmentType) queryParams.append('assessmentType', params.assessmentType);
            if (params.assigningPhysician) queryParams.append('assigningPhysician', params.assigningPhysician);
            if (params.startDate) queryParams.append('startDate', params.startDate);
            if (params.endDate) queryParams.append('endDate', params.endDate);

            const endpoint = `/request-assessments?${queryParams.toString()}`;
            return await this.makeRequest(endpoint, { method: 'GET' });
        } catch (error) {
            console.error('Error fetching assessment requests:', error);
            throw error;
        }
    }

    // Get assessment request by ID
    async getRequestAssessmentById(id) {
        try {
            return await this.makeRequest(`/request-assessments/${id}`, { method: 'GET' });
        } catch (error) {
            console.error('Error fetching assessment request:', error);
            throw error;
        }
    }

    // Update assessment request status
    async updateRequestAssessmentStatus(id, status, notes = '') {
        try {
            return await this.makeRequest(`/request-assessments/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status, notes }),
            });
        } catch (error) {
            console.error('Error updating assessment request status:', error);
            throw error;
        }
    }

    // Delete assessment request
    async deleteRequestAssessment(id) {
        try {
            return await this.makeRequest(`/request-assessments/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Error deleting assessment request:', error);
            throw error;
        }
    }

    // Get assessment request statistics
    async getRequestAssessmentStats(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (params.startDate) queryParams.append('startDate', params.startDate);
            if (params.endDate) queryParams.append('endDate', params.endDate);

            const endpoint = `/request-assessments/stats/summary?${queryParams.toString()}`;
            return await this.makeRequest(endpoint, { method: 'GET' });
        } catch (error) {
            console.error('Error fetching assessment request statistics:', error);
            throw error;
        }
    }

    // Get assessment results for Assessment Results & Management page
    async getAssessmentResults(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            // Add pagination params
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            
            // Add search param (comprehensive search across multiple fields)
            if (params.search) queryParams.append('search', params.search);
            
            // Add filter params
            if (params.status) queryParams.append('status', params.status);
            if (params.patientName) queryParams.append('patientName', params.patientName);
            if (params.assessmentType) queryParams.append('assessmentType', params.assessmentType);
            if (params.assigningPhysician) queryParams.append('assigningPhysician', params.assigningPhysician);
            if (params.startDate) queryParams.append('startDate', params.startDate);
            if (params.endDate) queryParams.append('endDate', params.endDate);

            const endpoint = `/request-assessments/results?${queryParams.toString()}`;
            return await this.makeRequest(endpoint, { method: 'GET' });
        } catch (error) {
            console.error('Error fetching assessment results:', error);
            throw error;
        }
    }

    // Get assessment questions by call ID
    async getAssessmentQuestions(callId) {
        try {
            return await this.makeRequest(`/request-assessments/questions/${callId}`, { method: 'GET' });
        } catch (error) {
            console.error('Error fetching assessment questions:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
const requestAssessmentService = new RequestAssessmentService();
export default requestAssessmentService;
