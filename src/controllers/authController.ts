import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { loginForm, signupForm, settingsForm, changePasswordForm } from '../views/forms.js';

const prisma = new PrismaClient();

export const authController = {
  // Signup
  showSignupForm: (req: Request, res: Response) => {
    res.send(signupForm());
  },

  signup: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      // Check if user exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.send(signupForm('Email đã được sử dụng'));
      }

      // Create user
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, passwordHash }
      });

      // Set session
      req.session.userId = user.id;
      res.redirect('/settings');
    } catch (error) {
      res.send(signupForm('Có lỗi xảy ra khi đăng ký'));
    }
  },

  // Login
  showLoginForm: (req: Request, res: Response) => {
    res.send(loginForm());
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.send(loginForm('Email hoặc mật khẩu không đúng'));
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.send(loginForm('Email hoặc mật khẩu không đúng'));
      }

      req.session.userId = user.id;
      const returnTo = req.session.returnTo || '/settings';
      delete req.session.returnTo;
      res.redirect(returnTo);
    } catch (error) {
      res.send(loginForm('Có lỗi xảy ra khi đăng nhập'));
    }
  },

  // Settings
  showSettings: async (req: Request, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.session.userId }
      });
      res.send(settingsForm(user));
    } catch (error) {
      res.send('Có lỗi xảy ra khi tải thông tin người dùng');
    }
  },

  updateSettings: async (req: Request, res: Response) => {
    try {
      const { displayName } = req.body;
      
      await prisma.user.update({
        where: { id: req.session.userId },
        data: { displayName }
      });

      const user = await prisma.user.findUnique({
        where: { id: req.session.userId }
      });
      res.send(settingsForm(user, 'Cập nhật thông tin thành công'));
    } catch (error) {
      res.send('Có lỗi xảy ra khi cập nhật thông tin');
    }
  },

  // Change Password
  showChangePasswordForm: (req: Request, res: Response) => {
    res.send(changePasswordForm());
  },

  changePassword: async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const user = await prisma.user.findUnique({
        where: { id: req.session.userId }
      });

      if (!user) {
        return res.send(changePasswordForm('Người dùng không tồn tại'));
      }

      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) {
        return res.send(changePasswordForm('Mật khẩu hiện tại không đúng'));
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      });

      res.send(changePasswordForm('Đổi mật khẩu thành công'));
    } catch (error) {
      res.send(changePasswordForm('Có lỗi xảy ra khi đổi mật khẩu'));
    }
  }
};