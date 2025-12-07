
import { Router } from "express";
import authRoutes from "./auth.js";

export const router = Router();

// Token management
router.post('/token/refresh', apiController.refreshToken);
router.post('/token/revoke', verifyToken, apiController.revokeToken);

// Protected resources
router.get('/me', verifyToken, apiController.getProfile);
router.patch('/me', verifyToken, apiController.updateProfile);