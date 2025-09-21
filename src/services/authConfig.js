// AAI@EduHr OIDC Configuration
// Using TEST environment (AAI@EduHr Lab) as per SRCE admin guidance

export const aaiAuthConfig = {
  // TEST Environment - AAI@EduHr Lab
  issuer: 'https://fed-lab.aaiedu.hr',
  clientId: 'YOUR_AAI_CLIENT_ID',
  redirectUrl: 'apuoprema://oauth/callback',

  scopes: [
    'openid',
    'profile',
    'email',
    'hrEduPersonRole',           // Staff vs Student role detection
    'hrEduPersonUniqueID',       // Unique university ID
    'givenName',                 // First name
    'sn',                        // Last name (surname)
    'displayName',               // Full display name
    'hrEduPersonAffiliation',    // University affiliation
    'hrEduPersonHomeOrg'         // Home organization
  ],

  discoveryUrl: 'https://fed-lab.aaiedu.hr/.well-known/openid-configuration',

  usePKCE: true,
  useNonce: false, // Try disabling nonce

  additionalParameters: {
    prompt: 'login' // Force fresh login
  },

  // Add timeout settings
  connectionTimeoutSeconds: 30,
  readTimeoutSeconds: 30,
};