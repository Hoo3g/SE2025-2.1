// For development, always use localhost
const DEV_MODE = process.env.NODE_ENV !== 'production';
export const BASE_URL = DEV_MODE ? 'http://localhost:3000' : (process.env.BASE_URL || 'https://id.asset3d.io');
export const JWT_ISSUER = BASE_URL;
export const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'asset3d-clients';
export const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@asset3d.io';
export const TOKEN_TTL_SEC = 3600;
// Identity Provider issuer URL (external IdP like id.asset3d.io)
export const IDP_ISSUER = process.env.IDP_ISSUER || 'https://id.asset3d.io';
