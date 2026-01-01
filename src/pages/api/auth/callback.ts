import type { APIRoute } from "astro";

export const prerender = false;

/**
 * OAuth callback handler
 * Redirects to a dedicated callback page that handles OAuth completion
 * The Neon Auth SDK will complete the OAuth flow on the client side
 */
export const GET: APIRoute = async ({ url, redirect }) => {
  try {
    const error = url.searchParams.get("error");

    // Handle OAuth errors - redirect to login with error
    if (error) {
      return redirect("/login?error=" + encodeURIComponent(error), 302);
    }

    // Redirect to dedicated callback page with all OAuth parameters
    // This allows the client-side SDK to complete the OAuth flow
    const redirectUrl = new URL("/auth/callback", url.origin);
    
    // Copy all query parameters to preserve the OAuth callback data
    url.searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });
    
    return redirect(redirectUrl.toString(), 302);
  } catch (error) {
    return redirect("/login?error=" + encodeURIComponent("Authentication failed"), 302);
  }
};
