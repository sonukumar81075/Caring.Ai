// SuperAdmin service for user management and analytics
const API_BASE_URL = import.meta.env.VITE_API_URL;

class SuperAdminService {
    constructor() {
        this.baseURL = `${API_BASE_URL}/superadmin`;
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

    // Get dashboard statistics
    async getDashboardStats() {
        return this.makeRequest('/dashboard-stats', {
            method: 'GET',
        });
    }

    // Get all admin users
    async getAllUsers() {
        return this.makeRequest('/users', {
            method: 'GET',
        });
    }

    // Alias for getAllUsers
    async getUsers() {
        return this.getAllUsers();
    }

    // Create new admin user
    async createUser(userData) {
        return this.makeRequest('/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    // Update admin user
    async updateUser(userId, userData) {
        return this.makeRequest(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    }

    // Toggle user active status
    async toggleUserStatus(userId) {
        return this.makeRequest(`/users/${userId}/toggle-status`, {
            method: 'PATCH',
        });
    }

    // Get admin activity logs
    async getAdminActivityLogs(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/activity-logs?${queryString}` : '/activity-logs';
        
        return this.makeRequest(endpoint, {
            method: 'GET',
        });
    }

    // 2FA Management
    async getUserTwoFactorStatus(userId) {
        return this.makeRequest(`/users/${userId}/2fa/status`, {
            method: 'GET',
        });
    }

    async enableUserTwoFactor(userId, data = {}) {
        return this.makeRequest(`/users/${userId}/2fa/enable`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async disableUserTwoFactor(userId, data = {}) {
        return this.makeRequest(`/users/${userId}/2fa/disable`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

export default new SuperAdminService();

