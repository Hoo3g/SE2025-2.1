import { Router } from "express";
import authRoutes from "./auth.js";
import { apiController } from "../controllers/apiController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

router.use("/auth", authRoutes);

router.get("/user/profile", verifyToken, apiController.getProfile);
router.put("/user/profile", verifyToken, apiController.updateProfile);
router.post("/token/refresh", apiController.refreshToken);
router.post("/token/revoke", apiController.revokeToken);

export default router;
