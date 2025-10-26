import { Router } from 'express';
import { oidcController } from '../controllers/oidcController.js';
import { isAuthenticated } from '../middleware/auth.js';

export const router = Router();

// OAuth/OIDC routes
router.get('/authorize', isAuthenticated, oidcController.authorize);
router.post('/token', oidcController.token);
router.get('/userinfo', isAuthenticated, oidcController.userinfo);
router.get('/.well-known/openid-configuration', oidcController.discovery);