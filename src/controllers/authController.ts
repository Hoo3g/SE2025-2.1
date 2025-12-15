import { Request, Response } from "express";
import { userService } from "../services/userService.js";
import { sendVerifyEmail } from "../auth/email.js";
import { issueToken } from "../services/tokenService.js";
import { BASE_URL } from "../config.js";


export const authController = {
  async signup(req: Request, res: Response) {
    try {
      const {  email, password,first_name,last_name,phone_number } = req.body;

      if (!email || !password || !first_name || !last_name || !phone_number) {
        return res.status(400).json({ error: "Missing required fields" });
      }

    // Kiểm tra mật khẩu: ít nhất 8 ký tự, có chữ và số. Cho phép ký tự đặc biệt.
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          error: "Mật khẩu phải có ít nhất 8 ký tự và chứa cả chữ và số",
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
        firstName: first_name,
        lastName:last_name,
        phoneNumber:phone_number
      });

      try {
        await sendVerifyEmail(user.email, token);
      } catch (emailErr) {
        console.warn('Failed to send verification email:', emailErr);
        // Don't fail signup if email fails to send - user can still verify later
      }

      res.status(201).json({
        message: "Signup successful! Please check your email to verify your account.",
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async signin(req: Request, res: Response) {
    try {
      const { email, password, redirect_url } = req.body;

      if (!email || !password || !redirect_url) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // gọi service để xử lý đăng nhập
      const user = await userService.signIn(email, password);

      // sinh token
      const token = await issueToken({ id: user.id_user, email: user.email });

      // redirect về redirect_url kèm token
      const url = redirect_url.startsWith('http://') || redirect_url.startsWith('https://')
        ? new URL(redirect_url)
        : new URL(redirect_url, BASE_URL);
      url.searchParams.set("token", token);

      return res.redirect(url.toString());
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  async verifyEmail(req: Request, res: Response) {
    try {
      const token = req.query.token as string;
      if (!token) return res.status(400).json({ error: "Missing token" });

      const user = await userService.verifyEmail(token);
      res.json({
        message: "Email verified successfully! You can now login.",
        email: user.email,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Verification failed" });
    }
  },
};
