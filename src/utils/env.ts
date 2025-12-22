/**
 * Get the API base URL from environment variables
 *
 * Requires SIMPLE_CASHIER_BASE_URL to be set in .env.local
 */
export function getApiBaseUrl(): string {
  const baseUrl = import.meta.env.SIMPLE_CASHIER_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      "SIMPLE_CASHIER_BASE_URL environment variable is required. " +
        "Please set it in your .env.local file."
    );
  }

  return baseUrl;
}
