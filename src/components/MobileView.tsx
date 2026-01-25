import React, { useState, useEffect } from "react";
import RingkasanPage from "../pages/ringkasan/RingkasanPage";
import TransaksiPage from "../pages/transaksi/TransaksiPage";
import DiskonPage from "../pages/diskon/DiskonPage";
import ProdukPage from "../pages/produk/ProdukPage";
import KasirPage from "../pages/kasir/KasirPage";
import PengeluaranPage from "../pages/pengeluaran/PengeluaranPage";
import PengaturanPage from "../pages/pengaturan/PengaturanPage";
import Header from "./Header";
import MobileBottomNav from "./MobileBottomNav";
import { useAuth } from "../contexts/AuthContext";

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
const getCurrentPageFromUrl = (): string | null => {
  if (typeof window === "undefined") return null;
  const path = window.location.pathname;
  const page = path.split("/").filter(Boolean)[0];
  return page;
};

// Helper function to get default page based on user role
const getDefaultPage = (userRole?: string): string => {
  if (userRole === "admin") {
    return "ringkasan";
  }
  // For regular users, default to kasir
  return "kasir";
};

const MobileView = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<string | null>(() => {
    const pageFromUrl = getCurrentPageFromUrl();
    // If no page in URL, default based on user role
    return pageFromUrl || getDefaultPage(user?.role);
  });

  // Update current page when URL changes
  useEffect(() => {
    const updateCurrentPage = () => {
      const pageFromUrl = getCurrentPageFromUrl();
      if (pageFromUrl) {
        setCurrentPage(pageFromUrl);
      } else {
        // If no page in URL, default based on user role and update URL
        const defaultPage = getDefaultPage(user?.role);
        if (defaultPage) {
          window.history.replaceState(
            { page: defaultPage },
            "",
            `/${defaultPage}`,
          );
          setCurrentPage(defaultPage);
        }
      }
    };
    window.addEventListener("popstate", updateCurrentPage);
    updateCurrentPage();
    return () => window.removeEventListener("popstate", updateCurrentPage);
  }, [user?.role]);

  const handleNavigate = (menuKey: string) => {
    // Use client-side navigation to avoid page reload
    const newPath = `/${menuKey}`;
    window.history.pushState({ page: menuKey }, "", newPath);

    // Dispatch popstate event to trigger route updates
    window.dispatchEvent(
      new PopStateEvent("popstate", { state: { page: menuKey } }),
    );

    // Update local state
    setCurrentPage(menuKey);
  };

  const CurrentPageComponent = currentPage ? pageComponents[currentPage] : null;

  return (
    <div className="md:hidden flex flex-col h-full w-full">
      <Header isMobile={true} />
      <div className="flex flex-col w-full px-4 pb-20  overflow-y-auto">
        {CurrentPageComponent && <CurrentPageComponent key={currentPage} />}
      </div>
      <MobileBottomNav currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
};

export default MobileView;
