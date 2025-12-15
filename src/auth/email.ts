import { EMAIL_FROM } from '../config.js';

export async function sendVerifyEmail(email: string, token: string) {
  const verifyUrl = `${process.env.APP_URL}/verify-email.html?token=${token}`;
  
  // TODO: Configure SMTP settings in .env
  // For now, just log the verification link instead of sending
  console.log(`[VERIFY EMAIL] Email: ${email}`);
  console.log(`[VERIFY EMAIL] Token: ${token}`);
  console.log(`[VERIFY EMAIL] Verify URL: ${verifyUrl}`);
  
  // If SMTP is configured, send real email
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = await import('nodemailer').then(m => m.default);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: EMAIL_FROM || 'noreply@myapp.com',
        to: email,
        subject: "Verify your account",
        html: `
          <h3>Welcome to MyApp!</h3>
          <p>Thank you for signing up. Please click the link below to verify your email:</p>
          <a href="${verifyUrl}">${verifyUrl}</a>
          <p>This link expires in 1 hour.</p>
        `,
      });
    } catch (err) {
      console.error('Failed to send email via SMTP:', err);
    }
  }
}
