import { SignJWT } from "jose";
import { createPrivateKey } from "crypto";

const privateKeyPem = `
-----BEGIN PRIVATE KEY-----
...your private key here...
-----END PRIVATE KEY-----
`;

const privateKey = createPrivateKey(privateKeyPem);

export async function issueToken(payload: { id: number; email: string }) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 60 * 60; // token sống 1h

  return await new SignJWT({
    sub: String(payload.id),
    email: payload.email,
    iss: "https://id.asset3d.io",
    aud: "asset3d",
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(privateKey);
}
