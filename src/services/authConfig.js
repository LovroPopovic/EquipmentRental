// AAI@EduHr OIDC Configuration
// Using TEST environment (AAI@EduHr Lab) as per SRCE admin guidance

export const aaiAuthConfig = {
  // TEST Environment - AAI@EduHr Lab
  issuer: 'https://fed-lab.aaiedu.hr',
  clientId: 'YOUR_AAI_CLIENT_ID',
  redirectUrl: 'apuoprema://oauth/callback',

  scopes: ['openid', 'profile', 'email', 'hrEduPersonRole'],

  discoveryUrl: 'https://fed-lab.aaiedu.hr/.well-known/openid-configuration',

  usePKCE: true,
  useNonce: true,

  additionalParameters: {},
};