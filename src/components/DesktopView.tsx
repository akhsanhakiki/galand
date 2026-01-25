import React, { useState, useEffect } from "react";
import MenuControl from "./MenuControl";
import RingkasanPage from "../pages/ringkasan/RingkasanPage";
import TransaksiPage from "../pages/transaksi/TransaksiPage";
import DiskonPage from "../pages/diskon/DiskonPage";
import ProdukPage from "../pages/produk/ProdukPage";
import KasirPage from "../pages/kasir/KasirPage";
import PengeluaranPage from "../pages/pengeluaran/PengeluaranPage";
import PengaturanPage from "../pages/pengaturan/PengaturanPage";
import OnboardingPage from "../pages/onboarding/OnboardingPage";
import { useOnboarding } from "../hooks/useOnboarding";

const pageComponents: Record<string, React.ComponentType> = {
  ringkasan: RingkasanPage,
  transaksi: TransaksiPage,
  diskon: DiskonPage,
  produk: ProdukPage,
  kasir: KasirPage,
  pengeluaran: PengeluaranPage,
  pengaturan: PengaturanPage,
};

// Helper function to get current page from URL
const getCurrentPageFromUrl = (): string => {
  if (typeof window === "undefined") return "";
  const path = window.location.pathname;
  const page = path.split("/").filter(Boolean)[0] || "";

  // Validate that the page exists in pageComponents
  if (page && page in pageComponents) {
    return page;
  }

  // Return empty string for invalid or root paths
  return "";
};

const DesktopView = () => {
  const [currentPage, setCurrentPage] = useState<string>(
    getCurrentPageFromUrl(),
  );
  const { shouldShowOnboarding, isChecking } = useOnboarding();

  // Redirect to /ringkasan on desktop when visiting root route
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkAndRedirect = () => {
      // Check if we're on desktop (md breakpoint is 768px in Tailwind)
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      const isRootPath = window.location.pathname === "/";

      if (isDesktop && isRootPath) {
        window.history.pushState({ page: "ringkasan" }, "", "/ringkasan");
        setCurrentPage("ringkasan");
      }
    };

    checkAndRedirect();
  }, []);

  // Update current page when URL changes
  useEffect(() => {
    const updateCurrentPage = () => {
      setCurrentPage(getCurrentPageFromUrl());
    };
    window.addEventListener("popstate", updateCurrentPage);
    updateCurrentPage();
    return () => window.removeEventListener("popstate", updateCurrentPage);
  }, []);

  // Don't render anything while checking onboarding status
  if (isChecking) {
    return (
      <div className="hidden md:flex flex-row gap-4 md:gap-4 p-4 md:p-4 h-full">
        <MenuControl isMobile={false} currentPage={currentPage} />
        <div className="flex-1 min-w-0" />
      </div>
    );
  }

  // Show onboarding page if needed (overrides current page)
  const CurrentPageComponent = shouldShowOnboarding 
    ? OnboardingPage 
    : pageComponents[currentPage];

  return (
    <div className="hidden md:flex flex-row gap-4 md:gap-4 p-4 md:p-4 h-full">
      <MenuControl isMobile={false} currentPage={currentPage} />
      <div className="flex-1 min-w-0">
        {CurrentPageComponent && <CurrentPageComponent key={shouldShowOnboarding ? "onboarding" : currentPage} />}
      </div>
    </div>
  );
};

export default DesktopView;
