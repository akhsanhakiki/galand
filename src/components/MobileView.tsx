import React, { useState } from "react";
import MenuControl from "./MenuControl";
import RingkasanPage from "./ringkasan/RingkasanPage";
import TransaksiPage from "./transaksi/TransaksiPage";
import DiskonPage from "./diskon/DiskonPage";
import GudangPage from "./gudang/GudangPage";
import KasirPage from "./kasir/KasirPage";
import PengaturanPage from "./pengaturan/PengaturanPage";
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

const MobileView = () => {
  const [currentPage, setCurrentPage] = useState<string | null>(null);

  const handleMenuClick = (menuKey: string) => {
    setCurrentPage(menuKey);
  };

  const handleBack = () => {
    setCurrentPage(null);
  };

  const CurrentPageComponent = currentPage ? pageComponents[currentPage] : null;

  return (
    <div className="md:hidden flex flex-col gap-4 md:gap-6">
      {currentPage ? (
        <div className="flex flex-col w-full">
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
          onMenuClick={handleMenuClick}
          isMobile={true}
          currentPage={currentPage || undefined}
        />
      )}
    </div>
  );
};

export default MobileView;
