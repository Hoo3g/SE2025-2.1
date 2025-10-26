import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { signToken } from '../auth/jwt.js';
import { layout, loginForm } from '../views/forms.js';

export const router = express.Router();

router.get('/login', (req, res) => {
  const { redirect_url } = req.query;
  res.send(loginForm(undefined, redirect_url as string));
});

router.post('/login', async (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string() });
  try {
    const { email, password } = schema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.send(loginForm('User not found'));

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.send(loginForm('Wrong password'));

    const token = await signToken(user.id, user.email);
    res.send(layout('Logged in', `<pre>${token}</pre>`));
  } catch (e: any) {
    res.send(loginForm(e.message));
  }
});
