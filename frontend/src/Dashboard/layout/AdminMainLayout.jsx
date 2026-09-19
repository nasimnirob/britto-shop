import { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import TopNavbar from "../component/TopNavbar";
import { NavLink, Outlet } from "react-router-dom";
import logo from '../../../public/logo.png'

const AdminMainLayout = () => {
    const [sidebarWidth, setSidebarWidth] = useState(224);
    const [isResizing, setIsResizing] = useState(false);

    const isSidebarOpen = sidebarWidth > 80;

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;

            const newWidth = Math.min(Math.max(e.clientX, 60), 1020);
            setSidebarWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing]);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div>

            {/* Top Navbar */}
            <div
                className="fixed top-0 z-40 bg-white shadow-md lg:hidden md:hidden block text-black"
                style={{
                    left: isMobile ? 0 : sidebarWidth,
                    width: isMobile
                        ? "100%"
                        : `calc(100% - ${sidebarWidth}px)`,
                }}
            >
                <TopNavbar />
            </div>

            {/* Sidebar */}
            <div
                className="fixed left-0 top-0 h-screen bg-[#F2F4F7] dark:bg-primary-dark z-40 overflow-hidden lg:block md:block sm:hidden hidden text-black select-none"
                style={{
                    width: isMobile ? 0 : sidebarWidth,
                }}
            >
                <NavLink to='/'
                    className={`bg-gray-100 mt-3 flex items-center ${isSidebarOpen
                        ? "shadow-gray-100 shadow-[rgba(0,0,15,0.5)_0px_2px_0px_0px] pb-3"
                        : "pb-3 justify-center"
                        }`}
                >
                    {/* <img
                        className="w-10 h-10 object-contain flex-shrink-0 px-1"
                        src={logo}
                        alt="Logo"
                    /> */}

                    <h5
                        className={`text-center whitespace-nowrap overflow-hidden text-[19px] bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent font-semibold transition-all duration-500 ${isSidebarOpen
                            ? "ml-2 w-32 opacity-100"
                            : "w-0 ml-0 opacity-0"
                            }`}
                    >
                        Britto Shop

                    </h5>
                </NavLink>
                <Sidebar isSidebarOpen={isSidebarOpen} />

                {/* Drag Handle */}
                <div
                    onMouseDown={() => setIsResizing(true)}
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                />
            </div>

            {/* Main Content */}
            <div
                className="bg-white dark:bg-primary-dark lg:pt-0 md:pt-0 pt-[70px] text-black min-h-screen px-2"
                style={{
                    marginLeft: isMobile ? 0 : sidebarWidth,
                }}
            >
                <Outlet />
            </div>

        </div>
    );
};

export default AdminMainLayout;

// import { RiMenu2Line } from "react-icons/ri";
// import Sidebar from "../component/Sidebar";
// import TopNavbar from "../component/TopNavbar";
// import { NavLink, Outlet } from "react-router-dom";
// import { useState } from "react";
// import logo from '../../../public/logo.png'

// const AdminMainLayout = () => {
//     const [isSidebarOpen, setIsSidebarOpen] = useState(true);

//     return (
//         <div className="mx-auto text-black ">

//             {/* Top Navbar */}
//             <div className={`fixed top-0 z-40 w-full bg-white shadow-md transition-all duration-300 ml-0
//                 ${isSidebarOpen
//                     ? "lg:w-[calc(100%-230px)] md:w-[calc(100%-230px)] lg:left-[224px] md:left-[224px]"
//                     : "lg:w-[calc(100%-72px)] md:w-[calc(100%-72px)] lg:left-[72px] md:left-[64px]"
//                 }`}>
//                 <TopNavbar />
//             </div>

//             <div className="lg:flex">

//                 {/* Sidebar */}
//                 <NavLink to='/' className={`lg:fixed md:fixed hidden lg:block md:block left-0 top-0 h-screen px-1 z-40 bg-gray-100 dark:bg-black
//                     ${isSidebarOpen
//                         ? "w-52 transition-all duration-500 overflow-hidden"
//                         : "w-[57px] transition-all duration-500 overflow-hidden"
//                     }`}>

//                     <div
//                         className={`bg-gray-100 mt-3 flex items-center ${isSidebarOpen
//                                 ? "shadow-gray-100 shadow-[rgba(0,0,15,0.5)_0px_2px_0px_0px] pb-3"
//                                 : "pb-3 justify-center"
//                             }`}
//                     >
//                         <img
//                             className="w-10 h-10 object-contain flex-shrink-0 px-1"
//                             src={logo}
//                             alt="Logo"
//                         />

//                         <h5
//                             className={`whitespace-nowrap overflow-hidden text-[19px] bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent font-semibold transition-all duration-500 ${isSidebarOpen
//                                     ? "ml-2 w-32 opacity-100"
//                                     : "w-0 ml-0 opacity-0"
//                                 }`}
//                         >
//                             Britto Shop
//                         </h5>
//                     </div>

//                     <Sidebar isSidebarOpen={isSidebarOpen} />
//                 </NavLink>

//                 {/* Main Content */}
//                 <div className={`pt-[70px] min-h-screen w-full transition-all duration-500
//                     ${isSidebarOpen
//                         ? "lg:w-[calc(100%-230px)] md:w-[calc(100%-230px)] lg:ml-56 md:ml-56"
//                         : "lg:w-[calc(100%-72px)] md:w-[calc(100%-72px)] lg:ml-16 md:ml-16 lg:pl-2"
//                     }`}>

//                     {/* Sidebar Toggle Button */}
//                     <button
//                         onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//                         className={`lg:fixed md:fixed hidden lg:block md:block z-40 top-4 bg-gray-200 p-2 rounded-md text-blue-800 transition-all duration-500
//                             ${isSidebarOpen
//                                 ? "lg:left-[235px] md:left-[230px]"
//                                 : "lg:left-[83px] md:left-[70px]"
//                             }`}>
//                         <RiMenu2Line className="text-xl" />
//                     </button>

//                     <div className="  bg-gray-100 p-4">
//                         <Outlet />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AdminMainLayout;