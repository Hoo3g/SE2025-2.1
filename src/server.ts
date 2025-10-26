import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { router as loginRouter } from './routes/login.js';
import { router as signupRouter } from './routes/signup.js';
import { router as userinfoRouter } from './routes/userinfo.js';
import { router as passwordRouter } from './routes/password.js';
import { router as verifyRouter } from './routes/verify.js';
import { ensureKeys, publicJwk } from './auth/jwt.js';

dotenv.config();

const app = express();
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/healthz', (_, res) => res.json({ ok: true }));
app.get('/.well-known/jwks.json', (_, res) => res.json({ keys: [publicJwk] }));

app.use(loginRouter);
app.use(signupRouter);
app.use(userinfoRouter);
app.use(passwordRouter);
app.use(verifyRouter);

const PORT = process.env.PORT || 8080;
ensureKeys().then(() => {
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
});
