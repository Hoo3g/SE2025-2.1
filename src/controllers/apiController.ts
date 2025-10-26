import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const apiController = {
  refreshToken: async (req: Request, res: Response) => {
    try {
      const { refresh_token } = req.body;
      
      const session = await prisma.session.findUnique({
        where: { refreshToken: refresh_token },
        include: { user: true }
      });

      if (!session || session.expiresAt < new Date()) {
        return res.status(401).json({ error: 'invalid_token' });
      }

      // Generate new access token
      const newAccessToken = 'new-access-token'; // Should use proper token generation
      const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

      // Update session
      await prisma.session.update({
        where: { id: session.id },
        data: { accessToken: newAccessToken, expiresAt }
      });

      res.json({
        access_token: newAccessToken,
        token_type: 'Bearer',
        expires_in: 3600
      });
    } catch (error) {
      res.status(500).json({ error: 'server_error' });
    }
  },

  logout: async (req: Request, res: Response) => {
    try {
      // Delete all sessions for the user
      await prisma.session.deleteMany({
        where: { userId: req.session.userId }
      });

      // Clear session
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: 'server_error' });
        }
        res.json({ message: 'logged_out' });
      });
    } catch (error) {
      res.status(500).json({ error: 'server_error' });
    }
  }
};