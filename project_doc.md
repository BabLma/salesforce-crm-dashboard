OVERALL GOAL (what you’ll show on your resume)

Personal CRM Dashboard

React frontend

Salesforce Developer Org as backend

Read + write CRM data (Contacts, Leads)

Authentication via Salesforce

Deployed on Netlify or Vercel

Accessibility and clean UI

This directly supports:

Full-Stack

Salesforce

React

API integration

Accessibility

Cloud deployment

PHASE 1: Salesforce Setup (Foundation)
Step 1: Confirm you are in a Developer Org

Log in to Salesforce and check:

Top-right → ⚙️ Setup

If you see Setup Home, you’re good.

If yes → move on
If not → tell me

Step 2: Enable API Access (very important)

In Setup:

Search: Session Settings

Enable:

✅ Lock sessions to the IP address from which they originated → OFF

✅ Disable CSRF protection for OAuth endpoints → ON

Save

This prevents auth issues later.

Step 3: Create Sample CRM Data

We need data to display.

Create:

5 Contacts

3 Leads

Use realistic data:

Name

Email

Phone

Account Name

Status

This makes your demo look real.

Tell me when done.

PHASE 2: Salesforce App & API Access
Step 4: Create a Connected App (OAuth)

This allows React to talk to Salesforce.

Setup → App Manager
→ New Connected App

Fill in:

Connected App Name: Personal CRM Dashboard
API Name: Personal_CRM_Dashboard
Contact Email: nlama614@gmail.com

Enable:

☑ Enable OAuth Settings

Callback URL (use this exactly for now):

http://localhost:3000/callback

OAuth Scopes (select):

Access and manage your data (api)

Perform requests on your behalf at any time (refresh_token, offline_access)

Save → wait ~2–10 minutes

Step 5: Save These Values (DO NOT SHARE)

From the Connected App:

Consumer Key

Consumer Secret

We’ll use them later in React.

PHASE 3: React Frontend (Local)
Step 6: Create React App

Choose ONE:

Option A (recommended): Vite

npm create vite@latest crm-dashboard -- --template react
cd crm-dashboard
npm install
npm run dev

Option B: Next.js (if you prefer)

npx create-next-app@latest crm-dashboard

👉 I recommend Vite for simplicity.

Tell me which one you chose.

Step 7: Project Structure

Create folders:

src/
├─ api/
├─ auth/
├─ components/
├─ pages/
├─ services/
└─ styles/

This looks professional to reviewers.

PHASE 4: Salesforce Authentication (OAuth)
Step 8: OAuth Flow (High level)

React app will:

Redirect user to Salesforce login

User authorizes app

Salesforce sends back code

React exchanges code for access_token

Use token to call APIs

We’ll implement this cleanly.

PHASE 5: Core Features (Resume Gold)
Features to Build

Start small:

MVP

Login with Salesforce

View Contacts (table)

View Leads (table)

Search/filter

Logout

Create new Contact

Edit Lead status

Accessible table navigation

Error handling

PHASE 6: Accessibility (Important for You)

You will use:

axe DevTools

Keyboard navigation

ARIA labels

Semantic HTML

This will directly map to your resume bullets.

PHASE 7: Deployment (Free)

Deploy frontend to:

Netlify or Vercel

Update Salesforce callback URL to:

https://your-app.netlify.app/callback

PHASE 8: Resume Wording (Later)

When done, you’ll add:

Personal CRM Dashboard (Salesforce Integration)

Built a React-based CRM dashboard integrated with Salesforce APIs using OAuth 2.0. Implemented secure authentication, displayed Contacts and Leads, and applied WCAG accessibility standards. Deployed on Netlify with a responsive, production-ready UI.
