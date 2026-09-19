

import { BsFillQuestionSquareFill } from "react-icons/bs";
import { MdOutlineManageAccounts } from "react-icons/md";
import { RiDashboardHorizontalFill, RiHome4Fill, RiWallet3Fill } from "react-icons/ri";

import { NavLink } from "react-router-dom";


const Navbar = () => {
    return (


        <div className="visible lg:hidden md:hidden fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bg-white shadow-stone-200 shadow-lg border border-gray-200 rounded-none bottom-0 left-1/2 dark:bg-gray-700 dark:border-gray-600">
            <div className="grid grid-cols-5 h-full max-w-lg  mx-auto">
                <NavLink
                    to="/dashboard"
                    data-tooltip-target="tooltip-home"
                    type="button"
                    className={({ isActive }) =>
                        `border-none rounded-none btn btn-lg inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group hover:text-blue-600 ${isActive ? "text-blue-600" : "text-gray-900 "
                        }`
                    }
                >
                    <RiDashboardHorizontalFill className=" text-2xl" />
                    <span className="sr-only">Dashboard</span>
                </NavLink>
                <div id="tooltip-home" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                    Dashboard
                    <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
                <NavLink
                    to='/home'
                    data-tooltip-target="tooltip-wallet"
                    type="button"
                    className={({ isActive }) =>
                        `border-none rounded-none btn btn-lg inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group ${isActive ? "text-blue-600" : "text-gray-900"
                        }`
                    }>
                    <RiHome4Fill className="text-2xl " />
                    <span className="sr-only">Home</span>
                </NavLink>
                <div id="tooltip-wallet" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                    Home
                    <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
                <div className="flex bg-gray-100 items-center justify-center">
                    <NavLink to='/question' data-tooltip-target="tooltip-new" type="button" className={({ isActive }) => ` border-none   w-12 h-12 inline-flex items-center justify-center font-medium    focus:ring-0 ${isActive ? 'focus:text-blue-600 text-blue-600 dark:focus:ring-blue-800' : ' '} focus:outline-none `}>
                        <BsFillQuestionSquareFill className="text-2xl w-full hover:text-3xl " />
                        <span className="sr-only">New Question</span>
                    </NavLink>
                </div>
                <div id="tooltip-new" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300  rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                    Create new item
                    <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
                <NavLink to='/wallet' data-tooltip-target="tooltip-settings" type="button" className={({ isActive }) =>
                    `border-none rounded-none btn btn-lg inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group ${isActive ? "text-blue-600" : "text-gray-900"
                    }`
                }>
                    <RiWallet3Fill className="text-2xl " />
                    <span className="sr-only">Wallet</span>
                </NavLink>
                <div id="tooltip-settings" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                    Wallet
                    <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
                <NavLink to='profile' data-tooltip-target="tooltip-profile" type="button" className={({ isActive }) =>
                    `border-none rounded-none btn btn-lg inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group ${isActive ? "text-blue-600" : "text-gray-900"
                    }`
                }>
                    <MdOutlineManageAccounts className="text-3xl  " />
                    <span className="sr-only">Profile</span>
                </NavLink>
                <div id="tooltip-profile" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700 ">
                    Profile
                    <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
            </div>
        </div >




    );
};

export default Navbar;