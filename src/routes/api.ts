import { Router } from "express";
import authRoutes from "./auth.js";
import { apiController } from '../controllers/apiController.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import ensureAuthenticated from '../middleware/ensureAuthenticated.js';

const router = Router();

router.use("/auth", authRoutes);

// Protected profile endpoint - returns currently authenticated user's profile
router.get('/profile', ensureAuthenticated, apiController.getProfile);

// Ensure upload dir exists for profile avatars
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
	destination: function (_req: any, _file: Express.Multer.File, cb: (err: Error | null, dest: string) => void) {
		cb(null, uploadDir);
	},
	filename: function (_req: any, file: Express.Multer.File, cb: (err: Error | null, filename: string) => void) {
		const ts = Date.now();
		const safe = file.originalname.replace(/[^a-zA-Z0-9.\-\_\.]/g, '_');
		cb(null, `${ts}-${safe}`);
	}
});

const upload = multer({ storage });

// Update profile - multipart/form-data to support avatar upload
router.put('/profile', ensureAuthenticated, upload.single('avatar'), apiController.updateProfile);

export default router;
