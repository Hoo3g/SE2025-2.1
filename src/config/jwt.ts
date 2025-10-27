export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';

// JWT configuration
export const JWT_CONFIG = {
  accessToken: {
    expiresIn: '1h',
    algorithm: 'HS256'
  },
  refreshToken: {
    expiresIn: '30d',
    algorithm: 'HS256'
  }
};