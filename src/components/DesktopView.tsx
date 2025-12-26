import React from "react";
import MenuControl from "./MenuControl";

const DesktopView = () => {
  return (
    <div className="hidden md:flex flex-col gap-4 md:gap-6 items-center justify-center p-4 md:p-8 max-w-7xl mx-auto">
      <MenuControl />
      Desktop View
    </div>
  );
};

export default DesktopView;
