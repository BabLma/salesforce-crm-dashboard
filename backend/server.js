import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import config from './config/index.js';
import oauthRoutes from './routes/oauth.js';
import salesforceRoutes from './routes/salesforce.js';
import { errorHandler } from './middleware/auth.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/oauth', oauthRoutes);
app.use('/api/salesforce', salesforceRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Serve React static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));

  // Handle React routing - serve index.html for all non-API routes
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    } else {
      next();
    }
  });
}

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(config.PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${config.PORT}`);
  console.log(`📡 CORS enabled for: ${config.CORS_ORIGIN}`);
});
