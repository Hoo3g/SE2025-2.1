import express from 'express';
import { prisma } from '../prisma/client.js';
import { JWTPayload } from 'jose';
import { JWT_AUDIENCE, BASE_URL } from '../config.js';

export const router = express.Router();

router.get('/userinfo', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing_bearer' });

    const token = auth.slice('Bearer '.length);
    const payload: JWTPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));

    if (payload.iss !== BASE_URL || payload.aud !== JWT_AUDIENCE || !payload.sub)
      return res.status(401).json({ error: 'invalid_token' });

    const user = await prisma.user.findUnique({ where: { id: String(payload.sub) } });
    if (!user) return res.status(404).json({ error: 'user_not_found' });

    res.json({
      sub: user.id,
      email: user.email,
      email_verified: !!user.emailVerifiedAt,
    });
  } catch (e: any) {
    res.status(400).json({ error: 'bad_request', message: e.message });
  }
});
