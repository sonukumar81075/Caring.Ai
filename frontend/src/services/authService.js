const API_BASE_URL = import.meta.env.VITE_API_URL;

class AuthService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/auth`;
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

  // Login with support for 2FA and Captcha
  async login(credentials, additionalData = {}) {
    const loginData = {
      email: credentials.email,
      password: credentials.password,
      ...additionalData // This can include twoFactorCode, backupCode, captchaSessionId, captchaAnswer, isUnlock
    };

    return this.makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  // Initial login attempt (email + password only)
  async attemptLogin(email, password) {
    try {
      const response = await this.login({ email, password });
      
      // Check if additional verification is required
      if (response.requiresTwoFactor) {
        return {
          success: false,
          requiresTwoFactor: true,
          twoFactorEnabled: response.twoFactorEnabled
        };
      }
      
      if (response.requiresCaptcha) {
        return {
          success: false,
          requiresCaptcha: true,
          captchaSessionId: response.captchaSessionId,
          challenge: response.challenge
        };
      }
      
      // Login successful
      return {
        success: true,
        user: response.user,
        message: response.message
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Submit captcha answer
  async submitCaptcha(email, password, captchaSessionId, captchaAnswer) {
    try {
      const response = await this.login(
        { email, password },
        { captchaSessionId, captchaAnswer }
      );
      
      return {
        success: true,
        user: response.user,
        message: response.message
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        requiresCaptcha: error.data?.requiresCaptcha || false,
        attemptsLeft: error.data?.attemptsLeft
      };
    }
  }

  // Submit 2FA code
  async submitTwoFactor(email, password, twoFactorCode) {
    try {
      const response = await this.login(
        { email, password },
        { twoFactorCode }
      );
      
      return {
        success: true,
        user: response.user,
        message: response.message
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        requiresTwoFactor: error.data?.requiresTwoFactor || false
      };
    }
  }

  // Submit backup code
  async submitBackupCode(email, password, backupCode) {
    try {
      const response = await this.login(
        { email, password },
        { backupCode }
      );
      
      return {
        success: true,
        user: response.user,
        message: response.message
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        requiresTwoFactor: error.data?.requiresTwoFactor || false
      };
    }
  }

  // Other auth methods
  async logout() {
    return this.makeRequest('/logout', { method: 'POST' });
  }

  async getCurrentUser() {
    return this.makeRequest('/me', { method: 'GET' });
  }

  async signup(userData) {
    return this.makeRequest('/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async forgotPassword(email) {
    return this.makeRequest('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, password) {
    return this.makeRequest(`/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async verifyEmail(token) {
    return this.makeRequest(`/verify/${token}`, {
      method: 'GET',
    });
  }

  async checkAuth() {
    try {
      const response = await this.makeRequest('/me', { method: 'GET' });
      return response.user;
    } catch (error) {
      console.error('Auth check failed:', error);
      return null;
    }
  }

  // 2FA Methods
  async setupTwoFactor() {
    return this.makeRequest('/2fa/setup', {
      method: 'POST',
    });
  }

  async verifyAndEnableTwoFactor(code) {
    return this.makeRequest('/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ twoFactorCode:code }),
    });
  }

  async disableTwoFactor(password, twoFactorCode = null) {
    return this.makeRequest('/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ password, twoFactorCode }),
    });
  }

  async getTwoFactorStatus() {
    try {
      const response = await this.makeRequest('/2fa/status', {
        method: 'GET',
      });
      console.log('AuthService: 2FA Status Response:', response);
      return response;
    } catch (error) {
      console.error('AuthService: 2FA Status Error:', error);
      throw error;
    }
  }

  async getLoginHistory() {
    return this.makeRequest('/login-history', {
      method: 'GET',
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.makeRequest('/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }
}

export default new AuthService();