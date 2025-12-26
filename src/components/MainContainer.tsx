import React from "react";
import MobileView from "./MobileView";
import DesktopView from "./DesktopView";
import Header from "./Header";

const MainContainer = () => {
  return (
    <div className="flex flex-col">
      <Header />
      <>
        <MobileView />
        <DesktopView />
      </>
    </div>
  );
};

export default MainContainer;
