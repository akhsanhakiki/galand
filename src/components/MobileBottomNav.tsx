import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
import { Button, Surface } from "@heroui/react";
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

const NAVBAR_HEIGHT = "5rem";

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPage,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const navEl = (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-surface z-100 shrink-0 border-t border-separator"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center justify-around px-1 py-2 overflow-x-auto">
        {bottomNavItems.map(({ title, icon: Icon, key }) => {
          const isActive = currentPage === key;
          return (
            <Button
              key={key}
              variant="ghost"
              className={`flex flex-col items-center justify-center gap-1 h-auto py-2 px-2 min-w-[60px] shrink-0 data-[hovered=true]:bg-foreground/6 ${
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
            className="flex flex-col items-center justify-center gap-1 h-auto py-2 px-2 min-w-[60px] shrink-0 text-default-500 data-[hovered=true]:bg-foreground/6"
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
  );

  return (
    <>
      {mounted && typeof document !== "undefined"
        ? createPortal(navEl, document.body)
        : null}
      {/* Spacer so content padding is reserved before nav is portaled */}
      {mounted ? null : (
        <div
          className="md:hidden shrink-0"
          style={{ height: NAVBAR_HEIGHT }}
          aria-hidden
        />
      )}

      {isMoreMenuOpen &&
        mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="md:hidden fixed inset-0 z-[110] bg-background flex flex-col h-full">
            <Header isMobile={true} />
            <div className="flex flex-col gap-4 md:gap-6 items-center justify-start p-4 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full">
                {moreMenuItems.map(({ title, icon: Icon, key }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleMoreMenuClick(key)}
                    className="cursor-pointer bg-surface transition-all min-h-24 md:min-h-28 border-0 rounded-2xl md:rounded-3xl p-3 md:p-4 flex flex-col items-start gap-2 w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Surface className="w-fit p-2 rounded-lg bg-accent/10 shrink-0 pointer-events-none">
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                    </Surface>
                    <span className="text-sm md:text-base font-bold text-foreground">
                      {title}
                    </span>
                  </button>
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
                      className={`flex flex-col items-center justify-center gap-1 h-auto py-2 px-2 min-w-[60px] shrink-0 data-[hovered=true]:bg-foreground/6 ${
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
                    className="flex flex-col items-center justify-center gap-1 h-auto py-2 px-2 min-w-[60px] shrink-0 text-primary data-[hovered=true]:bg-foreground/6"
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
          </div>,
          document.body
        )}
    </>
  );
};

export default MobileBottomNav;
