import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'invalid_token',
            error_description: 'Access token is missing or invalid'
        });
    }
    const token = authHeader.slice(7); // Remove "Bearer "
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === 'string') {
            throw new Error('Invalid token payload');
        }
        req.user = {
            sub: decoded.sub,
            email: decoded.email,
            email_verified: decoded.email_verified,
            ...decoded
        };
        next();
    }
    catch (err) {
        res.status(401).json({
            error: 'invalid_token',
            error_description: 'Access token is invalid or expired'
        });
    }
};
