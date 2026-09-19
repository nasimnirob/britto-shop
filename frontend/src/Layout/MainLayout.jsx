import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import Navbar from "../Component/Shared/Navbar";
import Footer from "../Component/Shared/Footer";
import { useEffect, useState } from "react";

import RouteLoader from "../Component/RouteLoader";
import ScrollManager from "../Component/ScrollManager/ScrollManager";


const MainLayout = () => {
  const [openCart, setOpenCart] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setShowLoader(true);
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => setShowLoader(false), 300);
    }, 400);

    return () => clearTimeout(timer);
  }, [location.pathname]);


  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-primary-dark">

      <ScrollManager />

      {/* Loader */}
      {showLoader && <RouteLoader loading={loading} />}

      {/* Navbar */}
      <div className="lg:mt-[105px] md:mt-[105px] mt-[66px]">
        <Navbar
          openCart={openCart}
          setOpenCart={setOpenCart}
          openProfile={openProfile}
          setOpenProfile={setOpenProfile}
          open={open}
          setOpen={setOpen}
        />
      </div>

      {/* Overlay */}
      {(openCart || openProfile || open) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[40]"></div>
      )}

      {/* Main Content */}
      <main className="flex-grow flex justify-center overflow-x-clip">
        <div className="w-full max-w-[1524px] mx-auto">
          <Outlet />
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
};

export default MainLayout;