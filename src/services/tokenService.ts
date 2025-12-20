import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_CONFIG } from "../config/jwt.js";

export async function issueToken(payload: { id: number; email: string }) {
  return jwt.sign(
    {
      sub: String(payload.id),
      email: payload.email,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_CONFIG.accessToken.expiresIn,
      algorithm: JWT_CONFIG.accessToken.algorithm as jwt.Algorithm,
    }
  );
}
