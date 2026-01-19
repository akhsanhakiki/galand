"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authClient } from "../utils/auth";

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role?: string;
}

interface Session {
  id: string;
  userId: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async (retryCount = 0) => {
    try {
      // Add a small delay on retry to allow cookies to be set
      if (retryCount > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500 * retryCount));
      }

      const result = await authClient.getSession();
      
      // Debug: Log the full result to see what's available
      console.log('=== Neon Auth getSession() Result ===');
      console.log('Full result object:', result);
      console.log('Result.data:', result.data);
      console.log('Result.data?.session:', result.data?.session);
      console.log('Result.data?.user:', result.data?.user);
      console.log('Session keys:', result.data?.session ? Object.keys(result.data.session) : 'No session');
      console.log('All result.data keys:', result.data ? Object.keys(result.data) : 'No data');
      
      // Check for token in various possible locations
      if (result.data?.session) {
        console.log('Session.token:', result.data.session.token);
        console.log('Session.accessToken:', result.data.session.accessToken);
        console.log('Session.sessionToken:', result.data.session.sessionToken);
      }
      if (result.data) {
        console.log('result.data.token:', result.data.token);
        console.log('result.data.accessToken:', result.data.accessToken);
      }
      console.log('=====================================');
      
      // Check if we have a valid session
      if (result.data?.session && result.data?.user) {
        setSession(result.data.session);
        setUser(result.data.user);
        setLoading(false);
      } else {
        // Check if there's an error in the result
        if (result.error) {
          // If error on first attempt, retry once
          if (retryCount === 0) {
            await refreshSession(1);
          } else {
            setSession(null);
            setUser(null);
            setLoading(false);
          }
        } else {
          // If no session, check if we should retry
          // Retry up to 2 times to handle OAuth callback scenarios
          if (retryCount < 2) {
            await refreshSession(retryCount + 1);
          } else {
            // After retries, set to null
            setSession(null);
            setUser(null);
            setLoading(false);
          }
        }
      }
    } catch (error) {
      // If error, retry up to 2 times
      if (retryCount < 2) {
        await refreshSession(retryCount + 1);
      } else {
        setSession(null);
        setUser(null);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    refreshSession();
    
    // Also listen for storage events in case session is updated in another tab
    const handleStorageChange = () => {
      refreshSession();
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const signOut = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      // Continue with sign out even if API call fails
    } finally {
      setSession(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
