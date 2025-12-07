import { Request, Response } from "express";
import { userService } from "../services/userService.js";
import { sendVerifyEmail } from "../auth/email.js";
import { issueToken } from "../services/tokenService.js";


export const authController = {
  async signup(req: Request, res: Response) {
    try {
      const {  email, password,first_name,last_name,phone_number } = req.body;

      if (!email || !password || !first_name || !last_name || !phone_number) {
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
        firstName: first_name,
        lastName:last_name,
        phoneNumber:phone_number
      });

      await sendVerifyEmail(user.email, token);

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
      const url = new URL(redirect_url);
      url.searchParams.set("token", token);

      return res.redirect(url.toString());
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
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