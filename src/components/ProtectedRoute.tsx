"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, refreshSession } = useAuth();
  const hasRedirected = useRef(false);
  const retryAttempted = useRef(false);

  useEffect(() => {
    // Don't do anything while still loading
    if (loading) {
      return;
    }

    // If we have a user, we're good
    if (user) {
      retryAttempted.current = false;
      return;
    }

    // If no user and we haven't retried yet, try refreshing once
    if (!user && !retryAttempted.current && !hasRedirected.current) {
      retryAttempted.current = true;
      refreshSession();
      // Give the refresh time to complete - the effect will re-run
      return;
    }

    // If we've retried and still no user, redirect to login
    if (!user && retryAttempted.current && !hasRedirected.current) {
      // Add a small delay to ensure we're not in a race condition
      const timeoutId = setTimeout(() => {
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          window.location.href = "/login";
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [user, loading, refreshSession]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Show loading while we're checking/refreshing session
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
