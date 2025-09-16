import { authorize, refresh } from 'react-native-app-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { aaiAuthConfig } from './authConfig';

// Storage keys
const USER_DATA_KEY = 'aai_user_data';
const TOKENS_KEY = 'aai_tokens';

class AuthService {
  /**
   * AAI@EduHr OIDC Authentication
   */
  async login() {
    try {
      console.log('Starting AAI@EduHr authentication...');

      const result = await authorize(aaiAuthConfig);

      if (!result.idToken) {
        throw new Error('No ID token received from AAI@EduHr');
      }

      // Parse user info from ID token
      const userInfo = this.parseIdToken(result.idToken);

      // Store tokens and user data
      await AsyncStorage.setItem(TOKENS_KEY, JSON.stringify({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        idToken: result.idToken
      }));

      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userInfo));

      console.log('Authentication successful');
      return result;

    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error(`AAI@EduHr authentication failed: ${error.message}`);
    }
  }

  /**
   * Logout from AAI@EduHr
   */
  async logout() {
    try {
      // AAI@EduHr doesn't support token revocation endpoint
      // Just clear local data - tokens will expire naturally
      await AsyncStorage.removeItem(TOKENS_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    try {
      const tokens = await this.getStoredTokens();
      const userInfo = await this.getUserInfo();

      return !!(tokens?.accessToken && userInfo);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get stored user information
   */
  async getUserInfo() {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get stored tokens
   */
  async getStoredTokens() {
    try {
      const tokens = await AsyncStorage.getItem(TOKENS_KEY);
      return tokens ? JSON.parse(tokens) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Parse user info from ID token (simple base64 decode)
   */
  parseIdToken(idToken) {
    try {
      const payload = idToken.split('.')[1];
      const decoded = JSON.parse(atob(payload));

      return {
        sub: decoded.sub,
        email: decoded.email || decoded.mail,
        name: decoded.name || decoded.displayName,
        givenName: decoded.given_name || decoded.givenName,
        familyName: decoded.family_name || decoded.sn,
        roles: decoded.hrEduPersonRole || []
      };
    } catch (error) {
      console.error('Failed to parse ID token:', error);
      return {};
    }
  }

  /**
   * Determine user role from hrEduPersonRole
   */
  async getUserRole() {
    try {
      const userInfo = await this.getUserInfo();
      if (!userInfo?.roles || userInfo.roles.length === 0) {
        return 'student'; // Default to student
      }

      const roles = Array.isArray(userInfo.roles) ? userInfo.roles : [userInfo.roles];

      // Check for staff/teacher roles
      const staffRoles = ['nastavnik', 'profesor', 'asistent', 'demonstrator', 'admin'];
      const isStaff = roles.some(role =>
        staffRoles.some(staffRole =>
          role.toLowerCase().includes(staffRole.toLowerCase())
        )
      );

      return isStaff ? 'staff' : 'student';
    } catch (error) {
      console.error('Error determining user role:', error);
      return 'student';
    }
  }

  // Development helpers
  async loginDev(role = 'student') {
    const mockUser = {
      sub: `dev_${role}_${Date.now()}`,
      email: `${role}@apu.hr`,
      name: role === 'staff' ? 'Test Staff' : 'Test Student',
      givenName: 'Test',
      familyName: role === 'staff' ? 'Staff' : 'Student',
      roles: role === 'staff' ? ['nastavnik'] : ['student']
    };

    const mockTokens = {
      accessToken: `dev_access_${Date.now()}`,
      refreshToken: `dev_refresh_${Date.now()}`,
      idToken: `dev_id_${Date.now()}`
    };

    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(mockUser));
    await AsyncStorage.setItem(TOKENS_KEY, JSON.stringify(mockTokens));

    return mockTokens;
  }
}

export const authService = new AuthService();