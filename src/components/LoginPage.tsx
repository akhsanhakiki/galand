"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Input,
  Label,
  FieldError,
  Description,
  Alert,
} from "@heroui/react";
import { authClient } from "../utils/auth";
import { FcGoogle } from "react-icons/fc";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface Session {
  id: string;
  userId: string;
}

const LoginPage = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for OAuth callback - if we're coming back from OAuth, complete the flow
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    // Handle OAuth errors
    if (error) {
      setError(error);
      setLoading(false);
      // Clean up URL
      window.history.replaceState({}, "", "/login");
      return;
    }

    // If we have a token or code in URL, we're coming back from OAuth
    // The Neon Auth SDK needs to complete the OAuth flow
    if (token || code) {
      const completeOAuthFlow = async (attempt = 0) => {
        try {
          // Wait a bit for any cookies to be set by the SDK
          await new Promise((resolve) => setTimeout(resolve, 500 + attempt * 300));
          
          // Try to get the session - the SDK should have completed the OAuth flow
          const result = await authClient.getSession();
          
          if (result.data?.session && result.data?.user) {
            setSession(result.data.session);
            setUser(result.data.user);
            // Clean up URL parameters
            window.history.replaceState({}, "", "/ringkasan");
            // Redirect to ringkasan after successful OAuth
            window.location.href = "/ringkasan";
          } else if (attempt < 3) {
            // Retry up to 3 more times - OAuth flow might need more time
            completeOAuthFlow(attempt + 1);
          } else {
            // If we've exhausted retries, show error
            setError("Failed to complete authentication. Please try again.");
            setLoading(false);
            // Clean up URL
            window.history.replaceState({}, "", "/login");
          }
        } catch (err) {
          if (attempt < 3) {
            completeOAuthFlow(attempt + 1);
          } else {
            setError(
              err instanceof Error ? err.message : "Authentication failed. Please try again."
            );
            setLoading(false);
            // Clean up URL
            window.history.replaceState({}, "", "/login");
          }
        }
      };
      
      completeOAuthFlow();
      return;
    }

    // Check for existing session on mount
    authClient
      .getSession()
      .then((result) => {
        if (result.data?.session && result.data?.user) {
          setSession(result.data.session);
          setUser(result.data.user);
          // If user is already logged in, redirect to ringkasan
          // Use a small delay to ensure state is set
          setTimeout(() => {
            window.location.href = "/ringkasan";
          }, 100);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = isSignUp
        ? await authClient.signUp.email({
            name: email.split("@")[0] || "User",
            email,
            password,
          })
        : await authClient.signIn.email({ email, password });

      if (result.error) {
        setError(result.error.message || "An unexpected error occurred");
        setSubmitting(false);
        return;
      }

      // Get session after successful sign in/up
      // Retry a few times to ensure session is available
      let sessionResult = await authClient.getSession();
      let attempts = 0;
      while (
        (!sessionResult.data?.session || !sessionResult.data?.user) &&
        attempts < 3
      ) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        sessionResult = await authClient.getSession();
        attempts++;
      }

      if (sessionResult.data?.session && sessionResult.data?.user) {
        setSession(sessionResult.data.session);
        setUser(sessionResult.data.user);
        // Small delay to ensure state is set before redirect
        setTimeout(() => {
          window.location.href = "/ringkasan";
        }, 100);
      } else {
        setError("Failed to establish session. Please try again.");
        setSubmitting(false);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    setSession(null);
    setUser(null);
    setEmail("");
    setPassword("");
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setOauthLoading(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/api/auth/callback`,
      });
      // The redirect will happen automatically, so we don't need to do anything else
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sign in with Google"
      );
      setOauthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (session && user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-lg bg-surface p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-light text-foreground">
              Welcome back!
            </h2>
            <p className="mt-2 text-sm text-muted">You are logged in</p>
          </div>
          <div className="space-y-4 mb-6">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">
                Email
              </p>
              <p className="mt-1 text-base font-normal text-foreground">
                {user.email}
              </p>
            </div>
            {user.name && (
              <div>
                <p className="text-xs text-muted uppercase tracking-wide">
                  Name
                </p>
                <p className="mt-1 text-base font-normal text-foreground">
                  {user.name}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Button
              fullWidth
              variant="secondary"
              onPress={() => (window.location.href = "/ringkasan")}
              className="font-normal"
            >
              Go to Dashboard
            </Button>
            <Button
              fullWidth
              variant="ghost"
              onPress={handleSignOut}
              className="font-normal"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-12">
        <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Left Section - Info */}
          <div className="flex flex-col justify-center space-y-8 lg:pr-8">
            <div>
              <h1 className="text-4xl font-light leading-tight text-foreground md:text-5xl lg:text-6xl">
                {isSignUp ? "Let's get started" : "Let's collaborate"}
              </h1>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted">
                  Contact
                </p>
                <p className="mt-2 text-base text-foreground">
                  support@galand.com
                </p>
              </div>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted">
                    Find us
                  </p>
                  <div className="mt-2 flex gap-4 text-sm text-foreground">
                    <span>FB</span>
                    <span>IG</span>
                    <span>TW</span>
                    <span>LI</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted">
                    Location
                  </p>
                  <p className="mt-2 text-base text-foreground">
                    Jakarta, Indonesia
                  </p>
                  <p className="mt-1 text-sm text-muted">+62 21 1234 5678</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Login Form */}
          <div className="flex flex-col justify-center">
            <div className="w-full max-w-md">
              <h2 className="mb-8 text-2xl font-light text-foreground">
                {isSignUp ? "Create account" : "Sign in"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert status="danger" className="w-full">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>Error</Alert.Title>
                      <Alert.Description>{error}</Alert.Description>
                    </Alert.Content>
                  </Alert>
                )}

                <div className="space-y-6">
                  <TextField
                    isRequired
                    name="email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    isDisabled={submitting}
                    className="login-form-field"
                  >
                    <Label>Email</Label>
                    <Input placeholder="Email address" />
                    <FieldError />
                  </TextField>

                  <TextField
                    isRequired
                    name="password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    isDisabled={submitting}
                    validate={(value) => {
                      if (isSignUp && value.length < 8) {
                        return "Password must be at least 8 characters";
                      }
                      return null;
                    }}
                    className="login-form-field"
                  >
                    <Label>Password</Label>
                    <Input placeholder="Password" />
                    {isSignUp && (
                      <Description className="mt-1 text-xs text-muted">
                        Password must be at least 8 characters
                      </Description>
                    )}
                    <FieldError />
                  </TextField>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    fullWidth
                    isPending={submitting}
                    isDisabled={submitting || oauthLoading}
                    className="group justify-between bg-foreground text-background hover:bg-foreground/90 font-normal rounded-none px-6 py-3"
                  >
                    <span>{isSignUp ? "Sign Up" : "Sign In"}</span>
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Button>
                </div>

                <div className="flex items-center gap-4 py-4">
                  <div className="h-px flex-1 bg-border"></div>
                  <span className="text-xs text-muted">or</span>
                  <div className="h-px flex-1 bg-border"></div>
                </div>

                <Button
                  fullWidth
                  variant="ghost"
                  onPress={handleGoogleSignIn}
                  isPending={oauthLoading}
                  isDisabled={submitting || oauthLoading}
                  className="font-normal rounded-none border border-border hover:bg-surface"
                >
                  <FcGoogle className="mr-2 text-xl" />
                  Continue with Google
                </Button>

                <div className="pt-4 text-center text-sm">
                  {isSignUp ? (
                    <p className="text-muted">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(false);
                          setError(null);
                        }}
                        className="text-foreground hover:underline font-normal"
                      >
                        Sign in
                      </button>
                    </p>
                  ) : (
                    <p className="text-muted">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(true);
                          setError(null);
                        }}
                        className="text-foreground hover:underline font-normal"
                      >
                        Sign up
                      </button>
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
