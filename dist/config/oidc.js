export const oidcConfig = {
    // Basic configuration
    clients: [{
            client_id: 'example_client',
            client_secret: 'example_secret',
            redirect_uris: ['http://localhost:3001/callback'],
            response_types: ['code'],
            grant_types: ['authorization_code', 'refresh_token'],
            scope: 'openid profile email'
        }],
    // Enable development interactions for testing
    features: {
        devInteractions: { enabled: true }, // Enable default interaction pages for testing
        rpInitiatedLogout: { enabled: true },
        introspection: { enabled: true },
        revocation: { enabled: true },
        clientCredentials: { enabled: true },
        registration: { enabled: false }
    },
    // Cấu hình claims
    claims: {
        openid: ['sub'],
        profile: ['name', 'email', 'email_verified'],
    },
    // Cấu hình token
    ttl: {
        AccessToken: 1 * 60 * 60, // 1 giờ
        AuthorizationCode: 10 * 60, // 10 phút
        IdToken: 1 * 60 * 60, // 1 giờ
        DeviceCode: 10 * 60, // 10 phút
        RefreshToken: 30 * 24 * 60 * 60, // 30 ngày
    },
    // JWT Signing Key Configuration
    jwks: {
        keys: [{
                kty: 'RSA',
                kid: '1',
                n: 'wYrXh4-wDtTS7tPVxNdKYhWxDwKqkwcGYcgQWq6Hf9BX_mecpHDhYhX0F_hAGxXYvwEcA8qIC2BpmN9HAaDwqnVo2_GZgImWYXHer0bJrSKpE0kXhxvL_DLfNxPOzqMGy3yx9kl8HLwqSvmeh3zDRWJuH9QRZQEXSkFZYH0rKBEARl4KTvAXOVrHpxWGyIz_h13Ru2Y0aZ1rNaWTn1StRLbcWHzHE5e7ZpIkF-H8jPlW7LqKBj_KDZ8y6IxJX9l-QjvL3LGOi9GCONZlcmNqjgpxVAcmXUZSqDFDhxhXAbi8N_fzpUuC_dXlOZDcr_BWR9zCW54AOVhGWcYeGE7BZQ',
                e: 'AQAB',
                d: 'CeicvNHr7NpZSU3LhWK_RLr2DH7_gxZgNKH_z69Iwg1AZ_p82MVj8QFLZSGRWgBpT2LzjKq0AmkrA1h3VZFUyr3zH4LrMlz4W8r_B3QRRcYF9HXGXQzEKyVx3mlq3QdmB2SNQ9LL9Z5Tg6CqsUNHUZqI0_aMBcpPXz1hKIhp6_Pu7QKC-aHl5XjXW5KXLZgZRJOrVJq7CkNuYz9PTVlBPIMfXg9xfccGDbBgVfOK7YffoQxeHtUUKfciLGdY8YFi_YlPE3LKkwV_s8DJiGLYVT8SEbtVG4Y4R7RXFogvj55q9vPrEFBLxJTmXvX0Gx7JVY1_6QQShHXeJ_dTSuL8EQ',
                p: '7g6fKrnpELEgByxXzm3F-xwO1ZLy8Yi2pkqnnvEICybBBshWLYRoq0n3GtMwwogLGdTDOKOiCDGCgcl2CNISMRukP-z_CrBfR5dBlrcUfI7Kv4V8GKQeaZlx5DnJHGdpT6KaEr3QQQWM40aZf2SXd0zTmQbZ0mC_NVnI72EtLCE',
                q: '0Z-U7Gh9m4zbbKifHBf8XvYYCiEHTEF2_zLVMPPubQJxs4PUgSS0yOXhWwJ0HKyopHmZCIAyXuiBaCCz69zqwUCno3jLnlzZ7QE-qNFZ6AdXbRamtrvwR-bKoL2-sivFHJayFJYpYEmXqBM5E-K24mjid91LYlBwSayg6bL8PW8',
                dp: '1mLe4vJMy0erBKxkAr8rmIA8Rxe0xNp2_eSwSDK7O0ypO-KfOHLqf6_BVeQYL_8OWaQ0mvlFxXL2s0bInU7DeFYiysHvG7PLZvQPCKgHEzWMzgpK79ZtBpJp0hDEP0k2Ov3gX6I8Wi4GsWbPjZ0IJ8AlrqRf7Hn38jptgL4oANE',
                dq: 'cXV9iaGfBKr8h-p0E_DAtoKlbKNGOUvHJlBXLHQ5KuQXLgn8PD2tNfdUxu3VxUf83fjXEjirIK11KfZByAqEAtn2UXg1kxpGLvO5xn8vf_W7nQkeBiOjJ5UFeBF0d8WbvV3puf5PiQFnHHl5Hty9wUyQ02alGFjEGHndLN-tGuE',
                qi: 'LEg-FSYbVDe7bTHAWFCPJ8I_FM5zzI0ZQ3_6riKnPrYKXo44nGm6XohRW-YhYz6WzYxIbM6dUKHGNUvqIcpS_-nBGk_zLxmw5pA3r6ujHUD4zR5-sGogBBPf5J_HN-_kF8k-HRK67qS-4rbTtm6fzH9OYVVKk1Ar2RYgxiiYYzA'
            }]
    },
    // Cookie settings
    cookies: {
        keys: ['cookie-secret-1'] // This is just for development, use proper secrets in production
    },
    // Allow custom claims
    conformIdTokenClaims: false,
    // Token signing configuration
    rotateRefreshToken: true,
    // Response type and scope configuration
    responseTypes: ['code', 'id_token', 'code id_token'],
    scopes: ['openid', 'offline_access', 'email', 'profile']
};
