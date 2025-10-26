import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { changePasswordForm } from '../views/forms.js';

export const router = express.Router();

router.get('/change-password', (_, res) => {
  res.send(changePasswordForm());
});

router.post('/change-password', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    current_password: z.string().min(1),
    new_password: z.string().min(8),
  });

  try {
    const { email, current_password, new_password } = schema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(404).send(changePasswordForm('Không tìm thấy người dùng', true));

    const valid = await bcrypt.compare(current_password, user.passwordHash);
    if (!valid) return res.status(401).send(changePasswordForm('Mật khẩu hiện tại không đúng', true));

    const newHash = await bcrypt.hash(new_password, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

    res.send(changePasswordForm('Đổi mật khẩu thành công'));
  } catch (e: any) {
    res.status(400).send(changePasswordForm(e.message || 'Dữ liệu không hợp lệ', true));
  }
});
