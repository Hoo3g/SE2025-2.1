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

    // https://id.asset3d.io/login
    const idpLogin = (IDP_ISSUER || BASE_URL) + '/login';

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
