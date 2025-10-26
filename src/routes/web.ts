import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { isAuthenticated } from '../middleware/auth.js';

export const router = Router();

// Web routes
router.get('/signup', authController.showSignupForm);
router.post('/signup', authController.signup);

router.get('/login', authController.showLoginForm);
router.post('/login', authController.login);

router.get('/settings', isAuthenticated, authController.showSettings);
router.post('/settings', isAuthenticated, authController.updateSettings);

router.get('/change-password', isAuthenticated, authController.showChangePasswordForm);
router.post('/change-password', isAuthenticated, authController.changePassword);