"use client";

import { Providers } from "./Providers";
import { ProtectedRoute } from "./ProtectedRoute";
import Header from "./Header";
import MobileView from "./MobileView";
import DesktopView from "./DesktopView";

const MainContainer = () => {
  return (
    <Providers>
      <ProtectedRoute>
        <div className="flex flex-col min-h-dvh h-full w-full min-w-0">
          <>
            <MobileView />
            <DesktopView />
          </>
        </div>
      </ProtectedRoute>
    </Providers>
  );
};

export default MainContainer;
