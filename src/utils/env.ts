/**
 * Get the API base URL from environment variables
 *
 * Supports both Cloudflare Pages (import.meta.env) and local development (.env.local)
 */
export function getApiBaseUrl(): string {
  // Cloudflare Pages uses import.meta.env for environment variables
  // Local development can use .env.local
  const baseUrl = import.meta.env.SIMPLE_CASHIER_BASE_URL || 
                  import.meta.env.PUBLIC_SIMPLE_CASHIER_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      "SIMPLE_CASHIER_BASE_URL environment variable is required. " +
        "Please set it in Cloudflare Pages environment variables or your .env.local file."
    );
  }

  return baseUrl;
}
