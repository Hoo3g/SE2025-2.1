import { Request, Response } from "express";
import { userService } from "../services/userService";
import { sendVerifyEmail } from "../auth/email";

export const authController = {
  async signup(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, phoneNumber, password } = req.body;

      if (!firstName || !lastName || !email || !phoneNumber || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // ✅ Kiểm tra định dạng email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Kiểm tra mật khẩu: ít nhất 8 ký tự, có chữ và số
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          error: "Password must be at least 8 characters long and contain both letters and numbers",
        });
      }

      // Kiểm tra số điện thoại: 10 chữ số, bắt đầu bằng 0
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({
          error: "Phone number must be 10 digits and start with 0",
        });
      }

      const { user, token } = await userService.createUser({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
      });

      await sendVerifyEmail(user.email, token);

      res.status(201).json({
        message: "Signup successful! Please check your email to verify your account.",
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async verifyEmail(req: Request, res: Response) {
    try {
      const token = req.query.token as string;
      if (!token) return res.status(400).send("Missing token");

      const user = await userService.verifyEmail(token);
      res.send(`Email verified successfully for ${user.email}! You can now login.`);
    } catch (err: any) {
      res.status(400).send(`Verification failed: ${err.message}`);
    }
  },
};
