
import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { oidcController } from "../controllers/oidcController.js";

export const router = Router();

<<<<<<< HEAD
// Interaction routes cho OIDC
router.get("/interaction/:uid", oidcController.showInteraction);
router.post("/interaction/:uid/login", oidcController.submitLogin);
router.post("/interaction/:uid/consent", oidcController.submitConsent);

// Signup & verify email (ngoài OIDC)
router.post("/signup", authController.signup);
router.get("/verify-email", authController.verifyEmail);
// routes/auth.js
router.post("/signup", (req, res) => {
  console.log(">>> Signup route hit với body:", req.body);
  res.send("Signup OK");
});
=======
// Authentication endpoints
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', verifyToken, authController.logout);
router.post('/change-password', verifyToken, authController.changePassword);
>>>>>>> 650ab232d071d9d5532ca8e4241fcd4b6ac2616f

// OIDC endpoints
router.get('/.well-known/openid-configuration', authController.discovery);
router.get('/authorize', authController.authorize);
router.post('/token', authController.token);
router.get('/userinfo', verifyToken, authController.userinfo);