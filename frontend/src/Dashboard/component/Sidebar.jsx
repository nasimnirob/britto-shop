import { BsPeopleFill, BsPersonFillAdd } from "react-icons/bs";
import { BiLogOut } from "react-icons/bi";
import { FaShoppingCart } from "react-icons/fa";
import { MdOutlineSoupKitchen } from "react-icons/md";
import {
  RiDashboardHorizontalFill,
  RiHome4Fill,
  RiMoneyDollarBoxFill,
} from "react-icons/ri";
import { IoSettingsOutline } from "react-icons/io5";
import { TbListDetails } from "react-icons/tb";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/admin/dashboard", icon: RiDashboardHorizontalFill, label: "Dashboard" },
  { to: "/admin/user", icon: RiHome4Fill, label: "Home" },
  { to: "/admin/addDeposit", icon: RiMoneyDollarBoxFill, label: "Add Money" },
  { to: "/admin/addCost", icon: FaShoppingCart, label: "Add Cost" },
  { to: "/admin/addMeal", icon: MdOutlineSoupKitchen, label: "Add Meal" },
  { to: "/admin/addMember", icon: BsPersonFillAdd, label: "Add Member" },
  { to: "/admin/allMember", icon: BsPeopleFill, label: "All Member" },
  { to: "/admin/AllMealsDetails", icon: TbListDetails, label: "All Meals Details" },
  { to: "/admin/sitesettings", icon: IoSettingsOutline, label: "Site Settings" },
];

const Sidebar = ({ isSidebarOpen }) => {
  return (
    <div className="mt-[2px] h-screen bg-[#F2F4F7] overflow-y-auto">
      <ul className="space-y-[0px] font-medium">
        {navItems.map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center py-3 px-2 hover:text-blue-600 rounded- transition-all duration-300 group
                ${
                  isActive
                    ? "bg-white text-blue-600"
                    : "bg-[#F2F4F7] hover:bg-[#E6E8EA]"
                }
                ${isSidebarOpen ? "justify-start" : "justify-center"}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`text-xl flex-shrink-0 ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-600 group-hover:text-blue-600"
                    }`}
                  />

                  <span
                    className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                      isSidebarOpen
                        ? "w-40 opacity-100 ml-3"
                        : "w-0 opacity-0 ml-0"
                    }`}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}

        {/* Logout */}
        {/* <li>
          <NavLink
            to="/login"
            className={`flex items-center p-2 rounded-md bg-[#F2F4F7] hover:bg-[#E6E8EA] transition-all duration-300 group ${
              isSidebarOpen ? "justify-start" : "justify-center"
            }`}
          >
            <BiLogOut className="text-xl text-gray-600 group-hover:text-blue-600 flex-shrink-0" />

            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                isSidebarOpen
                  ? "w-32 opacity-100 ml-3"
                  : "w-0 opacity-0 ml-0"
              }`}
            >
              Log Out
            </span>
          </NavLink>
        </li> */}
      </ul>
    </div>
  );
};

export default Sidebar;