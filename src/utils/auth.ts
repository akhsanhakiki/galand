import { createAuthClient } from '@neondatabase/neon-js/auth';
import { getNeonAuthUrl } from './env';

/**
 * Create and export the Neon Auth client
 * Uses PUBLIC_NEON_AUTH_URL which is accessible in client components
 */
export const authClient = createAuthClient(getNeonAuthUrl());
