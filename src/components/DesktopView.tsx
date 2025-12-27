import React, { useState, useEffect } from "react";
import MenuControl from "./MenuControl";
import RingkasanPage from "../pages/ringkasan/RingkasanPage";
import TransaksiPage from "../pages/transaksi/TransaksiPage";
import DiskonPage from "../pages/diskon/DiskonPage";
import GudangPage from "../pages/gudang/GudangPage";
import KasirPage from "../pages/kasir/KasirPage";
import PengaturanPage from "../pages/pengaturan/PengaturanPage";

const pageComponents: Record<string, React.ComponentType> = {
  ringkasan: RingkasanPage,
  transaksi: TransaksiPage,
  diskon: DiskonPage,
  gudang: GudangPage,
  kasir: KasirPage,
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
    getCurrentPageFromUrl()
  );

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
    <div className="hidden md:flex flex-row gap-4 md:gap-6 p-4 md:p-4 h-full">
      <MenuControl isMobile={false} currentPage={currentPage} />
      <div className="flex-1 min-w-0">
        {CurrentPageComponent && <CurrentPageComponent key={currentPage} />}
      </div>
    </div>
  );
};

export default DesktopView;
