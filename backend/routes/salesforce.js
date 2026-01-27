import { Router } from 'express';

const router = Router();

/**
 * Middleware to validate authentication headers
 */
const validateAuth = (req, res, next) => {
  const { access_token, instance_url } = req.headers;

  if (!access_token || !instance_url) {
    return res.status(401).json({ error: 'Missing authentication headers' });
  }

  req.salesforce = {
    accessToken: access_token,
    instanceUrl: instance_url,
  };

  next();
};

/**
 * ALL /api/salesforce/*
 * Proxy for Salesforce REST API requests
 */
router.use('/', validateAuth, async (req, res) => {
  const { accessToken, instanceUrl } = req.salesforce;
  const path = req.url;

  const salesforceUrl = `${instanceUrl}${path}`;

  // Build headers - include Salesforce-specific headers from frontend
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  // Forward Salesforce-specific headers if present
  if (req.headers['sforce-duplicate-rule-header']) {
    headers['Sforce-Duplicate-Rule-Header'] = req.headers['sforce-duplicate-rule-header'];
  }

  try {
    const response = await fetch(salesforceUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    // Handle 204 No Content (e.g., DELETE)
    if (response.status === 204) {
      return res.status(204).send();
    }

    // Try to parse JSON response
    try {
      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      res.json(data);
    } catch (jsonError) {
      // No JSON body - just send the status
      res.status(response.status).send();
    }
  } catch (error) {
    console.error('Salesforce API proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy request to Salesforce' });
  }
});

export default router;
