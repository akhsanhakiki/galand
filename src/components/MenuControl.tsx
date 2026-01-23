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
  LuReceipt,
  LuChevronDown,
  LuPackage,
} from "react-icons/lu";
import { Card, Button, Surface, Disclosure } from "@heroui/react";
import Header from "./Header";
import { useOrganization } from "../contexts/OrganizationContext";
import { useAuth } from "../contexts/AuthContext";

const menuItems = [
  { title: "Ringkasan", icon: LuChartPie, key: "ringkasan" },
  { title: "Kasir", icon: LuShoppingCart, key: "kasir" },
  { title: "Transaksi", icon: LuBanknote, key: "transaksi" },
  { title: "Diskon", icon: LuTag, key: "diskon" },
  { title: "Produk", icon: LuPackage, key: "gudang" },
  { title: "Pengeluaran", icon: LuReceipt, key: "pengeluaran" },
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

const MenuControl = ({
  onMenuClick,
  isMobile = false,
  currentPage: propCurrentPage,
}: MenuControlProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState<string>(
    propCurrentPage || getCurrentPageFromUrl(),
  );
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const { user } = useAuth();
  const {
    currentOrganization,
    organizations,
    loading: orgLoading,
    setCurrentOrganization,
  } = useOrganization();

  // Filter menu items based on user role
  const getFilteredMenuItems = () => {
    const userRole = user?.role;
    
    // Admin can access all
    if (userRole === "admin") {
      return menuItems;
    }
    
    // User can only access: kasir, diskon, gudang, pengeluaran, pengaturan
    const allowedKeys = ["kasir", "diskon", "gudang", "pengeluaran", "pengaturan"];
    return menuItems.filter((item) => allowedKeys.includes(item.key));
  };

  const filteredMenuItems = getFilteredMenuItems();

  // Calculate dynamic height based on number of menu items
  // Formula: (items * 2.5rem) + ((items - 1) * 0.25rem) + 2rem (padding)
  const menuItemsCount = filteredMenuItems.length;
  const menuSurfaceHeight = `calc(${menuItemsCount} * 2.5rem + ${menuItemsCount > 0 ? (menuItemsCount - 1) * 0.25 : 0}rem + 2rem)`;

  const handleOrganizationSelect = async (
    org: NonNullable<typeof currentOrganization>,
  ) => {
    try {
      await setCurrentOrganization(org);
      setIsOrgDropdownOpen(false);
    } catch (error) {
      // Handle error silently or show a toast notification
    }
  };

  // Update current page when URL changes
  useEffect(() => {
    const updateCurrentPage = () => {
      setCurrentPage(getCurrentPageFromUrl());
    };
    window.addEventListener("popstate", updateCurrentPage);
    updateCurrentPage();
    return () => window.removeEventListener("popstate", updateCurrentPage);
  }, []);

  const handleClick = (menuKey: string) => {
    // Use client-side navigation to avoid page reload
    const newPath = `/${menuKey}`;
    window.history.pushState({ page: menuKey }, "", newPath);

    // Dispatch popstate event to trigger route updates in DesktopView/MobileView
    window.dispatchEvent(
      new PopStateEvent("popstate", { state: { page: menuKey } }),
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
          {filteredMenuItems.map(({ title, icon: Icon, key }) => (
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
          className={`flex flex-col gap-1 rounded-3xl transition-all duration-300 ${
            isCollapsed
              ? "w-[64px] min-w-[64px] p-2.5"
              : "w-[240px] min-w-[240px] p-4"
          }`}
          style={{
            height: menuSurfaceHeight,
          }}
          variant="default"
        >
          {filteredMenuItems.map(({ title, icon: Icon, key }) => (
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
          className={`rounded-3xl transition-all duration-300 ${
            isCollapsed
              ? "w-[64px] min-w-[64px] p-2"
              : "w-[240px] min-w-[240px] p-3"
          }`}
          variant="default"
        >
          <Header collapsed={isCollapsed} isMobile={false} />
        </Surface>

        {/* Active Toko Surface */}
        <Surface
          className={`rounded-3xl transition-all duration-300 ${
            isCollapsed
              ? "w-[64px] min-w-[64px] p-2"
              : "w-[240px] min-w-[240px] p-3"
          }`}
          variant="default"
        >
          {isCollapsed ? (
            <div className="flex flex-col items-center justify-center">
              <LuStore className="w-5 h-5 text-primary" />
            </div>
          ) : (
            <Disclosure
              isExpanded={isOrgDropdownOpen}
              onExpandedChange={setIsOrgDropdownOpen}
              className="w-full"
            >
              <Disclosure.Heading>
                <Button
                  slot="trigger"
                  className="w-full transition-all duration-200 rounded-2xl justify-between h-auto p-2 hover:bg-default-100 text-foreground"
                  variant="ghost"
                >
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    {orgLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-default-200 animate-pulse" />
                        <div className="flex-1">
                          <div className="h-3 w-24 bg-default-200 rounded animate-pulse mb-1" />
                          <div className="h-2 w-16 bg-default-200 rounded animate-pulse" />
                        </div>
                      </div>
                    ) : currentOrganization ? (
                      <div className="flex items-center gap-2">
                        {currentOrganization.logo ? (
                          <img
                            src={currentOrganization.logo}
                            alt={currentOrganization.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                            <LuStore className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate text-left">
                            {currentOrganization.name}
                          </p>
                          <p className="text-[10px] text-muted truncate text-start">
                            {currentOrganization.slug}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-default-200 flex items-center justify-center">
                          <LuStore className="w-4 h-4 text-default-400" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <p className="text-sm font-medium text-muted truncate">
                            Tidak ada toko
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <Disclosure.Indicator>
                    <LuChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${isOrgDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </Disclosure.Indicator>
                </Button>
              </Disclosure.Heading>
              <Disclosure.Content>
                <Disclosure.Body className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                  {organizations.map((org) => (
                    <Button
                      key={org.id}
                      className={`w-full transition-all duration-200 rounded-2xl justify-start h-auto p-2 text-foreground ${
                        currentOrganization?.id === org.id
                          ? "bg-primary-100 text-primary-700 font-medium"
                          : "hover:bg-default-100"
                      }`}
                      variant="ghost"
                      onPress={() => handleOrganizationSelect(org)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {org.logo ? (
                          <img
                            src={org.logo}
                            alt={org.name}
                            className="w-6 h-6 rounded shrink-0 object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center shrink-0">
                            <LuStore className="w-3 h-3 text-primary" />
                          </div>
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground truncate text-left">
                            {org.name}
                          </p>
                          <p className="text-[10px] text-muted truncate text-start">
                            {org.slug}
                          </p>
                        </div>
                      </div>
                    </Button>
                  ))}
                </Disclosure.Body>
              </Disclosure.Content>
            </Disclosure>
          )}
        </Surface>
      </div>
    </>
  );
};

export default MenuControl;
