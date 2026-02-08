"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Input,
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
  const [mobileStep, setMobileStep] = useState<"intro" | "login">("intro");

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
          await new Promise((resolve) =>
            setTimeout(resolve, 500 + attempt * 300)
          );

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
            setError("Gagal menyelesaikan autentikasi. Silakan coba lagi.");
            setLoading(false);
            // Clean up URL
            window.history.replaceState({}, "", "/login");
          }
        } catch (err) {
          if (attempt < 3) {
            completeOAuthFlow(attempt + 1);
          } else {
            setError(
              err instanceof Error
                ? err.message
                : "Autentikasi gagal. Silakan coba lagi."
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
            name: email.split("@")[0] || "Pengguna",
            email,
            password,
          })
        : await authClient.signIn.email({ email, password });

      if (result.error) {
        setError(
          result.error.message || "Terjadi kesalahan yang tidak terduga"
        );
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
        setError("Gagal membuat sesi. Silakan coba lagi.");
        setSubmitting(false);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan yang tidak terduga"
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
      const origin = window.location.origin;
      const callbackUrlPrimary = new URL("/auth/callback", origin).toString();
      const callbackUrlLegacy = new URL(
        "/api/auth/callback",
        origin
      ).toString();

      try {
        // Prefer the dedicated callback page (commonly what Neon/Google allowlists expect).
        // The page will complete the OAuth flow client-side via the Neon Auth SDK.
        await authClient.signIn.social({
          provider: "google",
          callbackURL: callbackUrlPrimary,
        });
      } catch (primaryErr) {
        // Some environments might still have the legacy `/api/auth/callback` allowlisted.
        // If Neon rejects the callback URL, retry with the legacy route.
        const message =
          primaryErr instanceof Error ? primaryErr.message : String(primaryErr);

        if (
          message.includes("INVALID_CALLBACKURL") ||
          message.toLowerCase().includes("invalid callbackurl") ||
          message.toLowerCase().includes("invalid callback")
        ) {
          await authClient.signIn.social({
            provider: "google",
            callbackURL: callbackUrlLegacy,
          });
        } else {
          throw primaryErr;
        }
      }
      // The redirect will happen automatically, so we don't need to do anything else
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal masuk dengan Google"
      );
      setOauthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-muted">Memuat...</p>
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
              Selamat datang kembali!
            </h2>
            <p className="mt-2 text-sm text-muted">Anda sudah masuk</p>
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
                  Nama
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
              className="font-normal bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Masuk ke Dashboard
            </Button>
            <Button
              fullWidth
              variant="ghost"
              onPress={handleSignOut}
              className="font-normal"
            >
              Keluar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col overflow-hidden bg-background md:min-h-screen">
      <div className="mx-auto flex min-h-0 flex-1 flex-col px-4 py-4 sm:py-6 md:max-w-7xl md:px-8 md:py-8 lg:px-12 w-full">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Left Section - Screen 1 on mobile (intro); always visible on desktop */}
          <div
            className={`flex flex-col justify-center space-y-8 text-center lg:pr-8 lg:text-left login-left-spawn ${
              mobileStep !== "intro" ? "hidden lg:flex" : ""
            } items-center lg:items-start`}
          >
            <div className="w-full max-w-md space-y-6 lg:max-w-none">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-accent">kadara</h1>
              </div>
              <div>
                <h1 className="text-4xl font-light leading-tight text-foreground md:text-5xl lg:text-6xl">
                  {isSignUp ? (
                    <>
                      Kelola bisnis Anda dengan{" "}
                      <span className="text-accent">mudah</span>
                    </>
                  ) : (
                    <>
                      Sistem kasir yang{" "}
                      <span className="text-accent">mudah</span>
                    </>
                  )}
                </h1>
              </div>
              <div className="space-y-3">
                <p className="text-base leading-relaxed text-muted">
                  Solusi lengkap untuk mengelola toko Anda. Mulai dari manajemen
                  produk, transaksi penjualan, hingga laporan keuangan -
                  semuanya dalam satu platform.
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-2 lg:justify-start">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    <span className="text-sm text-muted">Manajemen Produk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    <span className="text-sm text-muted">
                      Transaksi Real-time
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    <span className="text-sm text-muted">Laporan Keuangan</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4">
              <p className="text-sm text-muted">
                Made with <span className="text-accent">♥</span> by{" "}
                <span className="font-medium text-foreground">haki studio</span>
              </p>
            </div>
            <Button
              onPress={() => setMobileStep("login")}
              className="mt-6 w-full max-w-md rounded-full bg-accent px-6 py-3 font-normal text-accent-foreground hover:bg-accent/90 lg:hidden"
            >
              Lanjutkan
            </Button>
          </div>

          {/* Right Section - Screen 2 on mobile (login form); always visible on desktop */}
          <div
            className={`flex min-h-0 flex-1 flex-col items-center justify-center lg:items-start login-form-spawn ${
              mobileStep !== "login" ? "hidden lg:flex" : ""
            }`}
          >
            <div className="w-full max-w-[min(100%,22rem)] px-1 sm:max-w-md sm:px-0 lg:max-w-md">
              {/* Branding: centered on mobile, left on desktop */}
              <div className="mb-6 text-center lg:mb-8 lg:text-left">
                <div className="lg:hidden">
                  <h1 className="text-3xl font-bold text-accent sm:text-4xl">
                    kadara
                  </h1>
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-foreground sm:mt-4 sm:text-3xl lg:mt-0 lg:text-2xl lg:font-light">
                  {isSignUp ? "Buat akun" : "Selamat datang kembali"}
                </h2>
                <p className="mt-1.5 text-sm text-muted sm:mt-2">
                  {isSignUp
                    ? "Mari daftar untuk memulai"
                    : "Masuk ke kadara untuk melanjutkan"}
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex w-full flex-col space-y-4 sm:space-y-5"
              >
                {error && (
                  <Alert status="danger" className="w-full">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>Kesalahan</Alert.Title>
                      <Alert.Description>{error}</Alert.Description>
                    </Alert.Content>
                  </Alert>
                )}

                <div className="flex w-full flex-col gap-4">
                  <TextField
                    isRequired
                    name="email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    isDisabled={submitting}
                    className="w-full"
                    aria-label="Email"
                  >
                    <Input placeholder="Alamat email" className="w-full" />
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
                        return "Kata sandi minimal 8 karakter";
                      }
                      return null;
                    }}
                    className="w-full"
                    aria-label="Kata Sandi"
                  >
                    <Input placeholder="Kata sandi" className="w-full" />
                    {isSignUp && (
                      <Description className="mt-1 text-xs text-muted">
                        Kata sandi minimal 8 karakter
                      </Description>
                    )}
                    <FieldError />
                  </TextField>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  isPending={submitting}
                  isDisabled={submitting || oauthLoading}
                  className="w-full rounded-full bg-accent px-6 py-3 font-normal text-accent-foreground hover:bg-accent/90"
                >
                  {isSignUp ? "Daftar" : "Masuk"}
                </Button>

                <div className="flex w-full items-center gap-4 py-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted">atau</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <Button
                  fullWidth
                  variant="ghost"
                  onPress={handleGoogleSignIn}
                  isPending={oauthLoading}
                  isDisabled={submitting || oauthLoading}
                  className="w-full rounded-full bg-surface font-normal transition-all duration-300 hover:scale-102"
                >
                  <FcGoogle className="mr-2 text-xl" />
                  Lanjutkan dengan Google
                </Button>

                <p className="pt-2 text-center text-sm text-muted sm:pt-4 lg:text-left">
                  {isSignUp ? (
                    <>
                      Sudah punya akun?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(false);
                          setError(null);
                        }}
                        className="font-normal text-accent transition-colors hover:text-accent/80 hover:underline"
                      >
                        Masuk
                      </button>
                    </>
                  ) : (
                    <>
                      Belum punya akun?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(true);
                          setError(null);
                        }}
                        className="font-normal text-accent transition-colors hover:text-accent/80 hover:underline"
                      >
                        Daftar
                      </button>
                    </>
                  )}
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
