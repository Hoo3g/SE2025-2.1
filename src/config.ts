export const BASE_URL = process.env.BASE_URL || 'https://id.asset3d.io';
export const JWT_ISSUER = BASE_URL;
export const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'asset3d-clients';
export const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@asset3d.io';
export const TOKEN_TTL_SEC = 3600;
