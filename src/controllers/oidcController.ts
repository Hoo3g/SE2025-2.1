import { Request, Response } from 'express';
import { userService } from '../services/userService.js';

export const oidcController = {
  // Hiển thị trang interaction (login hoặc consent)
  async showInteraction(req: Request, res: Response) {
    const provider = req.app.locals.provider;
    const details = await provider.interactionDetails(req, res);

    if (details.prompt.name === 'login') {
      // Hiển thị form login
      return res.sendFile('public/login.html', { root: process.cwd() });
    }

    if (details.prompt.name === 'consent') {
      // Hiển thị form consent
      return res.sendFile('public/consent.html', { root: process.cwd() });
    }

    return res.status(400).send('Unknown interaction prompt');
  },

  // Xử lý form login
  async submitLogin(req: Request, res: Response) {
    const provider = req.app.locals.provider;
    const { email, password } = req.body;

    try {
      const user = await userService.signIn(email, password);
      if (!user) return res.status(401).send('Invalid credentials');

      // Báo cho provider biết login thành công
      const result = { login: { accountId: String(user.id_user) } };
      await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
    } catch (err: any) {
      return res.status(400).send(`Login failed: ${err.message}`);
    }
  },

  // Xử lý consent
  async submitConsent(req: Request, res: Response) {
    const provider = req.app.locals.provider;
    const result = { consent: {} };
    await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: true });
  }
};
