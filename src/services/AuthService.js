import AsyncStorage from '@react-native-async-storage/async-storage';
import { aaiAuthConfig } from './authConfig';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Storage keys
const USER_DATA_KEY = 'aai_user_data';
const TOKENS_KEY = 'aai_tokens';

class AuthService {
  /**
   * AAI@EduHr OIDC Authentication
   */
  async login() {
    try {
      // Clear any existing auth state first
      await this.logout();

      // Configure WebBrowser for better popup handling
      WebBrowser.maybeCompleteAuthSession();

      // Create the authorization request
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'apuoprema',
        path: 'oauth/callback'
      });

      const authRequestConfig = {
        clientId: aaiAuthConfig.clientId,
        scopes: aaiAuthConfig.scopes,
        responseType: AuthSession.ResponseType.Code,
        redirectUri: redirectUri,
        usePKCE: true,
        additionalParameters: aaiAuthConfig.additionalParameters || {},
      };

      const authRequest = new AuthSession.AuthRequest(authRequestConfig);

      // Discover the authorization endpoint
      const discoveryResult = await AuthSession.fetchDiscoveryAsync(aaiAuthConfig.issuer);

      // Start the authorization flow
      const authResult = await authRequest.promptAsync(discoveryResult, {
        useProxy: false, // Important for Expo managed workflow
        showInRecents: false
      });

      if (authResult.type !== 'success') {
        throw new Error(`Authentication cancelled or failed: ${authResult.type}`);
      }

      if (!authResult.params?.code) {
        throw new Error('No authorization code received');
      }

      // Manual token exchange (AAI@EduHr specific requirements)
      const tokenRequestBody = new URLSearchParams({
        grant_type: 'authorization_code',
        code: authResult.params.code,
        redirect_uri: redirectUri,
        client_id: aaiAuthConfig.clientId,
        code_verifier: authRequest.codeVerifier, // PKCE verifier
      });

      const tokenResponse = await fetch(discoveryResult.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: tokenRequestBody.toString(),
      });

      const tokenResponseText = await tokenResponse.text();

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokenResponse.status} - ${tokenResponseText}`);
      }

      const tokenResult = JSON.parse(tokenResponseText);

      if (!tokenResult.access_token) {
        throw new Error('No access token received');
      }

      // Get user info from userinfo endpoint (more reliable than ID token)
      let userInfo = {};

      try {
        console.log('Fetching user info from AAI@EduHr userinfo endpoint:', discoveryResult.userInfoEndpoint);
        const userInfoResponse = await fetch(discoveryResult.userInfoEndpoint, {
          headers: {
            'Authorization': `Bearer ${tokenResult.access_token}`,
          },
        });

        if (userInfoResponse.ok) {
          const userInfoData = await userInfoResponse.json();
          console.log('Raw userinfo response:', userInfoData);

          userInfo = {
            sub: userInfoData.sub || userInfoData.hrEduPersonUniqueID,
            email: userInfoData.email || userInfoData.mail,
            name: userInfoData.name || userInfoData.displayName || `${userInfoData.given_name || ''} ${userInfoData.family_name || ''}`.trim(),
            givenName: userInfoData.given_name || userInfoData.givenName,
            familyName: userInfoData.family_name || userInfoData.sn,
            roles: userInfoData.hrEduPersonRole || ['student'],
            hrEduPersonUniqueID: userInfoData.hrEduPersonUniqueID,
            hrEduPersonAffiliation: userInfoData.hrEduPersonAffiliation,
            hrEduPersonHomeOrg: userInfoData.hrEduPersonHomeOrg,
            nickname: userInfoData.nickname,
            preferredUsername: userInfoData.preferred_username
          };
        } else {
          console.log('Userinfo endpoint failed, trying ID token...');
          userInfo = this.parseIdToken(tokenResult.id_token);
        }
      } catch (userInfoError) {
        console.log('Could not fetch user info, trying ID token fallback');
        userInfo = this.parseIdToken(tokenResult.id_token);
      }

      // Final fallback
      if (!userInfo.sub) {
        console.log('No user data available, using minimal fallback');
        userInfo = {
          sub: `aai_user_${Date.now()}`,
          email: 'user@apu.hr',
          name: 'AAI User',
          givenName: 'AAI',
          familyName: 'User',
          roles: ['student']
        };
      }

      // Store tokens and user data
      await AsyncStorage.setItem(TOKENS_KEY, JSON.stringify({
        accessToken: tokenResult.access_token,
        refreshToken: tokenResult.refresh_token,
        idToken: tokenResult.id_token
      }));

      // Sync user with backend
      try {
        console.log('Syncing user with backend...');
        const backendResponse = await this.syncUserWithBackend(userInfo, tokenResult.access_token);

        // Update user info with backend data and use backend token for API calls
        userInfo.backendUser = backendResponse.user;

        // Store backend token for API authentication
        await AsyncStorage.setItem(TOKENS_KEY, JSON.stringify({
          accessToken: backendResponse.token, // Use backend JWT token
          refreshToken: tokenResult.refresh_token,
          idToken: tokenResult.id_token,
          aaiAccessToken: tokenResult.access_token // Keep original AAI token
        }));

        console.log('Backend sync successful');
      } catch (backendError) {
        console.log('Backend sync failed:', backendError.message);
        console.log('Continuing with AAI-only authentication');
      }

      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userInfo));

      console.log('AAI@EduHr Authentication Successful!');
      console.log('Token Data:', {
        hasAccessToken: !!tokenResult.access_token,
        hasIdToken: !!tokenResult.id_token,
        hasRefreshToken: !!tokenResult.refresh_token,
        tokenType: tokenResult.token_type,
        expiresIn: tokenResult.expires_in
      });

      console.log('Final User Info:', {
        userId: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        givenName: userInfo.givenName,
        familyName: userInfo.familyName,
        roles: userInfo.roles,
        uniqueID: userInfo.hrEduPersonUniqueID,
        affiliation: userInfo.hrEduPersonAffiliation,
        homeOrg: userInfo.hrEduPersonHomeOrg
      });

      return tokenResult;

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
      if (!idToken || typeof idToken !== 'string') {
        throw new Error('Invalid ID token format');
      }

      const parts = idToken.split('.');
      if (parts.length !== 3) {
        throw new Error('ID token should have 3 parts');
      }

      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));

      return {
        sub: decoded.sub || 'unknown_user',
        email: decoded.email || decoded.mail || 'user@apu.hr',
        name: decoded.name || decoded.displayName || 'AAI User',
        givenName: decoded.given_name || decoded.givenName || 'User',
        familyName: decoded.family_name || decoded.sn || 'AAI',
        roles: decoded.hrEduPersonRole || decoded.roles || ['student']
      };
    } catch (error) {
      console.error('Failed to parse ID token:', error);
      // Return fallback user info instead of empty object
      return {
        sub: `fallback_user_${Date.now()}`,
        email: 'user@apu.hr',
        name: 'AAI User',
        givenName: 'User',
        familyName: 'AAI',
        roles: ['student']
      };
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
    // Use consistent userId for each role to maintain same user
    const userId = role === 'staff' ? '1005' : '1001'; // Fixed IDs

    const mockUser = {
      sub: `dev_${role}_${userId}`,
      userId: `mock_user_${userId}`, // Match backend auth middleware format
      email: `${role}@apu.hr`,
      name: role === 'staff' ? 'Test Staff' : 'Test Student',
      givenName: 'Test',
      familyName: role === 'staff' ? 'Staff' : 'Student',
      roles: role === 'staff' ? ['nastavnik'] : ['student']
    };

    const mockTokens = {
      accessToken: `dev_access_${userId}`,
      refreshToken: `dev_refresh_${userId}`,
      idToken: `dev_id_${userId}`
    };

    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(mockUser));
    await AsyncStorage.setItem(TOKENS_KEY, JSON.stringify(mockTokens));

    console.log(`DEV: Logged in as ${role.toUpperCase()} with consistent userId: ${userId}`);
    return mockTokens;
  }

  // Quick role switcher for development
  async switchToStaff() {
    console.log('Switching to STAFF role for testing...');
    return await this.loginDev('staff');
  }

  async switchToStudent() {
    console.log('Switching to STUDENT role for testing...');
    return await this.loginDev('student');
  }

  /**
   * Sync AAI user with backend
   */
  async syncUserWithBackend(userInfo, aaiToken) {
    try {
      const response = await fetch('http://YOUR_LOCAL_IP:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInfo,
          aaiToken
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Backend sync failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Backend user created/updated:', data.user);

      return data;
    } catch (error) {
      console.error('Backend sync error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();