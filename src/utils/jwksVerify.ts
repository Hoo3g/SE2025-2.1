import { createRemoteJWKSet, jwtVerify } from 'jose';
import { IDP_ISSUER, JWT_AUDIENCE } from '../config.js';

// Create a remote JWKS instance for the IDP issuer's JWKS URI. This will cache keys
// based on the HTTP headers and refresh automatically.
const JWKS = createRemoteJWKSet(new URL(`${IDP_ISSUER}/.well-known/jwks.json`));

export async function verifyJwtWithJwks(token: string) {
  // jwtVerify will throw on invalid/expired signature
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: IDP_ISSUER,
    audience: JWT_AUDIENCE
  });
  return payload;
}

export default verifyJwtWithJwks;
