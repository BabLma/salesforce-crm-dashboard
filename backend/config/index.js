export default {
  PORT: process.env.PORT || 3001,
  SALESFORCE: {
    CLIENT_ID: process.env.SALESFORCE_CLIENT_ID || process.env.VITE_SALESFORCE_CLIENT_ID,
    CLIENT_SECRET: process.env.SALESFORCE_CLIENT_SECRET || process.env.VITE_SALESFORCE_CLIENT_SECRET,
    CALLBACK_URL: process.env.VITE_SALESFORCE_CALLBACK_URL,
    LOGIN_URL: process.env.VITE_SALESFORCE_LOGIN_URL,
  },
  CORS_ORIGIN: process.env.NODE_ENV === 'production'
    ? process.env.RENDER_EXTERNAL_URL || '*'
    : (process.env.CORS_ORIGIN || 'http://localhost:3000'),
};
