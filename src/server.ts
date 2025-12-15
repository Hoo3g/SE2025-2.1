import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Provider } from 'oidc-provider';
import authRouter from './routes/auth.js';
import apiRouter from './routes/api.js';
import { oidcConfig } from './config/oidc.js';
import { BASE_URL } from './config.js';
import path from 'path';


const app = express();

// Initialize OIDC Provider
console.log('[INIT] Creating OIDC Provider...');
const issuerUrl = process.env.NODE_ENV === 'production' ? BASE_URL : 'http://localhost:3000';
let provider: any;
try {
  provider = new Provider(issuerUrl, oidcConfig);
  console.log('[INIT] OIDC Provider created successfully');
} catch (err) {
  console.error('[INIT] Failed to create OIDC Provider:', err);
  throw err;
}
// Express middleware
app.use(helmet({
  contentSecurityPolicy: false // TODO: Configure CSP properly
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Custom routes and static files
app.use('/auth', authRouter);
app.use('/api', apiRouter);
app.use(express.static('public'));

// Default landing page -> custom login UI
app.get('/', (_req, res) => {
  const loginPath = path.resolve(process.cwd(), 'public', 'login.html');
  res.sendFile(loginPath);
});



// Mount OIDC provider as a fallback so custom routes take precedence
app.use('/', provider.callback());

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express error handler:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Unhandled rejection handler
process.on('unhandledRejection', (err: any) => {
  console.error('Unhandled rejection:', err);
});

// Launch app
console.log('[INIT] Starting server...');
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`[INIT] OAuth 2.0 + OpenID Connect server running at ${BASE_URL}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});
