
import { Router } from "express";
import path from 'path';
import { authController } from "../controllers/authController.js";
import { oidcController } from "../controllers/oidcController.js";

export const router = Router();


// Interaction routes cho OIDC
router.get("/interaction/:uid", oidcController.showInteraction);
router.post("/interaction/:uid/login", oidcController.submitLogin);
router.post("/interaction/:uid/consent", oidcController.submitConsent);

// Signup & verify email (ngoài OIDC)
router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.get("/verify-email", authController.verifyEmail);
// Serve custom login page so OIDC interactions can use our UI instead of the provider dev page
router.get('/login', (req, res) => {
  const loginPath = path.resolve(process.cwd(), 'public', 'login.html');
  res.sendFile(loginPath);
});

export default router
