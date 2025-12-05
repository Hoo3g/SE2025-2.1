import { Configuration } from 'oidc-provider';

export const oidcConfig: Configuration = {
  // Clients (mỗi client tự khai báo response_types, grant_types, URIs)
  clients: [
    {
      client_id: 'example_client',
      client_secret: 'example_secret',
      redirect_uris: ['http://localhost:3001/callback'],
      post_logout_redirect_uris: ['http://localhost:3001/logout-callback'],
      response_types: ['code'], // dùng Authorization Code + PKCE
      grant_types: ['authorization_code', 'refresh_token'],
      // Không cần 'scope' ở đây; client yêu cầu scope trong request authorize
      token_endpoint_auth_method: 'client_secret_basic',
    },
  ],

  // Tính năng
  features: {
    devInteractions: { enabled: true }, // tắt khi lên production
    rpInitiatedLogout: { enabled: true },
    introspection: { enabled: true },
    revocation: { enabled: true },
    clientCredentials: { enabled: true },
    registration: { enabled: false },
  },

  // Scopes & claims (chuẩn OIDC)
  scopes: ['openid', 'offline_access', 'email', 'profile'],

  claims: {
    openid: ['sub'],
    email: ['email', 'email_verified'],
    profile: ['name', 'preferred_username', 'updated_at'],
  },

  // TTL cho token
  ttl: {
    AccessToken: 60 * 60,          // 1 giờ
    AuthorizationCode: 10 * 60,    // 10 phút
    IdToken: 60 * 60,              // 1 giờ
    DeviceCode: 10 * 60,           // 10 phút
    RefreshToken: 30 * 24 * 60 * 60, // 30 ngày
  },

  // JWKS (DEV ONLY: không hard-code private key ở prod)
  jwks: {
    keys: [
      {
        kty: 'RSA',
        kid: '1',
        n: '...',
        e: 'AQAB',
        d: '...',
        p: '...',
        q: '...',
        dp: '...',
        dq: '...',
        qi: '...',
      },
    ],
  },

  // Cookie
  cookies: {
    keys: [
      'cookie-secret-1',
      'cookie-secret-2', // thêm key để hỗ trợ rotation
    ],
  },

  // Cho phép claim ngoài chuẩn (nếu bạn cần)
  conformIdTokenClaims: false,

  // Refresh token rotation
  rotateRefreshToken: true,
};
