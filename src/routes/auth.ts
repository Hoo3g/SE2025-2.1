import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { verifyToken } from '../middleware/verifyToken.js';

export const router = Router();

// Authentication endpoints
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', verifyToken, authController.logout);
router.post('/change-password', verifyToken, authController.changePassword);

// OIDC endpoints
router.get('/.well-known/openid-configuration', authController.discovery);
router.get('/authorize', authController.authorize);
router.post('/token', authController.token);
router.get('/userinfo', verifyToken, authController.userinfo);