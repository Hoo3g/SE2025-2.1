import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { sendEmail } from '../auth/email.js';
import { BASE_URL } from '../config.js';
import { layout } from '../views/layout.js';
import { signupForm } from '../views/forms.js';

export const router = express.Router();

router.get('/signup', (_, res) => {
  res.send(signupForm());
});

router.post('/signup', async (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(8) });

  try {
    const { email, password } = schema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).send(signupForm('Email đã được đăng ký'));

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });

    const token = crypto.randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await prisma.emailToken.create({
      data: { userId: user.id, token, purpose: 'verify', expiresAt },
    });

    const verifyLink = `${BASE_URL}/verify?token=${token}`;
    await sendEmail(email, 'Xác nhận email', `Nhấn vào link để xác nhận: <a href="${verifyLink}">${verifyLink}</a>`);

    res.send(layout('Đăng ký thành công', `<p>Đã gửi email xác nhận tới <b>${email}</b>.</p>`));
  } catch (e: any) {
    res.status(400).send(signupForm(e.message || 'Dữ liệu không hợp lệ'));
  }
});
