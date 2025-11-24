import { generateKeyPair, SignJWT, exportJWK } from 'jose';
import { BASE_URL, JWT_AUDIENCE } from '../config.js';
export let privateKey;
export let publicJwk;
export async function ensureKeys() {
    const { privateKey: pk, publicKey } = await generateKeyPair('RS256');
    privateKey = pk;
    publicJwk = await exportJWK(publicKey);
    publicJwk.kid = 'asset3d-dev';
    publicJwk.alg = 'RS256';
}
export async function signToken(sub, email) {
    const now = Math.floor(Date.now() / 1000);
    return await new SignJWT({ sub, email })
        .setProtectedHeader({ alg: 'RS256' })
        .setIssuedAt(now)
        .setIssuer(BASE_URL)
        .setAudience(JWT_AUDIENCE)
        .setExpirationTime('1h')
        .sign(privateKey);
}
