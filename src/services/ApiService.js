import { authService } from './AuthService';

// API Configuration
const API_CONFIG = {
  BASE_URL: __DEV__ ? 'http://YOUR_LOCAL_IP:3000/api' : 'https://your-production-api.com/api',
  TIMEOUT: 10000,
};

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  /**
   * Make authenticated API request
   */
  async request(endpoint, options = {}) {
    try {
      // Get auth token
      const tokens = await authService.getStoredTokens();
      const accessToken = tokens?.accessToken;

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Add auth header if we have a token
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
        console.log('API request with token:', accessToken.substring(0, 20) + '...');
      } else {
        console.log('API request without token');
      }

      // Make request
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        timeout: API_CONFIG.TIMEOUT,
        ...options,
        headers,
      });

      // Handle response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || errorData.message || `API Error: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Equipment API Methods
  async getEquipment(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/equipment${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getEquipmentById(id) {
    return this.request(`/equipment/${id}`);
  }

  async createEquipment(equipmentData) {
    return this.request('/equipment', {
      method: 'POST',
      body: JSON.stringify(equipmentData),
    });
  }

  async updateEquipment(id, updates) {
    return this.request(`/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteEquipment(id) {
    return this.request(`/equipment/${id}`, {
      method: 'DELETE',
    });
  }

  // Booking API Methods
  async getBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/bookings${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getUserBookings(userId) {
    return this.request(`/bookings/user/${userId}`);
  }

  async createBooking(bookingData) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBookingStatus(bookingId, status, staffNote = null) {
    const requestBody = { status };
    if (staffNote && staffNote.trim()) {
      requestBody.staffNote = staffNote.trim();
    }

    return this.request(`/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify(requestBody),
    });
  }

  async cancelBooking(bookingId) {
    return this.request(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
  }

  // User API Methods
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getUserById(userId) {
    return this.request(`/users/${userId}`);
  }

  async updateUser(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Dashboard Stats API Methods
  async getDashboardStats() {
    return this.request('/stats/dashboard');
  }

  async getRecentActivity() {
    return this.request('/stats/activity');
  }

  // Authentication API Methods
  async verifyToken(userInfo) {
    return this.request('/auth/verify-token', {
      method: 'POST',
      body: JSON.stringify({ userInfo }),
    });
  }

  async refreshAuthToken(refreshToken) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }
}

export const apiService = new ApiService();