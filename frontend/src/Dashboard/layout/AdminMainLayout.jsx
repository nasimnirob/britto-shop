// import { useState, useEffect } from "react";
// import Sidebar from "../component/Sidebar";
// import TopNavbar from "../component/TopNavbar";
// import { NavLink, Outlet } from "react-router-dom";
// import logo from '../../../public/logo.png'



// const AdminMainLayout = () => {
//     const [sidebarWidth, setSidebarWidth] = useState(260);
//     const [isResizing, setIsResizing] = useState(false);


//     const isSidebarOpen = sidebarWidth > 80;

//     useEffect(() => {
//         const handleMouseMove = (e) => {
//             if (!isResizing) return;

//             const newWidth = Math.min(Math.max(e.clientX, 60), 1020);
//             setSidebarWidth(newWidth);
//         };

//         const handleMouseUp = () => {
//             setIsResizing(false);
//         };

//         window.addEventListener("mousemove", handleMouseMove);
//         window.addEventListener("mouseup", handleMouseUp);

//         return () => {
//             window.removeEventListener("mousemove", handleMouseMove);
//             window.removeEventListener("mouseup", handleMouseUp);
//         };
//     }, [isResizing]);

//     const [isMobile, setIsMobile] = useState(false);

//     useEffect(() => {
//         const handleResize = () => {
//             setIsMobile(window.innerWidth < 768);
//         };

//         handleResize();
//         window.addEventListener("resize", handleResize);

//         return () => window.removeEventListener("resize", handleResize);
//     }, []);

//     return (
//         <div>

//             {/* Top Navbar */}
//             <div
//                 className="fixed top-0 z-40 bg-white shadow-sm lg:hidden md:hidden block text-black"
//                 style={{
//                     left: isMobile ? 0 : sidebarWidth,
//                     width: isMobile
//                         ? "100%"
//                         : `calc(100% - ${sidebarWidth}px)`,
//                 }}
//             >
//                 <TopNavbar />
//             </div>

//             {/* Sidebar */}
//             <div
//                 className="fixed left-0 top-0 h-screen bg-[#F2F4F7] dark:bg-primary-dark z-40 overflow-hidden lg:block md:block sm:hidden hidden text-black select-none"
//                 style={{
//                     width: isMobile ? 0 : sidebarWidth,
//                 }}
//             >

//                 <Sidebar isSidebarOpen={isSidebarOpen} />

//                 {/* Drag Handle */}
//                 <div
//                     onMouseDown={() => setIsResizing(true)}
//                     className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
//                 />
//             </div>

//             {/* Main Content */}
//             <div
//                 className="bg-white dark:bg-primary-dark lg:pt-0 md:pt-0 pt-[70px] text-[#080809] dark:text-[#E2E5E6] min-h-screen px-2"
//                 style={{
//                     marginLeft: isMobile ? 0 : sidebarWidth,
//                 }}
//             >
//                 <Outlet />
//             </div>

//         </div>
//     );
// };

// export default AdminMainLayout;


import { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import TopNavbar from "../component/TopNavbar";
import { Outlet } from "react-router-dom";

const AdminMainLayout = () => {
    const [sidebarWidth, setSidebarWidth] = useState(260);
    const [isResizing, setIsResizing] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false); // মোবাইল drawer

    const isSidebarOpen = sidebarWidth > 80;

    // Resize logic
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            const newWidth = Math.min(Math.max(e.clientX, 60), 1020);
            setSidebarWidth(newWidth);
        };

        const handleMouseUp = () => setIsResizing(false);

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing]);

    // Mobile detect
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setMobileOpen(false); // ডেস্কটপে গেলে drawer বন্ধ
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // মোবাইলে drawer খোলা থাকলে body scroll বন্ধ
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    return (
        <div>
            {/* Top Navbar */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm text-black">
                <TopNavbar
                    mobileOpen={mobileOpen}
                    setMobileOpen={setMobileOpen}
                    isMobile={isMobile}
                />
            </div>

            {/* Desktop Sidebar (lg ও md) */}
            {!isMobile && (
                <div
                    className="fixed left-0 top-0 h-screen bg-[#F2F4F7] dark:bg-primary-dark z-40 overflow-hidden text-black select-none"
                    style={{ width: sidebarWidth }}
                >
                    <Sidebar isSidebarOpen={isSidebarOpen} />

                    {/* Drag Handle */}
                    <div
                        onMouseDown={() => setIsResizing(true)}
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                    />
                </div>
            )}

            {/* Mobile Drawer Sidebar */}
            {isMobile && (
                <>
                    {/* Overlay */}
                    <div
                        onClick={() => setMobileOpen(false)}
                        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300
                            ${mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
                    />

                    {/* Drawer */}
                    <div
                        className={`fixed top-0 left-0 h-screen w-[260px] bg-[#F2F4F7] dark:bg-primary-dark z-50 overflow-y-auto transition-transform duration-300
                            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
                    >
                        <Sidebar isSidebarOpen={true} />
                    </div>
                </>
            )}

            {/* Main Content */}
            <div
                className="bg-white dark:bg-primary-dark md:pt-2 pt-[67px] text-[#080809] dark:text-[#E2E5E6] min-h-screen px-2"
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
