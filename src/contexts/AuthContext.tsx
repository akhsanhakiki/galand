"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authClient } from "../utils/auth";

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
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

  const refreshSession = async () => {
    try {
      const result = await authClient.getSession();
      if (result.data?.session && result.data?.user) {
        setSession(result.data.session);
        setUser(result.data.user);
      } else {
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const signOut = async () => {
    await authClient.signOut();
    setSession(null);
    setUser(null);
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
