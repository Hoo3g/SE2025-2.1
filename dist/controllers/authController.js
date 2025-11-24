import { userService } from "../services/userService";
import { sendVerifyEmail } from "../auth/email";
export const authController = {
    async signup(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            // Kiểm tra mật khẩu: ít nhất 8 ký tự, có chữ và số
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({
                    error: "Password must be at least 8 characters long and contain both letters and numbers",
                });
            }
            // Check email tồn tại
            const existingUser = await userService.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: "Email already exists" });
            }
            const { user, token } = await userService.createUser({
                email,
                password,
            });
            await sendVerifyEmail(user.email, token);
            res.status(201).json({
                message: "Signup successful! Please check your email to verify your account.",
            });
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    async verifyEmail(req, res) {
        try {
            const token = req.query.token;
            if (!token)
                return res.status(400).send("Missing token");
            const user = await userService.verifyEmail(token);
            res.send(`Email verified successfully for ${user.email}! You can now login.`);
        }
        catch (err) {
            res.status(400).send(`Verification failed: ${err.message}`);
        }
    },
};
