import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';

const prisma = new PrismaClient();

// Validation schemas
const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required')
});

const revokeTokenSchema = z.object({
  token: z.string().min(1, 'Token is required')
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters')
});

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const apiController = {
  // Refresh token endpoint - follows OAuth 2.0/OIDC standards
  refreshToken: async (req: Request, res: Response) => {
    try {
      const { refresh_token } = refreshTokenSchema.parse(req.body);
      
      // Verify the refresh token
      const token = await prisma.token.findFirst({
        where: {
          token_value: refresh_token,
          type: 'refresh_token'
        },
        include: { user: true }
      });

      if (!token || token.expires_at < new Date()) {
        return res.status(401).json({
          error: 'invalid_grant',
          error_description: 'Refresh token is invalid or expired'
        });
      }

      // Generate new access token - 1 hour validity
      const accessToken = jwt.sign(
        {
          sub: String(token.user.id_user),
          email: token.user.email
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Generate new refresh token - 30 days validity
      const newRefreshToken = jwt.sign({ type: 'refresh' }, JWT_SECRET, { expiresIn: '30d' });

      // Update tokens in database
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await Promise.all([
        // Save new refresh token
        prisma.token.create({
          data: {
            type: 'refresh_token',
            token_value: newRefreshToken,
            user_id: token.user_id,
            client_id: token.client_id,
            expires_at: expiresAt,
            scope: token.scope
          }
        }),
        // Delete old refresh token
        prisma.token.delete({
          where: { id_token: token.id_token }
        })
      ]);

      // Return new tokens following OAuth 2.0 spec
      res.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: newRefreshToken,
        scope: token.scope
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
          token_value: token,
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
  },

  // User Profile endpoints
  getProfile: async (req: Request, res: Response) => {
    try {
      if (!req.user?.sub) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await prisma.user.findUnique({
        where: { id_user: Number(req.user.sub) }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userRecord = user as any;
      res.json({
        id: user.id_user,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        avatar: user.avatar,
        email_verified: user.status === 'ACTIVE'
      });
    } catch (error) {
      res.status(500).json({
        error: 'server_error',
        error_description: 'An internal server error occurred'
      });
    }
  },

  updateProfile: async (req: Request, res: Response) => {
    try {
      if (!req.user?.sub) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const updateSchema = z.object({
        email: z.string().email().optional(),
        first_name: z.string().min(1, 'First name is required').optional(),
        last_name: z.string().min(1, 'Last name is required').optional(),
        phone_number: z.string().min(6, 'Phone is required').optional(),
        avatar: z.string().optional()
      });

      const updates = updateSchema.parse(req.body);
      const data: any = {
        ...updates,
        avatar: updates.avatar || null,
      };

      const user = await prisma.user.update({
        where: { id_user: Number(req.user.sub) },
        data
      });

      const userRecord = user as any;
      res.json({
        id: user.id_user,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        avatar: user.avatar,
        email_verified: user.status === 'ACTIVE'
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
  changePassword: async (req: Request, res: Response) => {
    try {
      if (!req.user?.sub) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { current_password, new_password } = changePasswordSchema.parse(req.body);
      if (!passwordRegex.test(new_password)) {
        return res.status(400).json({
          error: 'New password must be at least 8 characters and contain letters and numbers'
        });
      }

      const user = await prisma.user.findUnique({
        where: { id_user: Number(req.user.sub) }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const ok = await bcrypt.compare(current_password, user.password);
      if (!ok) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      const sameAsOld = await bcrypt.compare(new_password, user.password);
      if (sameAsOld) {
        return res.status(400).json({ error: 'New password must be different from current password' });
      }

      const passwordHash = await bcrypt.hash(new_password, 10);
      await prisma.user.update({
        where: { id_user: user.id_user },
        data: { password: passwordHash }
      });

      res.json({ message: 'Password updated successfully' });
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
