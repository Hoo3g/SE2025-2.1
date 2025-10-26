import express from 'express';
import { prisma } from '../prisma/client.js';
import { layout } from '../views/layout.js';

export const router = express.Router();

router.get('/verify', async (req, res) => {
  const token = String(req.query.token || '');

  if (!token) return res.status(400).send(layout('Lỗi', '<p>Thiếu token xác nhận.</p>'));

  const record = await prisma.emailToken.findUnique({ where: { token } });
  if (!record || record.purpose !== 'verify' || record.expiresAt < new Date()) {
    return res.status(400).send(layout('Lỗi', '<p>Token không hợp lệ hoặc đã hết hạn.</p>'));
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerifiedAt: new Date() },
  });

  await prisma.emailToken.delete({ where: { token } });

  res.send(layout('Xác nhận thành công', `<p>Email đã được xác nhận. <a href="/login">Đăng nhập ngay</a></p>`));
});
