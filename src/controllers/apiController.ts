import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt';

const prisma = new PrismaClient();

// Validation schemas
const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required')
});

const revokeTokenSchema = z.object({
  token: z.string().min(1, 'Token is required')
});

export const apiController = {
  // Refresh token endpoint - follows OAuth 2.0/OIDC standards
  refreshToken: async (req: Request, res: Response) => {
    try {
      const { refresh_token } = refreshTokenSchema.parse(req.body);
      
      // Verify the refresh token
      const token = await prisma.token.findUnique({
        where: { 
          value: refresh_token,
          type: 'refresh_token'
        },
        include: { user: true }
      });

      if (!token || token.expiresAt < new Date()) {
        return res.status(401).json({
          error: 'invalid_grant',
          error_description: 'Refresh token is invalid or expired'
        });
      }

      // Generate new access token - 1 hour validity
      const accessToken = jwt.sign(
        { 
          sub: token.user.subject,
          email: token.user.email
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Generate new refresh token - 30 days validity
      const newRefreshToken = jwt.sign(
        { type: 'refresh' },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Update tokens in database
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await Promise.all([
        // Save new refresh token
        prisma.token.create({
          data: {
            type: 'refresh_token',
            value: newRefreshToken,
            userId: token.userId,
            clientId: token.clientId,
            expiresAt
          }
        }),
        // Delete old refresh token
        prisma.token.delete({
          where: { id: token.id }
        })
      ]);

      // Return new tokens following OAuth 2.0 spec
      res.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: newRefreshToken,
        scope: token.scope.join(' ')
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: error.issues[0].message
        });
      }
      res.status(500).json({
        error: 'server_error',
        error_description: 'An internal server error occurred'
      });
    }
  },

  // Logout/Token Revocation endpoint - follows RFC 7009
  revokeToken: async (req: Request, res: Response) => {
    try {
      const { token } = revokeTokenSchema.parse(req.body);
      const tokenHint = req.body.token_type_hint; // Optional

      // Find and delete the token
      await prisma.token.deleteMany({
        where: {
          value: token,
          ...(tokenHint ? { type: tokenHint } : {})
        }
      });

      // RFC 7009: The authorization server responds with HTTP status code 200
      // if the token has been revoked successfully or if the client submitted
      // an invalid token
      res.status(200).send();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: error.issues[0].message
        });
      }
      res.status(500).json({
        error: 'server_error',
        error_description: 'An internal server error occurred'
      });
    }
  }
};