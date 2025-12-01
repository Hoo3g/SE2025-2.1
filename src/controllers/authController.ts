import { Request, Response } from "express";
import { userService } from "../services/userService.js";
import { sendVerifyEmail } from "../auth/email.js";
import { issueToken } from "../services/tokenService.js";
import { BASE_URL } from '../config.js';


export const authController = {
  async signup(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, password, phoneNumber, dateOfBirth } = req.body;

      // require the fields we want users to supply
      if (!firstName || !lastName || !email || !password || !phoneNumber || !dateOfBirth) {
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


      // avatar might be uploaded by multer
      let avatarUrl: string | undefined;
      if ((req as any).file && (req as any).file.filename) {
        // public/uploads/<filename>
        avatarUrl = `/uploads/${(req as any).file.filename}`;
      }

      const { user, token } = await userService.createUser({
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        dateOfBirth,
        avatar: avatarUrl,
      });

      let emailSent = false;
      try {
        await sendVerifyEmail(user.email, token);
        emailSent = true;
      } catch (e: any) {
        // Don't fail signup just because email sending failed — return the token so developer
        // can verify manually (useful for local dev). Log the error.
        console.error('[auth] failed to send verify email', e);
      }

      const response: any = { message: 'Signup successful! Please check your email to verify your account.' };
      if (!emailSent) {
        response.info = 'Failed to send verification email — use the token from server logs or the verify endpoint';
        response.token = token; // dev convenience; remove in production
      }

      res.status(201).json(response);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async signin(req: Request, res: Response) {
    try {
      const { email, password, redirect_url } = req.body;

      // Detect typical browser form submissions so we can return a friendly UI redirect
      const acceptHeader = (req.headers.accept || '') as string;
      const contentType = (req.headers['content-type'] || '') as string;
      // DEBUG: log headers and computed flags for diagnosing why JSON vs redirect
      console.log('[signin] headers accept=', acceptHeader, 'content-type=', contentType);
      const isJson = contentType.includes('application/json') || acceptHeader.includes('application/json');
      // Treat classic form posts (urlencoded / multipart) as browser flows regardless of the Accept header.
      const isFormLike = contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data');
      // Also check referer/origin — if request comes from the login page it's definitely a browser flow.
      const referer = (req.headers.referer || req.headers.referer) as string | undefined;
      const fromLoginPage = referer?.includes('/auth/login') || (req.headers.origin && String(req.headers.origin).includes('/auth/login'));
      const isHtmlForm = req.method === 'POST' && (isFormLike || acceptHeader.includes('text/html') || !!fromLoginPage);

      // If redirect_url missing for browser form, default to dashboard so the user still gets redirected
      const destination = redirect_url || (BASE_URL + '/dashboard');

      if (!email || !password) {
        const errMsg = 'Missing required fields';
        console.log('[signin] isHtmlForm=', isHtmlForm, 'isFormLike=', isFormLike, 'email=', !!email, 'passwordPresent=', !!password);
        if (isHtmlForm) {
          // Redirect back to login page and show friendly message
          const q = new URLSearchParams({ error: errMsg, email: email || '' });
          return res.redirect('/auth/login?' + q.toString());
        }
        return res.status(400).json({ error: errMsg });
      }

      // gọi service để xử lý đăng nhập
      const user = await userService.signIn(email, password);

      // sinh token
      const token = await issueToken({ id: user.id_user, email: user.email });

      // redirect về destination kèm token
      const url = new URL(destination);
      url.searchParams.set("token", token);
      return res.redirect(url.toString());
    } catch (err: any) {
      // If request came from a browser form, redirect to login with a readable error message.
      const acceptHeader = (req.headers.accept || '') as string;
      const contentType = (req.headers['content-type'] || '') as string;
      const isJson2 = contentType.includes('application/json') || acceptHeader.includes('application/json');
      const isFormLike2 = contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data');
      const referer2 = (req.headers.referer || req.headers.referer) as string | undefined;
      const fromLoginPage2 = referer2?.includes('/auth/login') || (req.headers.origin && String(req.headers.origin).includes('/auth/login'));
      const isHtmlForm2 = req.method === 'POST' && (isFormLike2 || acceptHeader.includes('text/html') || !!fromLoginPage2);

      const message = err?.message || 'Sign in failed';
      if (isHtmlForm2) {
        const q = new URLSearchParams({ error: message, email: (req.body && req.body.email) || '' });
        return res.redirect('/auth/login?' + q.toString());
      }

      return res.status(400).json({ error: message });
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
