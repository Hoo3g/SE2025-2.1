import nodemailer from "nodemailer";
export async function sendVerifyEmail(email, token) {
    const verifyUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    await transporter.sendMail({
        from: '"Asset3D ID" <no-reply@asset3d.io>',
        to: email,
        subject: "Verify your Asset3D account",
        html: `
      <h3>Welcome to Asset3D!</h3>
      <p>Click below to verify your email:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>This link expires in 1 hour.</p>
    `,
    });
}
