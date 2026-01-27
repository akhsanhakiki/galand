import { createAuthClient } from '@neondatabase/neon-js/auth';
import { getNeonAuthUrl } from './env';

/**
 * Create and export the Neon Auth client
 * Uses PUBLIC_NEON_AUTH_URL which is accessible in client components
 * 
 * Note: This is initialized at module level, but since PUBLIC_NEON_AUTH_URL
 * is a public env var, it should be available at build time in Netlify.
 * If this causes issues, ensure PUBLIC_NEON_AUTH_URL is set in Netlify.
 */
let authClient: ReturnType<typeof createAuthClient>;

try {
  authClient = createAuthClient(getNeonAuthUrl());
} catch (error) {
  // During SSR/build, if env var is missing, create a placeholder
  // This will be replaced when the client hydrates
  if (typeof window === 'undefined') {
    authClient = createAuthClient('https://placeholder.neon.tech');
  } else {
    // In browser, re-throw the error
    throw error;
  }
}

export { authClient };
