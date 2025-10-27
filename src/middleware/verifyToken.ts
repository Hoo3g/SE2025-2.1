import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        email: string;
        email_verified: boolean;
        [key: string]: any;
      };
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'invalid_token',
      error_description: 'Access token is missing or invalid'
    });
  }

  const token = authHeader.slice(7); // Remove "Bearer "
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    if (typeof decoded === 'string') {
      throw new Error('Invalid token payload');
    }
    req.user = {
      sub: decoded.sub as string,
      email: decoded.email as string,
      email_verified: decoded.email_verified as boolean,
      ...decoded
    };
    next();
  } catch (err) {
    res.status(401).json({
      error: 'invalid_token',
      error_description: 'Access token is invalid or expired'
    });
  }
};