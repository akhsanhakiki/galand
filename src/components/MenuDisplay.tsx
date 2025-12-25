import React from "react";
import {
  FaCashRegister,
  FaChartLine,
  FaGear,
  FaMoneyBill,
  FaTags,
  FaWarehouse,
} from "react-icons/fa6";

const MenuDisplay = () => {
  const menuItems = [
    {
      id: 1,
      name: "Ringkasan",
      icon: <FaChartLine className="w-8 h-8 md:w-20 md:h-20" />,
    },
    {
      id: 2,
      name: "Transaksi",
      icon: <FaMoneyBill className="w-8 h-8 md:w-20 md:h-20" />,
    },
    {
      id: 3,
      name: "Diskon",
      icon: <FaTags className="w-8 h-8 md:w-20 md:h-20" />,
    },
    {
      id: 4,
      name: "Gudang",
      icon: <FaWarehouse className="w-8 h-8 md:w-20 md:h-20" />,
    },
    {
      id: 5,
      name: "Kasir",
      icon: <FaCashRegister className="w-8 h-8 md:w-20 md:h-20" />,
    },
    {
      id: 6,
      name: "Pengaturan",
      icon: <FaGear className="w-8 h-8 md:w-20 md:h-20" />,
    },
  ];

  return (
    <div className="flex flex-col gap-4 md:gap-6 items-center justify-center p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col items-center justify-center bg-sky-50/80 p-4 md:p-6 rounded-3xl shadow-accent-soft hover:shadow-lg transition-shadow cursor-pointer gap-2 md:gap-4 min-h-32 md:min-h-56 w-full">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
          Welcome to kadara
        </h1>
        <p className="text-sm md:text-base text-slate-900">
          kadara is a point of sale system that allows you to manage your sales
          and inventory.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-col p-4 md:p-6 rounded-3xl shadow-accent-soft hover:shadow-lg transition-shadow cursor-pointer gap-2 md:gap-4 min-h-32 md:min-h-56 bg-zinc-50 items-start justify-center"
          >
            <h2 className="text-base md:text-xl font-bold mb-2 text-slate-900">
              {item.name}
            </h2>
            <div className="flex items-end justify-end p-2 w-full h-full text-sky-400 rounded-2xl">
              {item.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuDisplay;
