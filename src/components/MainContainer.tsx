import { Providers } from "./Providers";
import { ProtectedRoute } from "./ProtectedRoute";
import Header from "./Header";
import MobileView from "./MobileView";
import DesktopView from "./DesktopView";

const MainContainer = () => {
  return (
    <Providers>
      <ProtectedRoute>
        <div className="flex flex-col h-full">
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
