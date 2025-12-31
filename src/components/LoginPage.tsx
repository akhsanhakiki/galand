"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  TextField,
  Input,
  Label,
  FieldError,
  Description,
  Alert,
  Separator,
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
    // Check for OAuth callback - if we're coming back from OAuth, redirect to ringkasan
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const code = urlParams.get("code");
    
    // If we have a token or code in URL, we're coming back from OAuth
    // The callback API route will handle saving the token, so just check session
    if (token || code) {
      // Give a moment for the callback to process, then check session
      setTimeout(() => {
        authClient
          .getSession()
          .then((result) => {
            if (result.data?.session && result.data?.user) {
              // Redirect to ringkasan after successful OAuth
              window.location.href = "/ringkasan";
            } else {
              setLoading(false);
            }
          })
          .catch(() => {
            setLoading(false);
          });
      }, 500);
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
          window.location.href = "/ringkasan";
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
        setError(result.error.message);
        setSubmitting(false);
        return;
      }

      // Get session after successful sign in/up
      const sessionResult = await authClient.getSession();
      if (sessionResult.data?.session && sessionResult.data?.user) {
        setSession(sessionResult.data.session);
        setUser(sessionResult.data.user);
        // Redirect to ringkasan page after successful login
        window.location.href = "/ringkasan";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
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
      setError(err instanceof Error ? err.message : "Failed to sign in with Google");
      setOauthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
            <p className="text-muted">Loading...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (session && user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <Card.Header>
            <Card.Title>Welcome back!</Card.Title>
            <Card.Description>You are logged in</Card.Description>
          </Card.Header>
          <Card.Content className="space-y-2">
            <div>
              <p className="text-sm text-muted">Email:</p>
              <p className="font-medium">{user.email}</p>
            </div>
            {user.name && (
              <div>
                <p className="text-sm text-muted">Name:</p>
                <p className="font-medium">{user.name}</p>
              </div>
            )}
          </Card.Content>
          <Card.Footer className="flex flex-col gap-2">
            <Button
              fullWidth
              variant="secondary"
              onPress={() => (window.location.href = "/ringkasan")}
            >
              Go to Dashboard
            </Button>
            <Button fullWidth variant="ghost" onPress={handleSignOut}>
              Sign Out
            </Button>
          </Card.Footer>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <Card.Header>
          <Card.Title>{isSignUp ? "Create Account" : "Sign In"}</Card.Title>
          <Card.Description>
            {isSignUp
              ? "Enter your information to create a new account"
              : "Enter your credentials to access your account"}
          </Card.Description>
        </Card.Header>
        <form onSubmit={handleSubmit}>
          <Card.Content className="space-y-4">
            {error && (
              <Alert status="danger" className="w-full">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Error</Alert.Title>
                  <Alert.Description>{error}</Alert.Description>
                </Alert.Content>
              </Alert>
            )}
            <TextField
              isRequired
              name="email"
              type="email"
              value={email}
              onChange={setEmail}
              isDisabled={submitting}
            >
              <Label>Email</Label>
              <Input placeholder="email@example.com" />
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
            >
              <Label>Password</Label>
              <Input placeholder="••••••••" />
              {isSignUp && (
                <Description>Password must be at least 8 characters</Description>
              )}
              <FieldError />
            </TextField>
          </Card.Content>
          <Card.Footer className="mt-4 flex flex-col gap-2">
            <Button
              type="submit"
              fullWidth
              isPending={submitting}
              isDisabled={submitting || oauthLoading}
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>

            <div className="flex items-center gap-3 py-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted">or</span>
              <Separator className="flex-1" />
            </div>

            <Button
              fullWidth
              variant="tertiary"
              onPress={handleGoogleSignIn}
              isPending={oauthLoading}
              isDisabled={submitting || oauthLoading}
            >
              <FcGoogle className="text-xl" />
              Continue with Google
            </Button>
            <div className="text-center text-sm">
              {isSignUp ? (
                <p className="text-muted">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setError(null);
                    }}
                    className="text-accent hover:underline"
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
                    className="text-accent hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              )}
            </div>
          </Card.Footer>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
