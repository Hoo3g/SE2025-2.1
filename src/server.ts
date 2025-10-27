import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Provider } from 'oidc-provider';
import { router as authRouter } from './routes/auth.js';
import { router as apiRouter } from './routes/api.js';
import { oidcConfig } from './config/oidc.js';
import { BASE_URL } from './config.js';

const app = express();

// Initialize OIDC Provider
const issuerUrl = process.env.NODE_ENV === 'production' ? BASE_URL : 'http://localhost:3000';
const provider = new Provider(issuerUrl, oidcConfig);

// Express middleware
app.use(helmet({
  contentSecurityPolicy: false // TODO: Configure CSP properly
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mount OIDC routes before other routes
app.use('/', provider.callback());

// Custom routes after OIDC routes
app.use('/auth', authRouter);
app.use('/api', apiRouter);

// Static files
app.use(express.static('public'));

// Launch app
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`OAuth 2.0 + OpenID Connect server running at ${BASE_URL}`);
});