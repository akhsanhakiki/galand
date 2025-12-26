import React from "react";
import {
  FaCashRegister,
  FaMoneyBill,
  FaTags,
  FaWarehouse,
  FaChartLine,
  FaGear,
} from "react-icons/fa6";

const menuItems = [
  { title: "Ringkasan", icon: FaChartLine },
  { title: "Transaksi", icon: FaMoneyBill },
  { title: "Diskon", icon: FaTags },
  { title: "Gudang", icon: FaWarehouse },
  { title: "Kasir", icon: FaCashRegister },
  { title: "Pengaturan", icon: FaGear },
];

const MenuControl = () => {
  return (
    <>
      <div className="flex flex-col gap-4 md:gap-6 items-center justify-center p-4 md:p-8 max-w-7xl mx-auto md:hidden">
        <div className="flex flex-col items-center justify-center bg-sky-50/80 p-4 md:p-6 rounded-3xl shadow-accent-soft hover:shadow-lg transition-shadow cursor-pointer gap-2 md:gap-4 min-h-32 md:min-h-56 w-full">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
            Welcome to kadara
          </h1>
          <p className="text-sm md:text-base text-slate-900">
            kadara is a point of sale system that allows you to manage your
            sales and inventory.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full">
          {menuItems.map(({ title, icon: Icon }) => (
            <div
              key={title}
              className="flex flex-col p-4 md:p-6 rounded-3xl shadow-accent-soft hover:shadow-lg transition-shadow cursor-pointer gap-2 md:gap-4 min-h-32 md:min-h-56 bg-zinc-50 items-start justify-center"
            >
              <h2 className="text-base md:text-xl font-bold mb-2 text-slate-900">
                {title}
              </h2>
              <div className="flex items-end justify-end p-2 w-full h-full text-sky-400 rounded-2xl">
                <Icon className="w-8 h-8 md:w-20 md:h-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="md:flex hidden flex-col gap-4 md:gap-6 w-full">
        {menuItems.map(({ title, icon: Icon }) => (
          <div
            key={title}
            className="flex flex-row gap-2 justify-start items-center"
          >
            <Icon className="w-4 h-4" />
            <p>{title}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default MenuControl;
