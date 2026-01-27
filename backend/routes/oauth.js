import { Router } from 'express';
import config from '../config/index.js';

const router = Router();

/**
 * POST /api/oauth/token
 * Exchanges authorization code for access token
 */
router.post('/token', async (req, res) => {
  const { code, code_verifier } = req.body;

  const tokenUrl = `${config.SALESFORCE.LOGIN_URL}/services/oauth2/token`;

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: config.SALESFORCE.CLIENT_ID,
    client_secret: config.SALESFORCE.CLIENT_SECRET,
    redirect_uri: config.SALESFORCE.CALLBACK_URL,
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
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/oauth/refresh
 * Refreshes access token using refresh token
 */
router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;

  const tokenUrl = `${config.SALESFORCE.LOGIN_URL}/services/oauth2/token`;

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refresh_token,
    client_id: config.SALESFORCE.CLIENT_ID,
    client_secret: config.SALESFORCE.CLIENT_SECRET,
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
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
