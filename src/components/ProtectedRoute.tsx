"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Don't do anything while still loading
    if (loading) {
      return;
    }

    // If we have a user, we're good
    if (user) {
      hasRedirected.current = false;
      return;
    }

    // No user after loading finished -> redirect to login.
    // Guard against redirect loops (in case this component is ever mounted on /login).
    if (!hasRedirected.current && window.location.pathname !== "/login") {
      hasRedirected.current = true;
      window.location.replace("/login");
    }
  }, [user, loading]);

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
