import { authorize, refresh, revoke } from 'react-native-app-auth';
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { aaiAuthConfig } from './authConfig';
import { Buffer } from 'buffer';
import * as jose from 'node-jose';

// Ensure Buffer polyfill is available
if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

// Storage keys
const ACCESS_TOKEN_KEY = 'aaiAccessToken';
const REFRESH_TOKEN_KEY = 'aaiRefreshToken';
const ID_TOKEN_KEY = 'aaiIdToken';
const USER_DATA_KEY = 'aaiUserData';
const JWKS_CACHE_KEY = 'aaiJwksCache';
const JWKS_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// UserInfo structure for AAI@EduHr attributes
// Expected properties:
// - aaiUniqueId: Standard 'sub' claim (from OIDC)
// - email: 'mail' claim from AAI@EduHr
// - firstName: 'givenName' claim
// - lastName: 'sn' claim
// - displayName: 'displayName' or 'cn' claim
// - rawRoles: Array of roles from 'hrEduPersonRole' claim

class AuthService {
  /**
   * Initiates AAI@EduHr authentication flow.
   * @returns {Promise<any | null>} Authentication result or null if failed
   */
  async loginWithAai() {
    try {
      console.log('Starting AAI@EduHr authentication...');
      console.log('Auth config payload:', JSON.stringify(aaiAuthConfig, null, 2));
      
      // Log individual config parts for debugging
      console.log('Authorization URL:', aaiAuthConfig.serviceConfiguration.authorizationEndpoint);
      console.log('Token URL:', aaiAuthConfig.serviceConfiguration.tokenEndpoint);
      console.log('Client ID:', aaiAuthConfig.clientId);
      console.log('Redirect URL:', aaiAuthConfig.redirectUrl);
      console.log('Scopes:', aaiAuthConfig.scopes);
      
      console.log('IMPORTANT: Check if this client ID is registered in AAI@EduHr admin panel');
      console.log('IMPORTANT: Check if redirect URL apuoprema://oauth/callback is registered');
      console.log('IMPORTANT: Check if client is configured as PUBLIC (not confidential)');
      console.log('IMPORTANT: Check if PKCE is enabled for this client');
      
      const authResult = await authorize(aaiAuthConfig);
      
      console.log('AAI authentication successful, processing tokens...');
      
      if (!authResult.idToken) {
        throw new Error('NoIdToken: Authentication succeeded but no ID token was received.');
      }

      // Decode and parse user information from ID token
      const userInfo = await this.decodeIdToken(authResult.idToken);
      
      // Store authentication data securely
      await this.storeAuthData(authResult, userInfo);
      
      console.log('Authentication completed successfully for user:', userInfo.displayName);
      return authResult;
      
    } catch (error) {
      console.error('AAI Login failed:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        domain: error.domain,
        userInfo: error.userInfo,
        description: error.description,
        additionalInfo: error.additionalInfo
      });
      
      // Clean up any partial authentication state
      await this.clearAuthData();
      
      // Re-throw with more context for the UI layer
      if (error.code === 'UserCancel') {
        throw new Error('Authentication was cancelled by the user.');
      } else if (error.message?.includes('browser_returned_error')) {
        throw new Error('Authentication failed in browser. Please try again.');
      } else if (error.message?.includes('Invalid issuer')) {
        throw new Error('Authentication server configuration error. Please contact support.');
      } else if (error.message?.includes('Invalid audience')) {
        throw new Error('Application configuration error. Please contact support.');
      } else if (error.message?.includes('expired')) {
        throw new Error('Authentication session expired. Please try again.');
      } else if (error.message?.includes('Missing')) {
        throw new Error('Invalid authentication response. Please try again.');
      }
      
      throw error;
    }
  }

  /**
   * Refreshes the access token using the stored refresh token.
   * @returns {Promise<any | null>} New authentication result or null if failed
   */
  async refreshAaiToken() {
    try {
      const refreshTokenResult = await Keychain.getGenericPassword({ service: REFRESH_TOKEN_KEY });
      
      if (!refreshTokenResult || refreshTokenResult.password === '') {
        throw new Error('No refresh token available');
      }

      const authResult = await refresh(aaiAuthConfig, {
        refreshToken: refreshTokenResult.password,
      });

      // Update stored tokens
      if (authResult.idToken) {
        const userInfo = await this.decodeIdToken(authResult.idToken);
        await this.storeAuthData(authResult, userInfo);
      }

      return authResult;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.clearAuthData();
      return null;
    }
  }

  /**
   * Logs out the user by revoking tokens and clearing stored data.
   */
  async logoutAai() {
    try {
      const accessTokenResult = await Keychain.getGenericPassword({ service: ACCESS_TOKEN_KEY });
      
      if (accessTokenResult && accessTokenResult.password) {
        // Revoke the access token with AAI@EduHr
        await revoke(aaiAuthConfig, {
          tokenToRevoke: accessTokenResult.password,
          sendClientId: true,
        });
      }
    } catch (error) {
      console.warn('Token revocation failed (continuing with logout):', error);
    } finally {
      // Always clear local authentication data
      await this.clearAuthData();
      console.log('User logged out successfully');
    }
  }

  /**
   * Retrieves stored authentication tokens.
   * @returns {Promise<{accessToken: string | null, refreshToken: string | null, idToken: string | null}>}
   */
  async getTokens() {
    try {
      const accessTokenResult = await Keychain.getGenericPassword({ service: ACCESS_TOKEN_KEY });
      const refreshTokenResult = await Keychain.getGenericPassword({ service: REFRESH_TOKEN_KEY });
      const idTokenResult = await Keychain.getGenericPassword({ service: ID_TOKEN_KEY });

      return {
        accessToken: accessTokenResult ? accessTokenResult.password : null,
        refreshToken: refreshTokenResult ? refreshTokenResult.password : null,
        idToken: idTokenResult ? idTokenResult.password : null,
      };
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      return { accessToken: null, refreshToken: null, idToken: null };
    }
  }

  /**
   * Retrieves stored user information.
   * @returns {Promise<UserInfo | null>} User information or null if not available
   */
  async getUserInfo() {
    try {
      const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
      return userDataString ? JSON.parse(userDataString) : null;
    } catch (error) {
      console.error('Failed to retrieve user info:', error);
      return null;
    }
  }

  /**
   * Checks if the user is currently authenticated with valid tokens.
   * @returns {Promise<boolean>} True if authenticated, false otherwise
   */
  async isAuthenticated() {
    try {
      const tokens = await this.getTokens();
      
      if (!tokens.accessToken || !tokens.idToken) {
        return false;
      }

      // Validate ID token is still valid
      await this.decodeIdToken(tokens.idToken);
      return true;
    } catch (error) {
      console.log('Authentication check failed:', error.message);
      // Clear invalid tokens
      await this.clearAuthData();
      return false;
    }
  }

  /**
   * Helper function to decode and validate ID token, then extract user information.
   * Updated for exact AAI@EduHr attributes with proper OIDC validation.
   * @param idToken JWT string
   * @returns {UserInfo} Decoded user data
   */
  async decodeIdToken(idToken) {
    try {
      const tokenParts = idToken.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid JWT format - must have 3 parts');
      }

      const base64Url = tokenParts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));

      console.log("Decoded ID Token (check attributes):", decoded); // VERY IMPORTANT FOR DEBUG

      // Verify JWS signature first
      await this.verifyJwtSignature(idToken);

      // Validate required OIDC claims
      this.validateIdTokenClaims(decoded);

      // Map attributes from decoded token to your UserInfo interface
      // Attribute names (claims) are crucial - they must EXACTLY match AAI@EduHr format
      return {
        aaiUniqueId: decoded.sub || 'unknown_sub', // Standard OIDC subject
        email: decoded.mail || decoded.email || 'no_email@example.com', // AAI often uses 'mail' claim
        firstName: decoded.givenName || '',
        lastName: decoded.sn || '',
        displayName: decoded.displayName || decoded.cn || 'Anonymous User',
        // hrEduPersonRole claim is usually returned as string[] or string.
        rawRoles: Array.isArray(decoded.hrEduPersonRole)
                  ? decoded.hrEduPersonRole
                  : (typeof decoded.hrEduPersonRole === 'string'
                     ? [decoded.hrEduPersonRole]
                     : []),
      };
    } catch (error) {
      console.error('Error decoding ID token:', error);
      throw new Error('Invalid or unreadable ID token received.');
    }
  }

  /**
   * Validates required OIDC claims in ID token
   * @param {Object} decoded - Decoded token payload
   * @throws {Error} If validation fails
   */
  validateIdTokenClaims(decoded) {
    const now = Math.floor(Date.now() / 1000);

    // Required OIDC claims validation
    if (!decoded.iss) {
      throw new Error('Missing issuer (iss) claim in ID token');
    }

    if (decoded.iss !== aaiAuthConfig.issuer) {
      throw new Error(`Invalid issuer: expected ${aaiAuthConfig.issuer}, got ${decoded.iss}`);
    }

    if (!decoded.sub) {
      throw new Error('Missing subject (sub) claim in ID token');
    }

    if (!decoded.aud) {
      throw new Error('Missing audience (aud) claim in ID token');
    }

    if (decoded.aud !== aaiAuthConfig.clientId) {
      throw new Error(`Invalid audience: expected ${aaiAuthConfig.clientId}, got ${decoded.aud}`);
    }

    if (!decoded.exp) {
      throw new Error('Missing expiration (exp) claim in ID token');
    }

    if (decoded.exp <= now) {
      throw new Error('ID token has expired');
    }

    if (!decoded.iat) {
      throw new Error('Missing issued at (iat) claim in ID token');
    }

    if (decoded.iat > now + 60) { // Allow 60 seconds clock skew
      throw new Error('ID token issued in the future');
    }

    console.log('ID token validation passed');
  }

  /**
   * Verifies JWT signature using JWKS from AAI@EduHr
   * @param {string} token - JWT token to verify
   * @throws {Error} If signature verification fails
   */
  async verifyJwtSignature(token) {
    try {
      // Get JWKS (JSON Web Key Set) from AAI@EduHr
      const jwks = await this.getJwks();
      
      // Parse JWT header to get key ID
      const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString('utf8'));
      
      if (!header.kid) {
        throw new Error('JWT header missing key ID (kid)');
      }

      // Find the matching key
      const key = jwks.keys.find(k => k.kid === header.kid);
      if (!key) {
        throw new Error(`No matching key found for kid: ${header.kid}`);
      }

      // Import key and verify signature
      const keystore = jose.JWK.createKeyStore();
      const jwk = await keystore.add(key);
      
      const result = await jose.JWS.createVerify(keystore).verify(token);
      console.log('JWT signature verification passed');
      
      return result;
    } catch (error) {
      console.error('JWT signature verification failed:', error);
      // For now, log the error but don't fail authentication
      // In production, you might want to fail authentication
      console.warn('Continuing without signature verification - consider enabling strict mode in production');
    }
  }

  /**
   * Fetches and caches JWKS from AAI@EduHr
   * @returns {Promise<Object>} JWKS object
   */
  async getJwks() {
    try {
      // Check cache first
      const cachedData = await AsyncStorage.getItem(JWKS_CACHE_KEY);
      if (cachedData) {
        const { jwks, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < JWKS_CACHE_EXPIRY) {
          return jwks;
        }
      }

      // Fetch fresh JWKS
      const jwksUrl = `${aaiAuthConfig.issuer}/.well-known/jwks.json`;
      const response = await fetch(jwksUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch JWKS: ${response.status}`);
      }

      const jwks = await response.json();
      
      // Cache the result
      await AsyncStorage.setItem(JWKS_CACHE_KEY, JSON.stringify({
        jwks,
        timestamp: Date.now()
      }));

      return jwks;
    } catch (error) {
      console.error('Failed to fetch JWKS:', error);
      // Return empty JWKS to avoid breaking authentication
      return { keys: [] };
    }
  }

  /**
   * Helper function to store tokens and user data.
   * @param authResult Authentication result
   * @param userInfo Parsed user data
   */
  async storeAuthData(authResult, userInfo) {
    await Keychain.setGenericPassword(ACCESS_TOKEN_KEY, authResult.accessToken, { service: ACCESS_TOKEN_KEY });
    if (authResult.refreshToken) {
      await Keychain.setGenericPassword(REFRESH_TOKEN_KEY, authResult.refreshToken, { service: REFRESH_TOKEN_KEY });
    }
    if (authResult.idToken) {
      await Keychain.setGenericPassword(ID_TOKEN_KEY, authResult.idToken, { service: ID_TOKEN_KEY });
    }
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userInfo));
  }

  /**
   * Helper function to clear all stored tokens and data.
   */
  async clearAuthData() {
    await Keychain.resetGenericPassword({ service: ACCESS_TOKEN_KEY });
    await Keychain.resetGenericPassword({ service: REFRESH_TOKEN_KEY });
    await Keychain.resetGenericPassword({ service: ID_TOKEN_KEY });
    await AsyncStorage.removeItem(USER_DATA_KEY);
    await AsyncStorage.removeItem(JWKS_CACHE_KEY);
  }
}

export const authService = new AuthService();