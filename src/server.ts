import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { router as authRouter } from './routes/auth.js';
import { router as apiRouter } from './routes/api.js';
import { publicJwk } from './auth/jwt.js';

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRouter);
app.use('/api', apiRouter);

// OpenID Configuration
app.get('/.well-known/jwks.json', (_, res) => res.json({ keys: [publicJwk] }));