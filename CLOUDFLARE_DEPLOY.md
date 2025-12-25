# Cloudflare Pages Deployment Guide

This project is configured to deploy to Cloudflare Pages without using Wrangler CLI.

## Configuration

- **Adapter**: `@astrojs/cloudflare` (configured in `astro.config.mjs`)
- **Output**: Server-side rendering (SSR)
- **Routes**: Configured via `_routes.json`

## Deployment Steps

### Option 1: Deploy via Cloudflare Dashboard (Recommended)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** → **Create a project**
3. Connect your Git repository (GitHub, GitLab, or Bitbucket)
4. Configure build settings:
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (or leave empty)
5. Click **Save and Deploy**

### Option 2: Deploy via Cloudflare CLI (cf)

If you have Cloudflare CLI installed:

```bash
npx wrangler pages deploy dist
```

Note: This uses Wrangler only for deployment, not for local development.

## Environment Variables

**Required Environment Variable:**
- `SIMPLE_CASHIER_BASE_URL` - The base URL for your API backend

To configure environment variables:

1. Go to your Cloudflare Pages project settings
2. Navigate to **Settings** → **Environment variables**
3. Add `SIMPLE_CASHIER_BASE_URL` with your API base URL
4. Configure for Production, Preview, and/or Development environments as needed

**Important**: Make sure to set this variable before deploying, as the application will fail to start without it.

## Important Notes

- The `_routes.json` file ensures all routes are handled by the Cloudflare Pages Functions
- API routes in `src/pages/api/` will work automatically as Cloudflare Functions
- The build output in `dist/` is ready for Cloudflare Pages deployment
- No Wrangler configuration file is needed for Pages deployment

## Build Output

After running `pnpm build`, the `dist/` folder contains:
- `_worker.js` - Cloudflare Worker entry point
- `client/` - Static assets
- `server/` - Server-side code

