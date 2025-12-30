"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { CartProvider } from "../contexts/CartContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute={["class", "data-theme"]}
      defaultTheme="system"
      enableSystem
    >
      <CartProvider>{children}</CartProvider>
    </NextThemesProvider>
  );
}
