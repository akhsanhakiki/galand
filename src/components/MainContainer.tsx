import { Providers } from "./Providers";
import Header from "./Header";
import MobileView from "./MobileView";
import DesktopView from "./DesktopView";

const MainContainer = () => {
  return (
    <Providers>
      <div className="flex flex-col">
        <>
          <MobileView />
          <DesktopView />
        </>
      </div>
    </Providers>
  );
};

export default MainContainer;
