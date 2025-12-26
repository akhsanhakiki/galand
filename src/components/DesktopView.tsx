import React, { useState } from "react";
import MenuControl from "./MenuControl";
import RingkasanPage from "./ringkasan/RingkasanPage";
import TransaksiPage from "./transaksi/TransaksiPage";
import DiskonPage from "./diskon/DiskonPage";
import GudangPage from "./gudang/GudangPage";
import KasirPage from "./kasir/KasirPage";
import PengaturanPage from "./pengaturan/PengaturanPage";

const pageComponents: Record<string, React.ComponentType> = {
  ringkasan: RingkasanPage,
  transaksi: TransaksiPage,
  diskon: DiskonPage,
  gudang: GudangPage,
  kasir: KasirPage,
  pengaturan: PengaturanPage,
};

const DesktopView = () => {
  const [currentPage, setCurrentPage] = useState<string>("ringkasan");

  const handleMenuClick = (menuKey: string) => {
    setCurrentPage(menuKey);
  };

  const CurrentPageComponent = pageComponents[currentPage];

  return (
    <div className="hidden md:flex flex-row gap-4 md:gap-6 p-4 md:p-4">
      <MenuControl
        onMenuClick={handleMenuClick}
        isMobile={false}
        currentPage={currentPage}
      />
      <div className="flex-1">
        {CurrentPageComponent && <CurrentPageComponent />}
      </div>
    </div>
  );
};

export default DesktopView;
