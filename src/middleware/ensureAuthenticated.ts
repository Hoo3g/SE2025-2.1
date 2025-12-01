import { Request, Response, NextFunction } from 'express';
import { BASE_URL, IDP_ISSUER } from '../config.js';
import verifyJwtWithJwks from '../utils/jwksVerify.js';

export async function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 1. Lấy token từ cookie, header hoặc query
  const cookieToken = (req as any).cookies?.token as string | undefined;
  const authHeader = req.headers.authorization as string | undefined;
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : undefined;
  const queryToken = (req.query?.token as string) || undefined;

  const token = cookieToken || bearerToken || queryToken;

  // Hàm build redirect URL
  function redirectToLogin() {
    const currentUrl = encodeURIComponent(
      `${req.protocol}://${req.get('host')}${req.originalUrl}`
    );

    // Redirect to the app login page by default (/auth/login). If an external IDP issuer
    // is configured and it differs from our BASE_URL, redirect to the external IDP's
    // /login endpoint instead.
    // Only treat IDP_ISSUER as an external provider if it was explicitly set via env var.
    const externalIssuerProvided = !!process.env.IDP_ISSUER;
    const idpLogin = externalIssuerProvided ? (IDP_ISSUER + '/login') : (BASE_URL + '/auth/login');

    return res.redirect(`${idpLogin}?redirect_url=${currentUrl}`);
  }

  // Nếu không có token → kiểm tra API hay page
  if (!token) {
    if (req.path.startsWith('/api') || req.headers.accept?.includes('application/json')) {
      return res.status(401).json({ error: 'not_authenticated' });
    }
    return redirectToLogin();
  }

  // 2. Nếu có token → Verify bằng JWKS
  try {
    const decoded = await verifyJwtWithJwks(token);
    (req as any).user = decoded;
    return next();
  } catch (err) {
    console.error('[Auth] Token verification failed:', err);

    // API → trả JSON lỗi
    if (req.path.startsWith('/api')) {
      return res.status(401).json({ error: 'invalid_token' });
    }

    // Web → redirect login lại
    return redirectToLogin();
  }
}

export default ensureAuthenticated;
