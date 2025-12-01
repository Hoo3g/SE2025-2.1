import { Router, Request } from "express";
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { authController } from "../controllers/authController.js";

const router = Router();

// Ensure upload dir exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
	destination: function (_req: Request, _file: Express.Multer.File, cb: (err: Error | null, dest: string) => void) {
		cb(null, uploadDir);
	},
	filename: function (_req: Request, file: Express.Multer.File, cb: (err: Error | null, filename: string) => void) {
		const ts = Date.now();
		const safe = file.originalname.replace(/[^a-zA-Z0-9.\-\_]/g, '_');
		cb(null, `${ts}-${safe}`);
	},
});

const upload = multer({ storage });

router.get('/login', (req, res) => {
	// Serve a simple login page stored under public/login.html
	return res.sendFile(path.join(process.cwd(), 'public', 'login.html'));
});

router.get('/signup', (req, res) => {
	return res.sendFile(path.join(process.cwd(), 'public', 'signup.html'));
});

router.post("/signin", authController.signin);
// Accept multipart signup so we can upload avatar file
router.post("/signup", upload.single('avatar'), authController.signup);
router.get("/verify-email", authController.verifyEmail);

export default router;
