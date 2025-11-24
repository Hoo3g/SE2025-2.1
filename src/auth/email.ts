import nodemailer from 'nodemailer';
import { EMAIL_FROM } from '../config.js';

const transport = process.env.EMAIL_TRANSPORT_URL
  ? nodemailer.createTransport(process.env.EMAIL_TRANSPORT_URL)
  : nodemailer.createTransport({ jsonTransport: true });

export async function sendEmail(to: string, subject: string, html: string) {
  await transport.sendMail({ from: EMAIL_FROM, to, subject, html });
}
