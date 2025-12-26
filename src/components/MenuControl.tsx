import React, { useState } from "react";
import {
  FaCashRegister,
  FaMoneyBill,
  FaTags,
  FaWarehouse,
  FaChartLine,
  FaGear,
} from "react-icons/fa6";
import { Card, Button, Surface } from "@heroui/react";

const menuItems = [
  { title: "Ringkasan", icon: FaChartLine, key: "ringkasan" },
  { title: "Transaksi", icon: FaMoneyBill, key: "transaksi" },
  { title: "Diskon", icon: FaTags, key: "diskon" },
  { title: "Gudang", icon: FaWarehouse, key: "gudang" },
  { title: "Kasir", icon: FaCashRegister, key: "kasir" },
  { title: "Pengaturan", icon: FaGear, key: "pengaturan" },
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
  const handleClick = (menuKey: string) => {
    if (onMenuClick) {
      onMenuClick(menuKey);
    }
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
        className="md:flex hidden flex-col gap-2 p-4 rounded-2xl min-w-[200px]"
        variant="default"
      >
        {menuItems.map(({ title, icon: Icon, key }) => (
          <Button
            key={key}
            variant={currentPage === key ? "primary" : "ghost"}
            className={`justify-start w-full ${
              currentPage === key ? "bg-accent text-accent-foreground" : ""
            }`}
            onPress={() => handleClick(key)}
          >
            <Icon className="w-4 h-4 mr-2" />
            {title}
          </Button>
        ))}
      </Surface>
    </>
  );
};

export default MenuControl;
