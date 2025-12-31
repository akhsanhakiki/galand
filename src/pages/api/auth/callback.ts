import type { APIRoute } from "astro";

export const prerender = false;

/**
 * OAuth callback handler
 * Extracts token from URL and saves to HTTP-only cookie
 * Then redirects to /ringkasan
 */
export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  try {
    // Extract token from URL query parameters
    const token = url.searchParams.get("token");
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      return redirect("/login?error=" + encodeURIComponent(error), 302);
    }

    // If token is in URL, save it to HTTP-only cookie
    if (token) {
      cookies.set("neon_auth_token", token, {
        path: "/",
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    // If code is present (OAuth flow), the Neon Auth SDK will handle it
    // Just redirect to ringkasan - the client will handle session
    return redirect("/ringkasan", 302);
  } catch (error) {
    return redirect("/login?error=" + encodeURIComponent("Authentication failed"), 302);
  }
};
