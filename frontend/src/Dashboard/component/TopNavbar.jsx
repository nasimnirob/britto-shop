import { BsPeopleFill, BsPersonFillAdd } from "react-icons/bs";
import { FaPersonBooth, FaShoppingCart } from "react-icons/fa";
import { IoCloseSharp, IoPersonCircleOutline } from "react-icons/io5";
import { MdOutlineSoupKitchen } from "react-icons/md";
import { RiFindReplaceLine, RiHome4Fill, RiMenu2Line, RiMoneyDollarBoxFill } from "react-icons/ri";
import { CiLogout } from "react-icons/ci";
import { NavLink } from "react-router-dom";
import { useState, useRef } from "react";
import logo from '../../../public/logo.png';

const TopNavbar = () => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    return (
        <nav className="rounded-lg bg-gray-50 border-gray-200">

            {/* Main Navbar Bar */}
            <div className="flex justify-between items-center w-full lg:px-6 md:px-6 px-4  py-3 shadow-sm">

                {/* Left: Hamburger + Search */}
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setOpen(!open)}
                        className="bg-gray-200 p-2 rounded-md text-blue-800 transition-all duration-500 lg:hidden md:hidden"
                    >
                        <RiMenu2Line className="text-xl" />
                    </button>

                    <div className="relative">
                        <input
                            className="lg:ml-7 md:ml-3 px-4 pr-9 py-[6px] lg:w-[320px] w-40 rounded-full border border-[#eaedf1] bg-[#f7f8f9]"
                            type="search"
                            placeholder="Search for results.."
                        />
                        <button className="absolute bottom-[9px] right-4 z-30 text-gray-500">
                            <RiFindReplaceLine />
                        </button>
                    </div>
                </div>

                {/* Right: User Info + Avatar */}
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-medium">User Name</h2>
                    <NavLink to="/profile" className="hover:text-black/80  btn-circle avatar">
                        <div className="w-10 rounded-full">
                            <IoPersonCircleOutline className="text-4xl w-[40px]" />
                        </div>
                    </NavLink>
                </div>
            </div>

            {/* Mobile Drawer Sidebar */}
            <div
                ref={menuRef}
                className={`lg:hidden md:hidden block fixed top-0 left-0 z-40 w-[250px] h-screen p-4 overflow-y-auto transition-transform bg-gray-100 dark:bg-gray-800
                    ${open ? "translate-x-0" : "-translate-x-80"}`}
            >
                {/* Drawer Header */}
                <div className="shadow-[rgba(0,0,15,0.5)_0px_2px_0px_0px] shadow-gray-200 bg-gray-100">
                    {/* <img className="w-12 ms-2" src={logo} alt="Logo" /> */}
                    <h5 className="text-xl text-transparent bg-gradient-to-r bg-clip-text from-fuchsia-500 to-cyan-500 font-semibold p-2">
                        Mess Management
                    </h5>
                </div>

                {/* Close Button */}
                <button
                    onClick={() => setOpen(false)}
                    className="bg-gray-200 p-2 rounded-md text-blue-800 transition-all duration-500 absolute top-4 end-2.5 "
                >
                    <IoCloseSharp className="text-xl" />
                </button>

                {/* Nav Links */}
                <div className="py-4 overflow-y-auto">
                    <ul className="space-y-2 font-medium">

                        <li>
                            <NavLink to="/admin/dashboard" onClick={() => setOpen(false)} className="flex p-2 items-center hover:bg-gray-100 w-full">
                                <RiHome4Fill className="text-lg text-gray-600" />
                                <span className="ms-3">Home</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/addMember" onClick={() => setOpen(false)} className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100">
                                <BsPersonFillAdd className="text-lg text-gray-600" />
                                <span className="ms-3 whitespace-nowrap">Add Mess Member</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/addDeposit" onClick={() => setOpen(false)} className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100">
                                <RiMoneyDollarBoxFill className="text-lg text-gray-600" />
                                <span className="ms-3 whitespace-nowrap">Add Money Deposit</span>
                            </NavLink>  
                        </li>
                        <li>
                            <NavLink to="/admin/mealRequest" onClick={() => setOpen(false)} className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100">
                                <MdOutlineSoupKitchen className="text-lg text-gray-700" />
                                <span className="ms-3 whitespace-nowrap">Meal Request</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/addMeal" onClick={() => setOpen(false)} className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100">
                                <MdOutlineSoupKitchen className="text-lg text-gray-700" />
                                <span className="ms-3 whitespace-nowrap">Add Meal</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/addCost" onClick={() => setOpen(false)} className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100">
                                <FaShoppingCart className="text-lg text-gray-600" />
                                <span className="ms-3 whitespace-nowrap">Add Cost</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/allMember" onClick={() => setOpen(false)} className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100">
                                <BsPeopleFill className="text-lg text-gray-600" />
                                <span className="ms-3 whitespace-nowrap">All Member</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/changeManager" onClick={() => setOpen(false)} className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100">
                                <FaPersonBooth className="text-lg text-gray-600" />
                                <span className="ms-3 whitespace-nowrap">Change Manager</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/login" onClick={() => setOpen(false)} className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100">
                                <CiLogout className="text-lg text-gray-950" />
                                <span className="ms-3 whitespace-nowrap">Log Out</span>
                            </NavLink>
                        </li>

                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default TopNavbar;