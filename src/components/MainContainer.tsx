import React from "react";
import {
  FaCashRegister,
  FaChartLine,
  FaGear,
  FaMoneyBill,
  FaTags,
  FaWarehouse,
} from "react-icons/fa6";
import MobileView from "./MobileView";
import DesktopView from "./DesktopView";

const MainContainer = () => {
  return (
    <>
      <MobileView />
      <DesktopView />
    </>
  );
};

export default MainContainer;
