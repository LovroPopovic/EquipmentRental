import Constants from 'expo-constants';

// Get configuration from app.json extra field
const getAuthConfig = () => {
  const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};
  const aaiConfig = extra.aaiAuthConfig || {};
  
  // Fallback values for development
  const clientId = aaiConfig.clientId || 'YOUR_AAI_CLIENT_ID';
  const issuer = aaiConfig.issuer || 'https://login.aaiedu.hr';
  
  if (!aaiConfig.clientId) {
    console.warn('AAI Client ID not found in app.json extra.aaiAuthConfig, using fallback');
  }
  
  return {
    issuer,
    clientId,
    // No clientSecret for public client
    redirectUrl: 'apuoprema://oauth/callback',
    scopes: ['openid', 'profile', 'email', 'hrEduPersonRole'],
    
    // Explicit AAI@EduHr endpoints (since auto-discovery fails)
    serviceConfiguration: {
      authorizationEndpoint: `${issuer}/sso/module.php/oidc/authorize.php`,
      tokenEndpoint: `${issuer}/sso/module.php/oidc/token.php`,
      revocationEndpoint: `${issuer}/sso/module.php/oidc/logout.php`,
    },
    
    // Per AAI@EduHr requirements for public client
    useNonce: true,
    usePKCE: true, // Required for public clients
    additionalParameters: {},
  };
};

export const aaiAuthConfig = getAuthConfig();