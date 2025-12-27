import React, { useState, useEffect } from "react";
import MenuControl from "./MenuControl";
import RingkasanPage from "../pages/ringkasan/RingkasanPage";
import TransaksiPage from "../pages/transaksi/TransaksiPage";
import DiskonPage from "../pages/diskon/DiskonPage";
import GudangPage from "../pages/gudang/GudangPage";
import KasirPage from "../pages/kasir/KasirPage";
import PengaturanPage from "../pages/pengaturan/PengaturanPage";
import Header from "./Header";
import { FaArrowLeft } from "react-icons/fa6";
import { Button } from "@heroui/react";

const pageComponents: Record<string, React.ComponentType> = {
  ringkasan: RingkasanPage,
  transaksi: TransaksiPage,
  diskon: DiskonPage,
  gudang: GudangPage,
  kasir: KasirPage,
  pengaturan: PengaturanPage,
};

// Helper function to get current page from URL
const getCurrentPageFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;
  const page = path.split('/').filter(Boolean)[0];
  // If on root, redirect to ringkasan
  if (!page || page === '') {
    window.location.href = '/ringkasan';
    return 'ringkasan';
  }
  return page;
};

const MobileView = () => {
  const [currentPage, setCurrentPage] = useState<string | null>(getCurrentPageFromUrl());

  // Update current page when URL changes
  useEffect(() => {
    const updateCurrentPage = () => {
      setCurrentPage(getCurrentPageFromUrl());
    };
    window.addEventListener('popstate', updateCurrentPage);
    updateCurrentPage();
    return () => window.removeEventListener('popstate', updateCurrentPage);
  }, []);

  const handleBack = () => {
    window.location.href = '/';
  };

  const CurrentPageComponent = currentPage ? pageComponents[currentPage] : null;

  return (
    <div className="md:hidden flex flex-col gap-4 md:gap-6">
      <Header isMobile={true} />
      {currentPage ? (
        <div className="flex flex-col w-full px-4">
          <Button
            variant="ghost"
            onPress={handleBack}
            className="justify-start w-fit"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          {CurrentPageComponent && <CurrentPageComponent />}
        </div>
      ) : (
        <MenuControl
          isMobile={true}
          currentPage={currentPage || undefined}
        />
      )}
    </div>
  );
};

export default MobileView;
