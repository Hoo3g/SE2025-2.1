import { prisma } from "../prisma/client.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const userService = {
  async createUser({
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
  }: {
    firstName?: string;
    lastName?: string;
    email: string;
    phoneNumber?: string;
    password: string;
  }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("Email already exists");

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        first_name: firstName || "",
        last_name: lastName || "",
        email,
        phone_number: phoneNumber || "",
        password: passwordHash,
        role: "USER",
        status: "NOT_ACTIVE",
      },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await prisma.verifyEmail.create({
      data: {
        id_user: user.id_user,
        verified_email: false,
        token_email: token,
        token_lifetime: expires,
      },
    });

    return { user, token };
  },

  async signIn(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    if (user.status !== "ACTIVE") {
      throw new Error("Email not verified");
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new Error("Invalid credentials");

    return user;
  },


  async verifyEmail(token: string) {
    const record = await prisma.verifyEmail.findFirst({
      where: { token_email: token },
      include: { user: true },
    });

    if (!record) throw new Error("Invalid token");
    if (record.token_lifetime < new Date()) throw new Error("Token expired");

    await prisma.user.update({
      where: { id_user: record.id_user },
      data: { status: "ACTIVE" },
    });

    await prisma.verifyEmail.update({
      where: { id_verification_email: record.id_verification_email },
      data: { verified_email: true },
    });

    return record.user;
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },
};
