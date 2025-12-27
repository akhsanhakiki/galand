import React, { useState, useEffect } from "react";
import {
  LuChartPie,
  LuBanknote,
  LuTag,
  LuStore,
  LuShoppingCart,
  LuSettings,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";
import { Card, Button, Surface } from "@heroui/react";
import Header from "./Header";

const menuItems = [
  { title: "Ringkasan", icon: LuChartPie, key: "ringkasan" },
  { title: "Kasir", icon: LuShoppingCart, key: "kasir" },
  { title: "Transaksi", icon: LuBanknote, key: "transaksi" },
  { title: "Diskon", icon: LuTag, key: "diskon" },
  { title: "Gudang", icon: LuStore, key: "gudang" },
  { title: "Pengaturan", icon: LuSettings, key: "pengaturan" },
];

interface MenuControlProps {
  onMenuClick?: (menuKey: string) => void;
  isMobile?: boolean;
  currentPage?: string;
}

// Helper function to get current page from URL
const getCurrentPageFromUrl = (): string => {
  if (typeof window === "undefined") return "";
  const path = window.location.pathname;
  const page = path.split("/").filter(Boolean)[0] || "";
  return page;
};

// Helper function to get collapsed state from localStorage
const getCollapsedStateFromStorage = (): boolean => {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem("navbar-collapsed");
  return stored === "true";
};

// Helper function to save collapsed state to localStorage
const saveCollapsedStateToStorage = (collapsed: boolean): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("navbar-collapsed", String(collapsed));
};

const MenuControl = ({
  onMenuClick,
  isMobile = false,
  currentPage: propCurrentPage,
}: MenuControlProps) => {
  const [isCollapsed, setIsCollapsed] = useState(getCollapsedStateFromStorage);
  const [currentPage, setCurrentPage] = useState<string>(
    propCurrentPage || getCurrentPageFromUrl()
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

  // Save collapsed state to localStorage whenever it changes
  useEffect(() => {
    saveCollapsedStateToStorage(isCollapsed);
  }, [isCollapsed]);

  const handleClick = (menuKey: string) => {
    // Use client-side navigation to avoid page reload
    const newPath = `/${menuKey}`;
    window.history.pushState({ page: menuKey }, "", newPath);

    // Dispatch popstate event to trigger route updates in DesktopView/MobileView
    window.dispatchEvent(
      new PopStateEvent("popstate", { state: { page: menuKey } })
    );

    // Update local state
    setCurrentPage(menuKey);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* ---------------------------- Mobile View ---------------------------- */}
      <div className="flex flex-col gap-4 md:gap-6 items-center justify-center p-4 md:hidden">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full">
          {menuItems.map(({ title, icon: Icon, key }) => (
            <div
              key={key}
              onClick={() => handleClick(key)}
              className="cursor-pointer"
            >
              <Card
                className="hover:shadow-lg transition-all min-h-32 md:min-h-56"
                variant="default"
              >
                <Card.Header>
                  <Card.Title className="text-base md:text-xl font-bold">
                    {title}
                  </Card.Title>
                </Card.Header>
                <Card.Content className="flex items-end justify-end p-2 w-full h-full">
                  <Icon className="w-8 h-8 md:w-20 md:h-20 text-accent" />
                </Card.Content>
              </Card>
            </div>
          ))}
        </div>
      </div>
      {/* ---------------------------- Desktop View ---------------------------- */}
      <div className="md:flex hidden flex-col gap-4">
        {/* Collapse/Expand Button Surface */}
        <Surface
          className={`flex flex-row items-center rounded-3xl transition-all duration-300 h-14 ${
            isCollapsed
              ? "w-[64px] min-w-[64px] p-2.5 justify-center"
              : "w-[240px] min-w-[240px] p-4 justify-between"
          }`}
          variant="default"
        >
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-primary pl-4">kadara</h1>
          )}
          <Button
            variant="ghost"
            isIconOnly
            size="sm"
            className="w-8 h-8  transition-all duration-200"
            onPress={toggleCollapse}
          >
            {isCollapsed ? (
              <LuChevronRight className="w-3.5 h-3.5" />
            ) : (
              <LuChevronLeft className="w-3.5 h-3.5" />
            )}
          </Button>
        </Surface>

        {/* Menu Items Surface */}
        <Surface
          className={`flex flex-col gap-1 rounded-3xl transition-all duration-300 h-[calc(6*2.5rem+5*0.25rem+2rem)] ${
            isCollapsed
              ? "w-[64px] min-w-[64px] p-2.5"
              : "w-[240px] min-w-[240px] p-4"
          }`}
          variant="default"
        >
          {menuItems.map(({ title, icon: Icon, key }) => (
            <Button
              key={key}
              variant="ghost"
              className={`w-full transition-all duration-200 rounded-2xl ${
                isCollapsed
                  ? "justify-center min-w-0 h-10"
                  : "justify-start h-10"
              } ${
                currentPage === key
                  ? "bg-primary-100 text-primary-700 font-medium"
                  : "hover:bg-primary-100 text-foreground"
              }`}
              onPress={() => handleClick(key)}
            >
              <Icon
                className={`shrink-0 ${
                  isCollapsed ? "w-4 h-4" : "w-4 h-4 mr-2"
                }`}
              />
              {!isCollapsed && (
                <span className="text-sm font-medium truncate">{title}</span>
              )}
            </Button>
          ))}
        </Surface>

        {/* Header Surface */}
        <Surface
          className={`rounded-3xl transition-all duration-300 h-28 ${
            isCollapsed
              ? "w-[64px] min-w-[64px] p-2"
              : "w-[240px] min-w-[240px] p-4"
          }`}
          variant="default"
        >
          <Header collapsed={isCollapsed} isMobile={false} />
        </Surface>
      </div>
    </>
  );
};

export default MenuControl;
