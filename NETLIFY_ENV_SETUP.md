# Netlify Environment Variables Setup

This document lists all the environment variables that need to be configured in Netlify for the application to work correctly.

## Required Environment Variables

### 1. `SIMPLE_CASHIER_BASE_URL`
- **Description**: The base URL of your backend API
- **Example**: `https://api.example.com` or `https://your-api.herokuapp.com`
- **Required for**: All API routes to function properly
- **Where to set**: Netlify Dashboard → Site settings → Environment variables

### 2. `PUBLIC_NEON_AUTH_URL`
- **Description**: The Neon Auth service URL for authentication
- **Example**: `https://your-neon-auth-url.neon.tech`
- **Required for**: User authentication and session management
- **Where to set**: Netlify Dashboard → Site settings → Environment variables
- **Note**: The `PUBLIC_` prefix is required for client-side access

## How to Set Environment Variables in Netlify

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your site (`mbdara`)
3. Navigate to **Site settings** (gear icon in the top navigation)
4. Click on **Environment variables** in the left sidebar
5. Click **Add a variable** for each required variable:
   - **Key**: `SIMPLE_CASHIER_BASE_URL`
   - **Value**: Your API base URL
   - **Scopes**: Select "All scopes" (or specific scopes if needed)
6. Repeat for `PUBLIC_NEON_AUTH_URL`
7. After adding variables, you need to **trigger a new deploy**:
   - Go to **Deploys** tab
   - Click **Trigger deploy** → **Deploy site**

## Troubleshooting

### Still getting 500 errors after setting variables?

1. **Verify variables are set correctly**:
   - Check that variable names match exactly (case-sensitive)
   - Ensure there are no extra spaces or quotes in the values
   - Verify the URLs are correct and accessible

2. **Redeploy after setting variables**:
   - Environment variables are only available after a new deploy
   - Go to Deploys → Trigger deploy → Deploy site

3. **Check Netlify Function logs**:
   - Go to Functions tab in Netlify dashboard
   - Check for any error messages in the logs

4. **Verify your API is accessible**:
   - Test your `SIMPLE_CASHIER_BASE_URL` in a browser or with curl
   - Ensure CORS is configured correctly if needed

### Common Issues

- **Variable not found**: Make sure you've redeployed after adding the variable
- **Still getting errors**: Check that the variable names match exactly (no typos)
- **Works locally but not on Netlify**: Local `.env.local` file doesn't affect Netlify - you must set variables in the dashboard
