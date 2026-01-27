/**
 * Get the API base URL from environment variables
 *
 * Requires SIMPLE_CASHIER_BASE_URL to be set in environment variables.
 * For local development, set it in .env.local
 * For production (Netlify), set it in the Netlify dashboard under Site settings > Environment variables
 */
export function getApiBaseUrl(): string {
  const baseUrl = import.meta.env.SIMPLE_CASHIER_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      "SIMPLE_CASHIER_BASE_URL environment variable is required. " +
        "Please set it in your environment variables. " +
        "For Netlify: Site settings > Environment variables",
    );
  }

  return baseUrl;
}

/**
 * Get the Neon Auth URL from environment variables
 *
 * Requires PUBLIC_NEON_AUTH_URL to be set in .env.local
 * Note: Uses PUBLIC_ prefix because auth client is used in client components
 */
export function getNeonAuthUrl(): string {
  const authUrl = import.meta.env.PUBLIC_NEON_AUTH_URL;

  if (!authUrl) {
    throw new Error(
      "PUBLIC_NEON_AUTH_URL environment variable is required. " +
        "Please set it in your .env.local file.",
    );
  }

  return authUrl;
}
