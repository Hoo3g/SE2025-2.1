export const oidcConfig = {
  clients: [{
    client_id: 'example-client',
    client_secret: 'example-secret',
    redirect_uris: ['http://localhost:3001/callback'],
    response_types: ['code'],
    grant_types: ['authorization_code', 'refresh_token'],
    token_endpoint_auth_method: 'client_secret_basic'
  }],
  
  // Claims configuration
  claims: {
    openid: ['sub'],
    profile: ['name', 'email', 'email_verified'],
  },

  // Features configuration
  features: {
    devInteractions: { enabled: false },
    encryption: { enabled: true },
    introspection: { enabled: true },
    revocation: { enabled: true },
  },

  // TTL configuration
  ttl: {
    AccessToken: 1 * 60 * 60, // 1 hour in seconds
    AuthorizationCode: 10 * 60, // 10 minutes in seconds
    IdToken: 1 * 60 * 60, // 1 hour in seconds
    RefreshToken: 1 * 24 * 60 * 60, // 1 day in seconds
  },

  // Cookie keys
  cookies: {
    keys: ['some-secure-key-1', 'some-secure-key-2']
  }
};