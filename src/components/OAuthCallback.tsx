"use client";

import { useEffect, useState } from "react";
import { authClient } from "../utils/auth";

export default function OAuthCallback() {
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters - these are needed for the SDK to complete OAuth
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get("error");
        const code = urlParams.get("code");
        const token = urlParams.get("token");

        if (errorParam) {
          setError(errorParam);
          setStatus("error");
          setTimeout(() => {
            window.location.href =
              "/login?error=" + encodeURIComponent(errorParam);
          }, 2000);
          return;
        }

        // If we have code or token, the Neon Auth SDK needs to complete the OAuth flow
        // The SDK should automatically handle this when getSession() is called
        // But we need to wait for the SDK to process the callback

        // Wait a bit longer for the SDK to process the OAuth callback
        // The SDK might need to exchange the code/token for a session
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Try to get session - the SDK should have processed the OAuth callback by now
        let attempts = 0;
        let sessionResult = await authClient.getSession();

        // Retry up to 6 times with increasing delays
        // OAuth flow might take time to complete
        while (
          (!sessionResult.data?.session || !sessionResult.data?.user) &&
          attempts < 6
        ) {
          await new Promise((resolve) =>
            setTimeout(resolve, 800 + attempts * 400),
          );
          sessionResult = await authClient.getSession();
          attempts++;
        }

        if (sessionResult.data?.session && sessionResult.data?.user) {
          setStatus("success");
          // Clean up URL before redirecting
          window.history.replaceState({}, "", "/ringkasan");
          // Redirect to ringkasan after successful authentication
          setTimeout(() => {
            window.location.href = "/ringkasan";
          }, 500);
        } else {
          // If we still don't have a session, there might be an issue
          // Check if we have the callback parameters
          if (!code && !token) {
            setError(
              "Missing OAuth callback parameters. Please try logging in again.",
            );
          } else {
            setError(
              "Failed to establish session. The authentication may have expired. Please try logging in again.",
            );
          }
          setStatus("error");
          setTimeout(() => {
            window.location.href =
              "/login?error=" + encodeURIComponent("Authentication failed");
          }, 3000);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred during authentication",
        );
        setStatus("error");
        setTimeout(() => {
          window.location.href =
            "/login?error=" + encodeURIComponent("Authentication failed");
        }, 2000);
      }
    };

    handleCallback();
  }, []);

  if (status === "processing") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-muted">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-success" />
          <p className="text-foreground">
            Authentication successful! Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 rounded-full bg-danger" />
        <p className="text-danger">{error || "Authentication failed"}</p>
        <p className="text-sm text-muted">Redirecting to login...</p>
      </div>
    </div>
  );
}
