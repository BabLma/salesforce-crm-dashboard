import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Proxy endpoint for token exchange
app.post('/api/oauth/token', async (req, res) => {
  const { code, code_verifier } = req.body;

  const tokenUrl = `${process.env.VITE_SALESFORCE_LOGIN_URL}/services/oauth2/token`;

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: process.env.VITE_SALESFORCE_CLIENT_ID,
    client_secret: process.env.VITE_SALESFORCE_CLIENT_SECRET,
    redirect_uri: process.env.VITE_SALESFORCE_CALLBACK_URL,
    code_verifier: code_verifier,
  });

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Proxy endpoint for token refresh
app.post('/api/oauth/refresh', async (req, res) => {
  const { refresh_token } = req.body;

  const tokenUrl = `${process.env.VITE_SALESFORCE_LOGIN_URL}/services/oauth2/token`;

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refresh_token,
    client_id: process.env.VITE_SALESFORCE_CLIENT_ID,
    client_secret: process.env.VITE_SALESFORCE_CLIENT_SECRET,
  });

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Refresh proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Proxy endpoint for Salesforce API requests
app.use('/api/salesforce', async (req, res) => {
  const { access_token, instance_url } = req.headers;
  const path = req.url;

  if (!access_token || !instance_url) {
    return res.status(401).json({ error: 'Missing authentication headers' });
  }

  const salesforceUrl = `${instance_url}${path}`;

  try {
    const response = await fetch(salesforceUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Salesforce API proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 OAuth Proxy server running on http://localhost:${PORT}`);
});
