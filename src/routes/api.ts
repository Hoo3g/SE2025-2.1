import { Router } from 'express';
import { apiController } from '../controllers/apiController.js';
import { isAuthenticated } from '../middleware/auth.js';

export const router = Router();

// API routes
router.post('/refresh-token', apiController.refreshToken);
router.post('/logout', isAuthenticated, apiController.logout);