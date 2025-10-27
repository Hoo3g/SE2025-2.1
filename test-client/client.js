import express from 'express';
import { Issuer, generators } from 'openid-client';

const app = express();

// Store state and nonce in memory (use a proper session store in production)
const states = new Set();
const nonces = new Set();

// Initialize OpenID Client
const initializeClient = async () => {
  const issuerUrl = 'http://localhost:3000';
  const issuer = await Issuer.discover(`${issuerUrl}/.well-known/openid-configuration`);
  console.log('Discovered issuer configuration:', issuer.metadata);

  return new issuer.Client({
    client_id: 'example_client',
    client_secret: 'example_secret',
    redirect_uris: ['http://localhost:3001/callback'],
    response_types: ['code'],
  });
};

let client;
initializeClient().then(c => {
  client = c;
}).catch(err => {
  console.error('Failed to initialize client:', err);
});

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>OIDC Test Client</h1>
        <a href="/login">Login with OIDC</a>
      </body>
    </html>
  `);
});

app.get('/login', (req, res) => {
  if (!client) {
    return res.status(500).send('Client not initialized');
  }

  const state = generators.state();
  const nonce = generators.nonce();
  states.add(state);
  nonces.add(nonce);

  const url = client.authorizationUrl({
    scope: 'openid profile email',
    state,
    nonce,
  });

  res.redirect(url);
});

app.get('/callback', async (req, res) => {
  if (!client) {
    return res.status(500).send('Client not initialized');
  }

  const params = client.callbackParams(req);
  const state = params.state;

  if (!states.has(state)) {
    return res.status(400).send('Invalid state');
  }
  states.delete(state);

  try {
    const tokenSet = await client.callback('http://localhost:3001/callback', params, {
      state,
      nonce: nonces.values().next().value,
    });
    nonces.clear();

    const userinfo = await client.userinfo(tokenSet.access_token);

    res.send(`
      <html>
        <body>
          <h1>Login Successful</h1>
          <h2>Token Set:</h2>
          <pre>${JSON.stringify(tokenSet, null, 2)}</pre>
          <h2>User Info:</h2>
          <pre>${JSON.stringify(userinfo, null, 2)}</pre>
          <a href="/">Back to Home</a>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Callback error:', err);
    res.status(500).send(`Authentication failed: ${err.message}`);
  }
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test client running at http://localhost:${PORT}`);
});