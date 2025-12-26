import React, { useState } from "react";
import {
  ChartBarIcon,
  BanknotesIcon,
  TagIcon,
  BuildingStorefrontIcon,
  ShoppingCartIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { Card, Button, Surface } from "@heroui/react";

const menuItems = [
  { title: "Ringkasan", icon: ChartBarIcon, key: "ringkasan" },
  { title: "Transaksi", icon: BanknotesIcon, key: "transaksi" },
  { title: "Diskon", icon: TagIcon, key: "diskon" },
  { title: "Gudang", icon: BuildingStorefrontIcon, key: "gudang" },
  { title: "Kasir", icon: ShoppingCartIcon, key: "kasir" },
  { title: "Pengaturan", icon: Cog6ToothIcon, key: "pengaturan" },
];

interface MenuControlProps {
  onMenuClick?: (menuKey: string) => void;
  isMobile?: boolean;
  currentPage?: string;
}

const MenuControl = ({
  onMenuClick,
  isMobile = false,
  currentPage,
}: MenuControlProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleClick = (menuKey: string) => {
    if (onMenuClick) {
      onMenuClick(menuKey);
    }
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
      <Surface
        className={`md:flex hidden flex-col gap-1 rounded-2xl transition-all duration-300 h-fit ${
          isCollapsed
            ? "w-[64px] min-w-[64px] p-2"
            : "w-[240px] min-w-[240px] p-2"
        }`}
        variant="default"
      >
        <div
          className={`flex flex-row gap-4 items-center justify-between mb-4 ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!isCollapsed && <p className="text-md font-bold">Menu</p>}
          {/* Toggle Button */}
          <Button
            variant="ghost"
            isIconOnly
            size="sm"
            className={`w-8 h-8 min-w-8 transition-all duration-200 ${
              isCollapsed ? "self-center mb-1" : "self-end mb-1"
            }`}
            onPress={toggleCollapse}
          >
            {isCollapsed ? (
              <FaChevronRight className="w-4 h-4" />
            ) : (
              <FaChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Menu Items */}
        {menuItems.map(({ title, icon: Icon, key }) => (
          <Button
            key={key}
            variant="ghost"
            className={`w-full transition-all duration-200 rounded-2xl ${
              isCollapsed ? "justify-center min-w-0 h-10" : "justify-start h-10"
            } ${
              currentPage === key
                ? "bg-primary text-primary-foreground font-medium"
                : "hover:bg-default-100 text-foreground"
            }`}
            onPress={() => handleClick(key)}
          >
            <Icon
              className={`shrink-0 ${isCollapsed ? "w-5 h-5" : "w-5 h-5 mr-3"}`}
            />
            {!isCollapsed && (
              <span className="text-sm font-medium truncate">{title}</span>
            )}
          </Button>
        ))}
      </Surface>
    </>
  );
};

export default MenuControl;
