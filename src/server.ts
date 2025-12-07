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
const issuerUrl = process.env.NODE_ENV === 'production' ? BASE_URL : 'http://localhost:3000';
const provider = new Provider(issuerUrl, oidcConfig);

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



// Mount OIDC provider as a fallback so custom routes take precedence
app.use('/', provider.callback());

// Launch app
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`OAuth 2.0 + OpenID Connect server running at ${BASE_URL}`);
});