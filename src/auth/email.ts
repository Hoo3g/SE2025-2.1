import { EMAIL_FROM } from '../config.js';

export async function sendVerifyEmail(email: string, token: string) {
  const verifyUrl = `${process.env.APP_URL}/auth/verify-email?token=${token}`;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log for development mode only (as fallback for local testing)
  if (!isProduction) {
    console.log(`[VERIFY EMAIL] Email: ${email}`);
    console.log(`[VERIFY EMAIL] Verify URL: ${verifyUrl}`);
  }

  // Check if SMTP is configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    if (isProduction) {
      throw new Error('SMTP not configured - cannot send verification email in production');
    }
    console.warn('[EMAIL] ⚠ SMTP not configured, email not sent (dev mode - use terminal link)');
    return;
  }

  // Send real email via SMTP
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
      subject: "Xác thực tài khoản Asset3D",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Chào mừng bạn đến với Asset3D!</h2>
          <p>Cảm ơn bạn đã đăng ký. Vui lòng click vào link bên dưới để xác thực email:</p>
          <p style="margin: 20px 0;">
            <a href="${verifyUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Xác thực Email
            </a>
          </p>
          <p style="color: #999; font-size: 12px;">Link này sẽ hết hạn sau 1 giờ.</p>
        </div>
      `,
    });

    console.log(`[EMAIL] ✓ Verification email sent successfully to ${email}`);
  } catch (err) {
    console.error('[EMAIL] ✗ Failed to send verification email:', err);
    if (isProduction) {
      throw err; // Re-throw in production so signup flow knows email failed
    }
    // In dev mode, just warn but don't fail - user can use terminal link
  }
}
