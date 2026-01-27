# Personal CRM Dashboard

Full-stack CRM dashboard built with React and Salesforce REST APIs, featuring OAuth 2.0 authentication, lead conversion workflow, and WCAG accessibility standards.

## Features

- ✅ OAuth 2.0 PKCE authentication with Salesforce
- ✅ Contact and Lead management with CRUD operations
- ✅ Automated lead conversion with duplicate detection
- ✅ WCAG 2.1 accessibility compliant
- ✅ Material-UI responsive design
- ✅ Search and filter functionality

## Tech Stack

- **Frontend:** React 19 + Vite + Material-UI
- **Backend:** Express.js + Salesforce REST API
- **Authentication:** OAuth 2.0 with PKCE
- **Deployment:** Render

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Add your Salesforce Consumer Key and Secret

3. **Run locally:**

   ```bash
   npm run dev:all    # Both frontend and backend
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
├── backend/           # Express server + Salesforce proxy
├── src/              # React frontend
│   ├── auth/         # OAuth utilities
│   ├── components/   # ContactsTable, LeadsTable, etc.
│   ├── pages/        # Login, Dashboard, Callback
│   └── services/     # Salesforce API client
└── .env              # Environment variables (gitignored)
```
