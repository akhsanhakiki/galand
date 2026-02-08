import React, { useState } from "react";
import {
  LuChartPie,
  LuBanknote,
  LuTag,
  LuShoppingCart,
  LuSettings,
  LuReceipt,
  LuPackage,
  LuEllipsis,
} from "react-icons/lu";
import { Button } from "@heroui/react";
import { useAuth } from "../contexts/AuthContext";
import Header from "./Header";

const menuItems = [
  { title: "Ringkasan", icon: LuChartPie, key: "ringkasan" },
  { title: "Kasir", icon: LuShoppingCart, key: "kasir" },
  { title: "Transaksi", icon: LuBanknote, key: "transaksi" },
  { title: "Diskon", icon: LuTag, key: "diskon" },
  { title: "Produk", icon: LuPackage, key: "produk" },
  { title: "Pengeluaran", icon: LuReceipt, key: "pengeluaran" },
  { title: "Pengaturan", icon: LuSettings, key: "pengaturan" },
];

interface MobileBottomNavProps {
  currentPage: string | null;
  onNavigate: (menuKey: string) => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPage,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Filter menu items based on user role
  const getFilteredMenuItems = () => {
    const userRole = user?.role;

    // Admin can access all
    if (userRole === "admin") {
      return menuItems;
    }

    // User can only access: kasir, diskon, produk, pengeluaran, pengaturan
    const allowedKeys = [
      "kasir",
      "diskon",
      "produk",
      "pengeluaran",
      "pengaturan",
    ];
    return menuItems.filter((item) => allowedKeys.includes(item.key));
  };

  const filteredMenuItems = getFilteredMenuItems();

  // Show only first 4 items in bottom nav, rest in "Lainnya" modal
  const bottomNavItems = filteredMenuItems.slice(0, 4);
  const moreMenuItems = filteredMenuItems.slice(4);

  const handleMoreMenuClick = (menuKey: string) => {
    onNavigate(menuKey);
    setIsMoreMenuOpen(false);
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface z-10 shrink-0 safe-area-inset-bottom border-t border-separator">
        <div className="flex items-center justify-around px-1 py-2 overflow-x-auto">
          {bottomNavItems.map(({ title, icon: Icon, key }) => {
            const isActive = currentPage === key;
            return (
              <Button
                key={key}
                variant="ghost"
                className={`flex flex-col items-center justify-center gap-1 h-auto py-2 px-2 min-w-[60px] shrink-0 ${
                  isActive ? "text-primary" : "text-default-500"
                }`}
                onPress={() => onNavigate(key)}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-medium leading-tight text-center">
                  {title}
                </span>
              </Button>
            );
          })}
          {moreMenuItems.length > 0 && (
            <Button
              variant="ghost"
              className="flex flex-col items-center justify-center gap-1 h-auto py-2 px-2 min-w-[60px] shrink-0 text-default-500"
              onPress={() => setIsMoreMenuOpen(true)}
            >
              <LuEllipsis className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium leading-tight text-center">
                Lainnya
              </span>
            </Button>
          )}
        </div>
      </nav>

      {isMoreMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background flex flex-col h-full">
          <Header isMobile={true} />
          <div className="flex flex-col gap-4 md:gap-6 items-center justify-start p-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full">
              {moreMenuItems.map(({ title, icon: Icon, key }) => (
                <div
                  key={key}
                  onClick={() => handleMoreMenuClick(key)}
                  className="cursor-pointer bg-surface hover:shadow-lg transition-all min-h-32 md:min-h-56 border-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-1px_rgba(0,0,0,0.06)] rounded-lg flex flex-col p-4"
                >
                  <div className="mb-2">
                    <h3 className="text-base md:text-xl font-bold text-foreground">
                      {title}
                    </h3>
                  </div>
                  <div className="flex items-end justify-end flex-1 w-full">
                    <Icon className="w-8 h-8 md:w-20 md:h-20 text-accent" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <nav className="bg-surface safe-area-inset-bottom">
            <div className="flex items-center justify-around px-1 py-2 overflow-x-auto">
              {bottomNavItems.map(({ title, icon: Icon, key }) => {
                const isActive = currentPage === key;
                return (
                  <Button
                    key={key}
                    variant="ghost"
                    className={`flex flex-col items-center justify-center gap-1 h-auto py-2 px-2 min-w-[60px] shrink-0 ${
                      isActive ? "text-primary" : "text-default-500"
                    }`}
                    onPress={() => {
                      onNavigate(key);
                      setIsMoreMenuOpen(false);
                    }}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-[10px] font-medium leading-tight text-center">
                      {title}
                    </span>
                  </Button>
                );
              })}
              {moreMenuItems.length > 0 && (
                <Button
                  variant="ghost"
                  className="flex flex-col items-center justify-center gap-1 h-auto py-2 px-2 min-w-[60px] shrink-0 text-primary"
                  onPress={() => setIsMoreMenuOpen(false)}
                >
                  <LuEllipsis className="w-5 h-5 shrink-0" />
                  <span className="text-[10px] font-medium leading-tight text-center">
                    Lainnya
                  </span>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default MobileBottomNav;
