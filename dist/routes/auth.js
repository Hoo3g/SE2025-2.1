import { Router } from "express";
import { authController } from "../controllers/authController";
const router = Router();
router.post("/signup", authController.signup);
router.get("/verify-email", authController.verifyEmail);
export default router;
