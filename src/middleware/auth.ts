import { Request, Response, NextFunction } from 'express';

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.userId) {
    return next();
  }
  
  // Save the original URL for redirect after login
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
}