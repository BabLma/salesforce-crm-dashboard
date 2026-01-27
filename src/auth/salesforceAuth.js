// Salesforce OAuth 2.0 Configuration and Utility Functions

const CLIENT_ID = import.meta.env.VITE_SALESFORCE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SALESFORCE_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_SALESFORCE_CALLBACK_URL;
const LOGIN_URL = import.meta.env.VITE_SALESFORCE_LOGIN_URL;

/**
 * Generates a random string for PKCE code verifier
 */
const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
};

/**
 * Base64 URL encode without padding
 */
const base64URLEncode = (buffer) => {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

/**
 * Creates SHA256 hash of the code verifier
 */
const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return hash;
};

/**
 * Generates code challenge from code verifier
 */
const generateCodeChallenge = async (verifier) => {
  const hashed = await sha256(verifier);
  return base64URLEncode(hashed);
};

/**
 * Generates the Salesforce OAuth authorization URL with PKCE
 * Redirects user to Salesforce login page
 */
export const initiateLogin = async () => {
  // Generate PKCE code verifier and challenge
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store code verifier for later use
  sessionStorage.setItem('pkce_code_verifier', codeVerifier);

  const authUrl = `${LOGIN_URL}/services/oauth2/authorize?` +
    `response_type=code&` +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `code_challenge=${codeChallenge}&` +
    `code_challenge_method=S256&` +
    `scope=api refresh_token offline_access`;

  window.location.href = authUrl;
};

/**
 * Exchanges authorization code for access token with PKCE
 * Called after redirect from Salesforce
 */
export const exchangeCodeForToken = async (code) => {
  // Retrieve the code verifier from storage
  const codeVerifier = sessionStorage.getItem('pkce_code_verifier');

  if (!codeVerifier) {
    throw new Error('Code verifier not found. Please try logging in again.');
  }

  try {
    // Use proxy server to avoid CORS issues
    const response = await fetch('http://localhost:3001/api/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Failed to exchange token');
    }

    const data = await response.json();

    // Clear the code verifier after successful exchange
    sessionStorage.removeItem('pkce_code_verifier');

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      instanceUrl: data.instance_url,
      userId: data.id,
    };
  } catch (error) {
    console.error('Token exchange error:', error);
    throw error;
  }
};

/**
 * Stores authentication tokens in sessionStorage
 */
export const storeAuthTokens = (authData) => {
  sessionStorage.setItem('sf_access_token', authData.accessToken);
  sessionStorage.setItem('sf_refresh_token', authData.refreshToken);
  sessionStorage.setItem('sf_instance_url', authData.instanceUrl);
  sessionStorage.setItem('sf_user_id', authData.userId);
};

/**
 * Retrieves authentication tokens from sessionStorage
 */
export const getAuthTokens = () => {
  return {
    accessToken: sessionStorage.getItem('sf_access_token'),
    refreshToken: sessionStorage.getItem('sf_refresh_token'),
    instanceUrl: sessionStorage.getItem('sf_instance_url'),
    userId: sessionStorage.getItem('sf_user_id'),
  };
};

/**
 * Checks if user is authenticated
 */
export const isAuthenticated = () => {
  const { accessToken, instanceUrl } = getAuthTokens();
  return !!(accessToken && instanceUrl);
};

/**
 * Clears all authentication data and logs out
 */
export const logout = () => {
  sessionStorage.removeItem('sf_access_token');
  sessionStorage.removeItem('sf_refresh_token');
  sessionStorage.removeItem('sf_instance_url');
  sessionStorage.removeItem('sf_user_id');
  window.location.href = '/';
};

/**
 * Refreshes the access token using refresh token
 */
export const refreshAccessToken = async () => {
  const { refreshToken } = getAuthTokens();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    // Use proxy server to avoid CORS issues
    const response = await fetch('http://localhost:3001/api/oauth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    sessionStorage.setItem('sf_access_token', data.access_token);

    return data.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    logout();
    throw error;
  }
};
