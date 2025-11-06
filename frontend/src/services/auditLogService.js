// Audit Logs service for real API communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3200/api';

class AuditLogService {
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
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Get all audit logs with pagination and filtering
    async getAuditLogs(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            // Add pagination params
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            
            // Add search and filter params
            if (params.search) queryParams.append('search', params.search);
            if (params.action) queryParams.append('action', params.action);
            if (params.recordType) queryParams.append('recordType', params.recordType);
            if (params.startDate) queryParams.append('startDate', params.startDate);
            if (params.endDate) queryParams.append('endDate', params.endDate);
            
            // Add sorting params
            if (params.sortBy) queryParams.append('sortBy', params.sortBy);
            if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

            const endpoint = `/audit-logs?${queryParams.toString()}`;
            return await this.makeRequest(endpoint, { method: 'GET' });
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            throw error;
        }
    }

    // Get audit log by ID
    async getAuditLogById(id) {
        try {
            return await this.makeRequest(`/audit-logs/${id}`, { method: 'GET' });
        } catch (error) {
            console.error('Error fetching audit log:', error);
            throw error;
        }
    }

    // Get audit log statistics
    async getAuditLogStats(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (params.startDate) queryParams.append('startDate', params.startDate);
            if (params.endDate) queryParams.append('endDate', params.endDate);

            const endpoint = `/audit-logs/stats/summary?${queryParams.toString()}`;
            return await this.makeRequest(endpoint, { method: 'GET' });
        } catch (error) {
            console.error('Error fetching audit log statistics:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
const auditLogService = new AuditLogService();
export default auditLogService;
