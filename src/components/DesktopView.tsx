import React, { useState, useEffect } from "react";
import MenuControl from "./MenuControl";
import RingkasanPage from "../pages/ringkasan/RingkasanPage";
import TransaksiPage from "../pages/transaksi/TransaksiPage";
import DiskonPage from "../pages/diskon/DiskonPage";
import GudangPage from "../pages/gudang/GudangPage";
import KasirPage from "../pages/kasir/KasirPage";
import PengeluaranPage from "../pages/pengeluaran/PengeluaranPage";
import PengaturanPage from "../pages/pengaturan/PengaturanPage";
import { useAuth } from "../contexts/AuthContext";

const pageComponents: Record<string, React.ComponentType> = {
  ringkasan: RingkasanPage,
  transaksi: TransaksiPage,
  diskon: DiskonPage,
  gudang: GudangPage,
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
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>(
    getCurrentPageFromUrl(),
  );

  const role = user?.role || "user";
  const restrictedPages = role === "user" ? ["ringkasan", "transaksi"] : [];

  // Redirect if trying to access restricted page
  useEffect(() => {
    if (restrictedPages.includes(currentPage)) {
      window.history.pushState({ page: "kasir" }, "", "/kasir");
      setCurrentPage("kasir");
    }
  }, [currentPage, role]);

  // Redirect to /ringkasan on desktop when visiting root route
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkAndRedirect = () => {
      // Check if we're on desktop (md breakpoint is 768px in Tailwind)
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      const isRootPath = window.location.pathname === "/";

      if (isDesktop && isRootPath) {
        const defaultPage = role === "admin" ? "ringkasan" : "kasir";
        window.history.pushState({ page: defaultPage }, "", `/${defaultPage}`);
        setCurrentPage(defaultPage);
      }
    };

    checkAndRedirect();
  }, [role]);

  // Update current page when URL changes
  useEffect(() => {
    const updateCurrentPage = () => {
      setCurrentPage(getCurrentPageFromUrl());
    };
    window.addEventListener("popstate", updateCurrentPage);
    updateCurrentPage();
    return () => window.removeEventListener("popstate", updateCurrentPage);
  }, []);

  const CurrentPageComponent = pageComponents[currentPage];

  return (
    <div className="hidden md:flex flex-row gap-4 md:gap-4 p-4 md:p-4 h-full">
      <MenuControl isMobile={false} currentPage={currentPage} />
      <div className="flex-1 min-w-0">
        {CurrentPageComponent && <CurrentPageComponent key={currentPage} />}
      </div>
    </div>
  );
};

export default DesktopView;
