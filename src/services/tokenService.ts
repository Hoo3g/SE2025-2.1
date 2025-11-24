import { SignJWT } from "jose";
import { createPrivateKey, generateKeyPairSync } from "crypto";

let privateKeyPem = `
-----BEGIN PRIVATE KEY-----
...your private key here...
-----END PRIVATE KEY-----
`;

// If no real key is provided (placeholder present), generate a temporary RSA keypair for dev
if (privateKeyPem.includes("...your private key here...")) {
  const { privateKey: genPriv } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  privateKeyPem = genPriv;
}

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
