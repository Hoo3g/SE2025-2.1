
import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { oidcController } from "../controllers/oidcController.js";

export const router = Router();


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


export default router