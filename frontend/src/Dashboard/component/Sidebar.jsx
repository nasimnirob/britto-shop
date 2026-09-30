import { BiQuestionMark } from "react-icons/bi";
import { MdCampaign, MdOutlineIncompleteCircle, MdOutlineSoupKitchen, MdPhotoSizeSelectLarge, MdProductionQuantityLimits } from "react-icons/md";
import { RiCoupon3Line, RiCustomSize } from "react-icons/ri";
import { IoColorPaletteOutline, IoSettingsOutline } from "react-icons/io5";
import { TbArrowsExchange, TbCategoryPlus, TbListDetails, TbPackages } from "react-icons/tb";
import { NavLink } from "react-router-dom";
import { DatabaseZap, IdCardLanyard, LayoutDashboard, TagIcon, Users, UserShield } from "lucide-react";
import { LuPackageCheck } from "react-icons/lu";
import { CiDiscount1 } from "react-icons/ci";
import useTheme from "../../Hooks/useTheme";
import { BiMoon, BiSun } from "react-icons/bi";
import { PiSubtractSquare } from "react-icons/pi";

// const navItems = [
//   { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
//   { to: "/admin/users", icon: Users, label: "Customers" },
//   { to: "/admin/users/employees", icon: IdCardLanyard, label: "Employees" },
//   { to: "/admin/users/admins", icon: UserShield, label: "Admins" },
//   { to: "/admin/products", icon: LuPackageCheck, label: "Products" },
//   { to: "/admin/bundle-products", icon: TbPackages, label: "Combo" },
//   { to: "/admin/tags", icon: TagIcon, label: "Tags" },
//   { to: "/admin/campaigns", icon: MdCampaign, label: "Campaign" },
//   { to: "/admin/orders", icon: DatabaseZap, label: "Orders" },
//   { to: "/admin/incomplete-orders", icon: MdOutlineIncompleteCircle, label: "Incomplete Orders" },
//   { to: "/admin/attributes/return-requests", icon: TbArrowsExchange, label: "Exchange & Return" },
//   { to: "/admin/attributes/product-faq", icon: BiQuestionMark, label: "Product FAQs" },
//   { to: "/admin/attributes/product-types", icon: TbListDetails, label: "Product Types" },
//   { to: "/admin/attributes/product-categories", icon: TbCategoryPlus, label: "Categories" },
//   { to: "/admin/attributes/sub-categories", icon: PiSubtractSquare, label: "Sub Categories" },
//   { to: "/admin/attributes/product-colors", icon: IoColorPaletteOutline, label: "Colors" },
//   { to: "/admin/attributes/sizes", icon: RiCustomSize, label: "Sizes" },
//   { to: "/admin/attributes/discount", icon: CiDiscount1, label: "Discount & Free Shipping" },
//   { to: "/admin/attributes/coupons", icon: RiCoupon3Line, label: "Coupons" },
//   { to: "/admin/settings", icon: IoSettingsOutline, label: "Site Settings" },
// ];

const navItems = [
  // Dashboard
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },

  // Users
  { to: "/admin/users/customers", icon: Users, label: "Customers" },
  { to: "/admin/users/employees", icon: IdCardLanyard, label: "Employees",
  },
  { to: "/admin/users/admins", icon: UserShield, label: "Admins",
  },

  // Products
  {
    to: "/admin/products",
    icon: LuPackageCheck,
    label: "Products",
  },
  {
    to: "/admin/bundle-products",
    icon: TbPackages,
    label: "Combo",
  },

  // Catalog
  {
    to: "/admin/catalog/tags",
    icon: TagIcon,
    label: "Tags",
  },
  {
    to: "/admin/catalog/product-faq",
    icon: BiQuestionMark,
    label: "Product FAQs",
  },
  {
    to: "/admin/catalog/product-types",
    icon: TbListDetails,
    label: "Product Types",
  },
  {
    to: "/admin/catalog/categories",
    icon: TbCategoryPlus,
    label: "Categories",
  },
  {
    to: "/admin/catalog/sub-categories",
    icon: PiSubtractSquare,
    label: "Sub Categories",
  },
  {
    to: "/admin/catalog/colors",
    icon: IoColorPaletteOutline,
    label: "Colors",
  },
  {
    to: "/admin/catalog/sizes",
    icon: RiCustomSize,
    label: "Sizes",
  },
  {
    to: "/admin/catalog/sizes-charts",
    icon: MdPhotoSizeSelectLarge,
    label: "Size Chart",
  },

  // Orders
  {
    to: "/admin/orders",
    icon: DatabaseZap,
    label: "Orders",
  },
  {
    to: "/admin/orders/incomplete",
    icon: MdOutlineIncompleteCircle,
    label: "Incomplete Orders",
  },
  {
    to: "/admin/orders/returns",
    icon: TbArrowsExchange,
    label: "Exchange & Return",
  },

  // Marketing
  {
    to: "/admin/marketing/campaigns",
    icon: MdCampaign,
    label: "Campaign",
  },
  {
    to: "/admin/marketing/discounts",
    icon: CiDiscount1,
    label: "Discount & Free Shipping",
  },
  {
    to: "/admin/marketing/coupons",
    icon: RiCoupon3Line,
    label: "Coupons",
  },

  // Settings
  {
    to: "/admin/settings",
    icon: IoSettingsOutline,
    label: "Site Settings",
  },
];

const Sidebar = ({ isSidebarOpen }) => {
  const [theme, toggleTheme] = useTheme();

  return (
    <div className="h-full pb-6 bg-[#F2F4F7] dark:bg-secondary-dark overflow-y-auto font-time scrollbar-hide">
      <div className="flex items-center justify-between">
        <NavLink
          to="/"
          className={`flex items-center py-5 ${isSidebarOpen ? "justify-start px-4" : "justify-center px-2"
            }`}
        >
          <h5
            className={`whitespace-nowrap overflow-hidden text-[19px] font-semibold bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent transition-all duration-500
                ${isSidebarOpen ? "w-32 opacity-100" : "w-0 opacity-0"}
              `}
          >
            Britto Shop
          </h5>
        </NavLink>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="mr-3 flex h-9 w-9 items-center justify-center rounded-md text-gray-600 transition-colors duration-200 hover:bg-gray-200 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-400"
        >
          {theme === "dark" ? (
            <BiSun className="text-xl" />
          ) : (
            <BiMoon className="text-xl" />
          )}
        </button>
      </div>

      <ul className="space-y-[0px] font-medium">
        {navItems.map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              end  
              className={({ isActive }) =>
                `flex items-center py-3 px-2 hover:text-blue-600 dark:hover:text-blue-500 rounded- transition-all duration-300 group
                  ${isActive
                  ? "bg-white dark:bg-primary-dark text-blue-500"
                  : "bg-[#F2F4F7] dark:bg-secondary-dark dark:text-white hover:bg-[#E6E8EA]"
                }
                  ${isSidebarOpen ? "justify-start" : "justify-center"}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 flex-shrink-0 ${isActive
                      ? "text-blue-600"
                      : "text-gray-600 dark:text-gray-300 group-hover:text-blue-600"
                      }`}
                  />

                  <span
                    className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isSidebarOpen
                      ? "w-48 opacity-100 ml-2"
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
      </ul>
    </div>
  );
};

export default Sidebar;
