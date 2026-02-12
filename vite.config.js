import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  define: {
    'import.meta.env.VITE_PROXY_URL': JSON.stringify(process.env.VITE_PROXY_URL || 'http://localhost:3001'),
    'import.meta.env.VITE_SALESFORCE_CALLBACK_URL': JSON.stringify(process.env.VITE_SALESFORCE_CALLBACK_URL),
    'import.meta.env.VITE_SALESFORCE_CLIENT_ID': JSON.stringify(process.env.VITE_SALESFORCE_CLIENT_ID),
    'import.meta.env.VITE_SALESFORCE_CLIENT_SECRET': JSON.stringify(process.env.VITE_SALESFORCE_CLIENT_SECRET),
    'import.meta.env.VITE_SALESFORCE_LOGIN_URL': JSON.stringify(process.env.VITE_SALESFORCE_LOGIN_URL),
    'import.meta.env.VITE_SALESFORCE_API_VERSION': JSON.stringify(process.env.VITE_SALESFORCE_API_VERSION),
  },
})