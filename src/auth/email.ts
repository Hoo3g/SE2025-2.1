import nodemailer from "nodemailer";

export async function sendVerifyEmail(email: string, token: string) {
  const verifyUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

  // Use real SMTP if credentials are provided, otherwise use a JSON transport
  // (dev-friendly — prints a JSON object). We also log the verify URL for convenience.
  const useSmtp = !!process.env.SMTP_USER && !!process.env.SMTP_PASS;

  const transporter = useSmtp
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    : nodemailer.createTransport({ jsonTransport: true });

  const info = await transporter.sendMail({
    from: '"Asset3D ID" <no-reply@asset3d.io>',
    to: email,
    subject: 'Verify your Asset3D account',
    html: `
      <h3>Welcome to Asset3D!</h3>
      <p>Click below to verify your email:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>This link expires in 1 hour.</p>
    `,
  });

  // For local dev log the verify link / transport info so it's easy to copy in tests
  console.log('[email] sent verify link to', email, 'verifyUrl=', verifyUrl);
  if (!useSmtp) console.log('[email] jsonTransport output:', info);
}
