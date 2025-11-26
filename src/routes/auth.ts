import { Router } from "express";
import path from 'path';
import { authController } from "../controllers/authController.js";

const router = Router();

router.get('/login', (req, res) => {
	// Serve a simple login page stored under public/login.html
	return res.sendFile(path.join(process.cwd(), 'public', 'login.html'));
});

router.post("/signin", authController.signin);
router.post("/signup", authController.signup);
router.get("/verify-email", authController.verifyEmail);

export default router;
