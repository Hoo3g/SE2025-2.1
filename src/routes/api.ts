import { Router } from 'express';
import { apiController } from '../controllers/apiController.js';
import { verifyToken } from '../middleware/verifyToken.js';

export const router = Router();

// Token management
router.post('/token/refresh', apiController.refreshToken);
router.post('/token/revoke', verifyToken, apiController.revokeToken);

// Protected resources
router.get('/me', verifyToken, apiController.getProfile);
router.patch('/me', verifyToken, apiController.updateProfile);