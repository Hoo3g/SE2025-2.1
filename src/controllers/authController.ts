import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

type Request = express.Request;
type Response = express.Response;

const prisma = new PrismaClient();

// Validation schemas
const signupSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
});

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string()
});

const settingsSchema = z.object({
  displayName: z.string().min(1, 'Tên hiển thị không được để trống')
});

const passwordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
});

export const authController = {
  // OIDC endpoints
  discovery: async (_req: Request, res: Response) => {
    res.json({
      issuer: 'https://auth.example.com',
      authorization_endpoint: 'https://auth.example.com/authorize',
      token_endpoint: 'https://auth.example.com/token',
      userinfo_endpoint: 'https://auth.example.com/userinfo',
      jwks_uri: 'https://auth.example.com/.well-known/jwks.json',
      response_types_supported: ['code'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      scopes_supported: ['openid', 'profile', 'email'],
      token_endpoint_auth_methods_supported: ['client_secret_basic'],
      claims_supported: ['sub', 'iss', 'email', 'email_verified']
    });
  },

  authorize: async (req: Request, res: Response) => {
    const { client_id, redirect_uri, response_type, scope, state } = req.query;
    
    // TODO: Validate client_id and redirect_uri
    // For now, store these in session and redirect to login
    res.redirect(`/login?redirect_uri=${redirect_uri}&state=${state}`);
  },

  token: async (req: Request, res: Response) => {
    const { grant_type, code } = req.body;
    
    if (grant_type !== 'authorization_code') {
      return res.status(400).json({ error: 'unsupported_grant_type' });
    }

    // TODO: Validate authorization code
    // For now return dummy token
    res.json({
      access_token: 'dummy_access_token',
      token_type: 'Bearer',
      expires_in: 3600,
      id_token: 'dummy_id_token'
    });
  },

  userinfo: async (req: Request, res: Response) => {
    // User info should be attached by verifyToken middleware
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'invalid_token' });
    }

    res.json({
      sub: user.sub,
      email: user.email,
      email_verified: user.email_verified
    });
  },

  logout: async (req: Request, res: Response) => {
    // For now just send success response
    res.json({ success: true });
  },

  // Authentication endpoints
  signup: async (req: Request, res: Response) => {
    try {
      const { email, password } = signupSchema.parse(req.body);
      
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email đã được sử dụng' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { 
          email, 
          passwordHash,
          subject: `user-${Date.now()}` // Generate OIDC subject
        }
      });

      res.status(201).json({
        id: user.id,
        email: user.email,
        subject: user.subject
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      res.status(500).json({ error: 'Có lỗi xảy ra khi đăng ký' });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
      }

      res.json({
        id: user.id,
        email: user.email,
        subject: user.subject
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      res.status(500).json({ error: 'Có lỗi xảy ra khi đăng nhập' });
    }
  },

  getSettings: async (req: Request, res: Response) => {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await prisma.user.findUnique({
        where: { id: String(userId) }
      });

      if (!user) {
        return res.status(404).json({ error: 'Người dùng không tồn tại' });
      }

      res.json({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      });
    } catch (error) {
      res.status(500).json({ error: 'Có lỗi xảy ra khi tải thông tin người dùng' });
    }
  },

  updateSettings: async (req: Request, res: Response) => {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { displayName } = settingsSchema.parse(req.body);
      
      const user = await prisma.user.update({
        where: { id: String(userId) },
        data: { displayName }
      });

      res.json({
        id: user.id,
        email: user.email,
        displayName: user.displayName
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      res.status(500).json({ error: 'Có lỗi xảy ra khi cập nhật thông tin' });
    }
  },

  changePassword: async (req: Request, res: Response) => {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { currentPassword, newPassword } = passwordSchema.parse(req.body);
      
      const user = await prisma.user.findUnique({
        where: { id: String(userId) }
      });

      if (!user) {
        return res.status(404).json({ error: 'Người dùng không tồn tại' });
      }

      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Mật khẩu hiện tại không đúng' });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      });

      res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      res.status(500).json({ error: 'Có lỗi xảy ra khi đổi mật khẩu' });
    }
  }
};
