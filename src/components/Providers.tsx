"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { CartProvider } from "../contexts/CartContext";
import { AuthProvider } from "../contexts/AuthContext";
import { OrganizationProvider } from "../contexts/OrganizationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute={["class", "data-theme"]}
      defaultTheme="system"
      enableSystem
    >
      <AuthProvider>
        <OrganizationProvider>
        <CartProvider>{children}</CartProvider>
        </OrganizationProvider>
      </AuthProvider>
    </NextThemesProvider>
  );
}
