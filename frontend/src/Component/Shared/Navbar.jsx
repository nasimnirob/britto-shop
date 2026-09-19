import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProviders";
import { AiOutlineClose } from "react-icons/ai";

import { TiArrowLeft } from "react-icons/ti";
import { PiBagLight } from "react-icons/pi";
import { BsDashLg } from "react-icons/bs";
import { BiMoon, BiSun } from "react-icons/bi";
import useCategories from "../../Hooks/useCategories";
import useTheme from "../../Hooks/useTheme";

import { useTranslation } from "react-i18next";
import LanguageSelector from "../Language/LanguageSelector";
import { RxPerson } from "react-icons/rx";
import { CiSearch } from "react-icons/ci";
import { Handbag, Minus, Plus, Trash2 } from 'lucide-react';
import Logo from "../Logo/Logo";
import { useCart } from "../../Context/CartContext";

const Navbar = ({ openCart, setOpenCart, openProfile, setOpenProfile, open, setOpen }) => {
  const { user, logOut, loading } = useContext(AuthContext);
  const menuRef = useRef(null);
  const profileRef = useRef(null);
  const cartRef = useRef(null);
  const cartButtonRef = useRef(null);

  const [dropdown, setDropdown] = useState(false);
  const [theme, toggleTheme] = useTheme();
  const [isSticky, setIsSticky] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [search, setSearch] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const inputRef = useRef(null);
  const boxRef = useRef(null);

  const { t } = useTranslation();

  const { categories } = useCategories();
  // const categorie =categories?.productTypes;
  // console.log(categories.productTypes)

  const { cartItems, totalItems, totalPrice, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };
  const handleProfileToggle = () => {
    setOpenProfile((prev) => !prev);
  };
  const handleCartToggle = () => {

    setOpenCart((prev) => !prev);

  };


  const handleLogout = () => {
    logOut()
      .then(() => {
        alert("Logged Out");
        console.log("Logged out");
      })
      .catch((err) => console.error(err));
  };


  const handleSearchOpen = () => {
    setOpenSearch(true);
  };

  const handleTransitionEnd = () => {
    if (openSearch && inputRef.current) {
      inputRef.current.focus();
    }
  };


  useEffect(() => {
    const handleClickOutside = (event) => {

      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenProfile(false);
      }

      if (cartRef.current && !cartRef.current.contains(event.target) && cartButtonRef.current && !cartButtonRef.current.contains(event.target)) {
        setOpenCart(false);
      }

    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // isSticky And hide/show direction
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Sticky background
      setIsSticky(currentScrollY > 30);

      // Top show
      if (currentScrollY < 50) {
        setShowNavbar(true);
      }
      // down scroll hide
      else if (currentScrollY > lastScrollY) {
        setShowNavbar(false);
      }
      // up scroll show
      else {
        setShowNavbar(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sidebar position + height automatically adjust
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-top",
      showNavbar ? "105px" : "40px"
    );

    document.documentElement.style.setProperty(
      "--sidebar-height",
      showNavbar
        ? "calc(100vh - 170px)"
        : "calc(100vh - 60px)"
    );
  }, [showNavbar]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [openCart, openProfile, open, search]);


  const navLink = (
    <>
      <li>
        <NavLink
          to="/"
          onClick={() => {
            setOpen(false);
          }}
          className={({ isActive }) =>
            isActive
              ? "text-orange-400 text-base lg:px- lg:py-1.5 md:py-1.5 py-1 xl:px-5"
              : "text-inherit hover:text-orange-400 text-base lg:px- lg:py-1.5 md:py-1.5 py-1 xl:px-5"
          }
        >
          <h2 className="flex justify-between text-base lg:text-lg items-center gap-3 pl-2 lg:pl-0 lg:bg-transparent  md:bg-transparent bg-black bg-opacity-40 shadow-md lg:shadow-none lg:py-0 md:py-0 py-1 italic">
            <span>{t("Home")}</span>
            {/* <span> <IoIosArrowDown /></span> */}
          </h2>
        </NavLink>
      </li>
      <li className="lg:my-0  md:my-0 my-1">
        <NavLink
          to="/shop"
          onClick={() => {
            setOpen(false);
          }}
          className={({ isActive }) =>
            isActive
              ? "text-orange-400 text-base lg:px- lg:py-1.5 md:py-1.5 py-1 xl:px-5"
              : "text-inherit hover:text-orange-400 text-base lg:px- lg:py-1.5 md:py-1.5 py-1 xl:px-5"
          }
        >
          <h2 className="flex justify-between text-base lg:text-lg items-center gap-3 pl-2 lg:pl-0 lg:bg-transparent  md:bg-transparent bg-black bg-opacity-40 shadow-md lg:shadow-none lg:py-0 py-1   md:py-0 italic">
            <span>{t("Shop")} </span>
            {/* <span> <IoIosArrowDown /></span> */}
          </h2>
        </NavLink>
      </li>

      <ul className="flex md:flex-row flex-col md:gap-6 gap-1">
        {categories[0]?.productTypes?.map((productType) => (
          <li key={productType.slug} className="relative group">

            <NavLink
              to={`/category/${productType.slug}`}
              className="text-base hover:text-orange-400 italic"
            >
              <h2 className="flex justify-between text-base lg:text-lg items-center gap-3 pl-2 lg:pl-0 lg:bg-transparent  md:bg-transparent bg-black bg-opacity-40 shadow-md lg:shadow-none lg:py-0 py-1   md:py-0">

                {productType.type}
              </h2>
            </NavLink>

            <div className="absolute left-0 top-full hidden group-hover:block bg-white shadow-lg z-50 min-w-[600px] p-6">

              <div className="grid grid-cols-3 gap-6">
                {productType.categories?.map((category) => (
                  <div key={category.slug}>

                    {/* Category */}
                    <h3 className="font-semibold text-gray-800 mb-3">
                      {category.category}
                    </h3>

                    <ul className="space-y-2">
                      {category.subCategories?.map((subCategory) => (
                        <li key={subCategory}>
                          <NavLink
                            to={`/category/${productType.slug}/${category.slug}/${subCategory
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                            className="text-sm text-gray-600 hover:text-orange-400"
                          >
                            {subCategory}
                          </NavLink>
                        </li>
                      ))}
                    </ul>

                  </div>
                ))}
              </div>

            </div>
          </li>
        ))}
      </ul>

      {user ? (
        <>
          <li
            className="bottom-20 right-0 w-full lg:w-auto text-center pr-2 bg-black bg-opacity-40 shadow-md
                                    fixed lg:my-0 my-1 lg:bg-transparent lg:shadow-none md:hidden lg:hidden"
          >
            <button
              onClick={handleLogout}
              className="text-white hover:text-orange-400  text-base lg:px- lg:py-1.5 py-1 xl:px-5 w-full"
            >
              <h2 className="flex justify-center text-lg lg:text-lg items-center gap-3 pl-2 lg:pl-0 lg:bg-transparent bg-opacity-40 shadow-md lg:shadow-none lg:py-0 py-1 w-full">
                <span>{t("Logout")}</span>
              </h2>
            </button>
          </li>
        </>
      ) : (
        <>
          <li className="lg:my-0 md:my-0 my-1 lg:hidden md:hidden block">
            <NavLink
              to="/login"
              onClick={() => {
                setOpen(false);
              }}
              className={({ isActive }) =>
                isActive
                  ? "text-orange-400 text-base lg:px- lg:py-1.5 md:py-1.5 py-1 xl:px-5"
                  : "text-inherit hover:text-orange-400 text-base lg:px- lg:py-1.5 md:py-1.5 py-1 xl:px-5"
              }
            >
              <h2 className="flex justify-between text-lg lg:text-lg items-center gap-3 pl-2 lg:pl-0 lg:bg-transparent md:bg-transparent bg-black bg-opacity-40 lg:shadow-none md:shadow-none shadow-md lg:py-0 md:py-0 py-1 ">
                <span>{t("Login")} </span>
                <RxPerson />
              </h2>
            </NavLink>
          </li>
          <li className="lg:my-0 my-1 lg:hidden md:hidden ">
            <NavLink
              to="/register"
              onClick={() => {
                setOpen(false);
              }}
              className={({ isActive }) =>
                isActive
                  ? "text-orange-400 text-base lg:px- lg:py-1.5 py-1 xl:px-5"
                  : "text-inherit hover:text-orange-400 text-base lg:px- lg:py-1.5 py-1 xl:px-5"
              }
            >
              <h2 className="flex justify-between text-lg lg:text-lg items-center gap-3 pl-2 lg:pl-0 lg:bg-transparent md:bg-transparent bg-black bg-opacity-40 lg:shadow-none shadow-md lg:py-0 py-1 ">
                <span>{t("Register")} </span>
                {/* <span> <IoIosArrowDown /></span> */}
              </h2>
            </NavLink>
          </li>
        </>
      )}
    </>
  );
  return (
    <div className=" relative">
      <div
        className="fixed top-0 left-0 w-full z-50"
      >
        <div
          className={`navbar mx-auto flex items-center justify-between  w-full fixed top-0 left-0 z-50 py-0 px-0
            transition-all duration-300 ease-in-out 
            ${showNavbar || openSearch || openCart || search ? "translate-y-0 " : "-translate-y-full "}
            ${isSticky
              ? "bg-black/40 backdrop-blur-xl  shadow-md text-white"
              : "bg-white dark:bg-[#252728] text-black dark:text-white"
            }
            `}
        >
          <div className="relative flex mx-auto justify-between items-center navbar max-w-[1524px]">
            <div className="navbar-start">
              {/* mobile menu */}
              <div className="dropdown ">
                <div
                  onClick={handleToggle}
                  role="button"
                  className="w-10 h-10 hover:bg-black/10 rounded-full lg:hidden md:hidden select-none"
                >
                  {open ? (
                    <AiOutlineClose className="h-10 w-10 p-2" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 p-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h8m-8 6h16"
                      />
                    </svg>
                  )}
                </div>


              </div>

              <div className="flex flex-row ml-5  items-center lg:gap-3 md:gap-  w-full sm:px-5 md:px-2  lg:w-2/4 md:w-4/4">
                <NavLink to="/" className="px- ">
                  {/* <div className="flex flex-col items-center w-fit text-center">
                    <span className="text-[13.5px] sm:text-base lg:text-xl hover:text-orange-400 uppercase ">
                      Britto Shop
                    </span>
                    <span className="font-normal text-[8.5px] sm:text-[10px] lg:text-[12.3px] text-inherit hover:text-orange-400 uppercase tracking-widest">
                      E C O M M E R C E
                    </span>
                  </div> */}
                  <Logo />
                </NavLink>
              </div>

            </div>

            <div onClick={()=>{setSearch(true)}} className="navbar-center hidden lg:flex md:block  items-center justify-center px-0.5">
              <div className=" lg:w-full  ">
                <div className="flex items-center lg:w-96 w- rounded-[5px] overflow-hidden border-[0.00000000000001px] border-dashed border-[#fb923c] text-center justify-center">
                  <input
                    className={`font-extralight font-poppins w-full px-3 py-2 bg-black/5 placeholder:text-sm ${isSticky ? 'placeholder:text-gray-100 dark:placeholder:text-gray-300' : 'placeholder:text-gray-600 dark:placeholder:text-gray-200'} text-base outline-none ring-0 focus:outline-none rounded-l-[5px]`}
                    type="search"
                    placeholder="Search product name..."
                  />
                  <div className="border-dashed border-l border-[#fb923c]">
                    <button className="h-10 w-[36px] flex items-center justify-center bg-[#fb923c] hover:bg-yellow-500 transition text-black border-[#fb923c] border-l border-dashed">
                      <CiSearch className="absolute" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="navbar-end flex justify-end items-center lg:gap-3 md:gap-2 gap-2">
              <div className="relative z-50 lg:hidden md:hidden">
                {/* Search Button */}
                <button
                  onClick={handleSearchOpen}
                  className="relative z-0 w-10 h-10 rounded-full p-0.5"
                >
                  <CiSearch
                    className={`w-10 h-10 p-1 rounded-full transition-all duration-300
                    ${openSearch
                        ? " dark:text-white text-black"
                        : "hover:bg-black/5 dark:hover:bg-[#2a2a2a]"
                      }`}
                  />
                </button>

                {/* Search Box */}
                <div
                  ref={boxRef}
                  onTransitionEnd={handleTransitionEnd}
                  className={`
                    absolute -right-1 top-1/2 -translate-y-1/2
                    origin-right
                    flex items-center
                    overflow-hidden
                    rounded-full
                    bg-[#F0F2F5] dark:bg-[#2a2a2a]
                    shadow-xl
                    transition-all duration-300 ease-out
                    ${openSearch
                      ? "w-[calc(100vw-8rem)] max-w-[750px] opacity-100 scale-100"
                      : "w-10 opacity-0 scale-75 pointer-events-none"
                    }
                  `}
                >
                  <button onClick={() => setOpenSearch(false)} className="px-3">
                    <TiArrowLeft className="text-2xl text-black dark:text-white" />
                  </button>

                  <input
                    ref={inputRef}
                    type="search"
                    placeholder="Search"
                    className="w-full bg-transparent py-2 pr-4 outline-none text-black dark:text-white placeholder:text-black/60 dark:placeholder:text-gray-400 placeholder:font-poppins placeholder:clear font-poppins"
                  />
                </div>
              </div>


              <div
                ref={profileRef}
                className={`z-50 relative ml-1 flex items-center justify-center rounded-full h-10
                        ${openProfile && user ? " bg-black/15 dark:bg-black/10 w-10 h-10 " : " h-10 w-10 "}
                        `}
                onMouseEnter={() => window.innerWidth >= 768 && setOpenProfile(true)}
                onMouseLeave={() => window.innerWidth >= 768 && setOpenProfile(false)}
              >

                {
                  user ? <>
                    <div className="">
                      <button className="lg:block md:block hidden lg:h-16 md:h-16 h-10 -mt-4 -mb-4">
                        {loading ? (
                          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                        ) : user?.photoURL ? (
                          <img
                            className="rounded-full p-1 w-10 h-10  hover:bg-black/10 dark:hover:bg-black/15"
                            src={user?.photoURL}
                            alt="Profile"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <RxPerson className="text-4xl rounded-full border-yellow-700 p-1 mt-1.5 hover:bg-black/10 dark:hover:bg-black/15" />
                        )}
                      </button>
                    </div>
                  </>
                    :
                    <>
                      <NavLink
                        to="/login"
                        onClick={() => {
                          setOpen(false);
                        }}
                        className={({ isActive }) =>
                          isActive
                            ? "hover:text-orange-400 text-base lg:block md:block hidden mr-3"
                            : "text-inherit hover:text-orange-400 text-base lg:block md:block hidden mr-3"
                        }
                      >
                        <h2 className="flex flex-row justify-center items-center gap-2 lg:h-16 md:h-16 h-10 -mt-4 -mb-4">
                          <span>{t("Login")} </span>
                          <span><RxPerson /></span>
                        </h2>
                      </NavLink>
                    </>
                }

                {/* Profile Button */}
                <NavLink to='/profile' className=" h-16 px-0 -mb-4 -mt-4 lg:hidden md:hidden block py-2.5 hover:text-orange-400 "
                  onClick={handleProfileToggle}
                >
                  <button className="">
                    {loading ? (
                      <div className=" w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    ) : user?.photoURL ? (
                      <img
                        className=" rounded-full p-1 w-10 h-10  hover:bg-black/5 dark:hover:bg-black/15"
                        src={user?.photoURL}
                        alt="Profile"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <>
                        <RxPerson className={`${openProfile
                          ? "text-4xl hover:text-[36px] rounded-full border-yellow-700 p-1 mt-1 bg-black/10 dark:bg-black/15 hover:bg-black/10 dark:hover:bg-black/15"
                          : "text-4xl hover:text-[36px] rounded-full border-yellow-700 p-1 mt-1 hover:bg-black/10 dark:hover:bg-black/15"}`} />
                      </>
                    )}
                  </button>
                </NavLink>


                {/* Dropdown Panel — SHOW ON HOVER */}
                <div
                  className={`absolute -right-14 top-[50px] w-64 
                bg-white dark:bg-primary-dark dark:text-white text-white 
                  rounded-md shadow-lg dark:border-gray-600 z-50
                  ${openProfile ? "block" : "hidden"}`}
                >

                  <div className="flex items-center justify-center">
                    <LanguageSelector />
                    <button
                      onClick={toggleTheme}
                      className="px-1 py-[3.5px] -mt-2 hover:bg-gray-200 dark:hover:bg-gray-700
                 text-lg flex justify-center items-center text-black
                 hover:text-orange-400 border dark:border-gray-600 rounded-r"
                    >
                      {theme === "dark" ? (
                        <span className="flex items-center justify-between gap-2 dark:text-white">
                          <p>Light</p> <BiSun />
                        </span>
                      ) : (
                        <span className="flex items-center justify-between gap-2 dark:text-white">
                          <p>Dark</p> <BiMoon />
                        </span>
                      )}
                    </button>
                  </div>

                  <div className=" flex flex-col items-center p-4 text-black dark:text-white">
                    {user ? (
                      <img
                        className="w-20 h-20 rounded-full border border-gray-100 dark:border-gray-600"
                        src={user?.photoURL}
                        alt="Profile"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <RxPerson className=" w-16 h-16 p-1" />
                    )}

                    <h3 className="mt-3 font-semibold">
                      {user?.displayName || t("Guest User")}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 ">
                      {user?.email || "guest@example.com"}
                    </p>
                  </div>

                  <div className="border-t">
                    {user ? (
                      <button
                        onClick={handleLogout}
                        className="w-full text-center text-red-600 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {t("Logout")}
                      </button>
                    ) : (
                      <div className="flex flex-col">
                        <NavLink
                          to="/login"
                          onClick={() => {
                            setOpenProfile(false);
                          }}
                          className={({ isActive }) =>
                            `py-2 px-4 text-center text-black dark:text-white ${isActive ? "text-orange-400" : ""
                            } hover:bg-gray-100 dark:hover:bg-gray-700`
                          }
                        >
                          {t("Login")}
                        </NavLink>

                        <NavLink
                          to="/register"
                          onClick={() => {
                            setOpenProfile(false);
                          }}
                          className={({ isActive }) =>
                            `py-2 px-4 text-center text-black dark:text-white border-t ${isActive ? "text-orange-400" : ""
                            } hover:bg-gray-100 dark:hover:bg-gray-700`
                          }
                        >
                          {t("Register")}
                        </NavLink>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              <div ref={cartButtonRef} className={`z-50 relative ml-1 flex items-center justify-center rounded-full
                      ${openCart ? " dark:bg-black/10 w-10 h-10 bg-black/10" : " w-10 h-10 hover:bg-black/10 dark:hover:bg-black/15"}
                      `}
              >
                <div onClick={handleCartToggle} className=" cursor-pointer flex items-center justify-center h-16 -mb-4 -mt-4 py-2.5 hover:text-orange-400 border border-none">
                  <p className="hover:text-orange-400 text-base lg:px- lg:py-1 md:py- md:px- py-1 xl:px- w-full h-12 -mb- ">
                    <PiBagLight className="rounded-full p-1 mt-[1px] w-10 h-10  dark:hover:bg-black/15" />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-0 bg-red-600 text-white dark:bg-white dark:text-black text-[14px] w-5 h-5 rounded-full flex items-center justify-center selection:bg-none selection:text-[#12131A] font-poppins">
                        {totalItems > 99
                          ? "99+"
                          : totalItems}
                      </span>
                    )}
                  </p>
                </div>
              </div>


            </div>


            {/* Blur Overlay */}
            <div
              onClick={() => setOpenSearch(false)}
              className={`
                lg:hidden md:hidden
                absolute inset-0 z-40
                backdrop-blur-md
                transition-opacity duration-300
                ${openSearch ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
              `}
            />
          </div>
        </div>


        {/*cart show */}
        <div
          ref={cartRef}
          className={`fixed right-0 top-[52px]
        bg-black/20 backdrop-blur-xl
        overflow-hidden

        ${openCart
              ? `
                    mt-3
                    lg:w-[450px]
                    md:w-[400px]
                    sm:w-[400px]
                    w-[300px]
                    p-2
                    z-40
                    dark:border-gray-600
                    border-gray-600
                    border
                    rounded-md
                    shadow-sm
                    text-white
                    translate-x-0
                `
              : `
                    mt-3
                    p-2
                    lg:w-[450px]
                    md:w-[400px]
                    sm:w-[400px]
                    w-[300px]
                    z-40
                    translate-x-full
                `
            }

        transition-transform
        duration-500
        ease-out
    `}
        >
          <div className="flex flex-col h-[calc(100vh-70px)] font-mono">

            {/* ================= HEADER ================= */}

            <div className="shrink-0 border-b border-gray-400 border-dashed">

              <div className="flex justify-between items-center px-3 py-2">

                <span className="flex items-center gap-2">
                  <Handbag size={20} />

                  <span>
                    {totalItems}{" "}
                    {totalItems === 1
                      ? "Item"
                      : "Items"}
                  </span>
                </span>

                <span className="font-semibold">
                  TK {totalPrice.toLocaleString()}
                </span>

              </div>

            </div>


            {/* ================= CART CONTENT ================= */}

            <div className="flex-1 overflow-y-auto py-3">

              {/* ================= EMPTY CART ================= */}

              {cartItems.length === 0 ? (

                <div className="min-h-full flex flex-col items-center justify-center px-3">

                  <div className="flex flex-col items-center justify-center">

                    <svg
                      width="180"
                      height="110"
                      viewBox="0 0 680 610"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >

                      <ellipse
                        cx="337"
                        cy="529"
                        rx="124"
                        ry="14"
                        fill="#E5E5E5"
                      />

                      <path
                        d="M215 330C208 349 202 367 185 385"
                        stroke="#40516D"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />

                      <path
                        d="M184 386C176 386 169 391 164 397C158 405 160 415 168 421C175 426 185 425 190 419C195 413 197 405 194 399"
                        fill="#FAFAFA"
                        stroke="#40516D"
                        strokeWidth="4"
                      />

                      <path
                        d="M177 407L79 410C73 410 70 416 75 420L211 497C218 501 225 496 222 489L185 419"
                        fill="#FAFAFA"
                        stroke="#40516D"
                        strokeWidth="4"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M105 438L190 485"
                        stroke="#40516D"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />

                      <path
                        d="M444 324C468 326 486 315 496 300"
                        stroke="#40516D"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />

                      <path
                        d="M497 300C502 289 511 287 518 290C524 292 527 299 524 305"
                        stroke="#40516D"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />

                      <path
                        d="M523 306L616 283C622 281 626 286 622 291L496 404C491 409 484 405 491 394L530 321"
                        fill="#FAFAFA"
                        stroke="#40516D"
                        strokeWidth="4"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M552 327L503 378"
                        stroke="#40516D"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />

                      <path
                        d="M201 180L428 180L447 208L447 451L219 469L201 451V180Z"
                        fill="#FF796E"
                        stroke="#40516D"
                        strokeWidth="4"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M201 180L427 180L414 193L427 208C376 219 276 220 219 208L232 189L201 180Z"
                        fill="#FF756A"
                        stroke="#40516D"
                        strokeWidth="4"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M220 207C278 219 369 220 447 207V452C389 470 280 474 220 457V207Z"
                        fill="#FFC8C1"
                        stroke="#40516D"
                        strokeWidth="4"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M220 209V456"
                        stroke="#FF958B"
                        strokeWidth="7"
                        strokeLinecap="round"
                      />

                      <path
                        d="M205 183V450"
                        stroke="#40516D"
                        strokeWidth="3"
                        opacity="0.75"
                      />

                      <path
                        d="M252 179C252 135 254 95 290 94C334 92 360 113 362 179"
                        stroke="#40516D"
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="none"
                      />

                      <path
                        d="M274 179C274 141 272 120 306 120C357 120 388 127 388 179"
                        stroke="#40516D"
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="none"
                      />

                      <circle
                        cx="274"
                        cy="246"
                        r="6"
                        fill="#40516D"
                      />

                      <circle
                        cx="388"
                        cy="246"
                        r="6"
                        fill="#40516D"
                      />

                      <circle
                        cx="287"
                        cy="322"
                        r="8"
                        fill="#40516D"
                      />

                      <circle
                        cx="382"
                        cy="319"
                        r="8"
                        fill="#40516D"
                      />

                      <ellipse
                        cx="267"
                        cy="355"
                        rx="10"
                        ry="16"
                        fill="white"
                      />

                      <ellipse
                        cx="402"
                        cy="352"
                        rx="10"
                        ry="16"
                        fill="white"
                      />

                      <path
                        d="M286 382C301 364 336 361 354 382"
                        stroke="#40516D"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                      />

                      <path
                        d="M312 469V524"
                        stroke="#40516D"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />

                      <path
                        d="M357 469V524"
                        stroke="#40516D"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />

                    </svg>

                    <h1 className="lg:text-2xl md:text-xl sm:text-sm text-[15px] uppercase">
                      Empty Cart
                    </h1>

                  </div>

                  <div className="py-10">

                    <Link
                      to="/"
                      onClick={() => setOpenCart(false)}
                      className="px-3 py-1 bg-orange-400 text-black rounded-sm"
                    >
                      Continue Shopping
                    </Link>

                  </div>

                </div>

              ) : (

                /* ================= CART ITEMS ================= */

                <div className="flex flex-col gap-3 px-1">

                  {cartItems.map((item) => (

                    <div
                      key={item.cartId}
                      className="flex gap-3 p-2 rounded-md
                                bg-white/10
                                border border-white/10"
                    >

                      {/* PRODUCT IMAGE */}

                      <Link
                        to={`/product/${item.slug}`}
                        onClick={() =>
                          setOpenCart(false)
                        }
                        className="w-[75px] h-[90px] shrink-0"
                      >
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-sm"
                        />
                      </Link>


                      {/* PRODUCT DETAILS */}

                      <div className="flex-1 min-w-0">

                        <div className="flex justify-between gap-2">

                          <Link
                            to={`/product/${item.slug}`}
                            onClick={() =>
                              setOpenCart(false)
                            }
                            className="text-sm font-semibold line-clamp-2 hover:underline"
                          >
                            {item.name}
                          </Link>

                          {/* REMOVE */}

                          <button
                            onClick={() =>
                              removeFromCart(
                                item.cartId
                              )
                            }
                            className="shrink-0 text-red-400 hover:text-red-500"
                            title="Remove"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>

                        </div>


                        {/* COLOR + SIZE */}

                        <div className="flex flex-wrap gap-x-3 text-[11px] text-gray-300 mt-1">

                          {item.color && (
                            <span>
                              Color:{" "}
                              <b className="text-white">
                                {item.color}
                              </b>
                            </span>
                          )}

                          {item.size && (
                            <span>
                              Size:{" "}
                              <b className="text-white">
                                {item.size}
                              </b>
                            </span>
                          )}

                        </div>


                        {/* PRICE + QUANTITY */}

                        <div className="flex items-center justify-between gap-2 mt-2">

                          {/* QUANTITY */}

                          <div className="flex items-center h-7 border border-white/30 rounded-sm">

                            <button
                              onClick={() =>
                                decreaseQuantity(
                                  item.cartId
                                )
                              }
                              disabled={
                                item.quantity <=
                                1
                              }
                              className="px-2 hover:bg-white/10 disabled:opacity-30"
                            >
                              <Minus
                                size={13}
                              />
                            </button>

                            <span className="w-7 text-center text-xs">
                              {
                                item.quantity
                              }
                            </span>

                            <button
                              onClick={() =>
                                increaseQuantity(
                                  item.cartId
                                )
                              }
                              disabled={
                                item.stock &&
                                item.quantity >=
                                item.stock
                              }
                              className="px-2 hover:bg-white/10 disabled:opacity-30"
                            >
                              <Plus
                                size={13}
                              />
                            </button>

                          </div>


                          {/* PRICE */}

                          <div className="text-sm font-semibold whitespace-nowrap">
                            TK{" "}
                            {(
                              item.price *
                              item.quantity
                            ).toLocaleString()}
                          </div>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>


            {/* ================= FOOTER ================= */}

            {cartItems.length > 0 && (

              <div className="shrink-0 border-t border-gray-400 border-dashed pt-3 pb-2">

                {/* TOTAL */}

                <div className="flex justify-between items-center px-2 mb-3">

                  <span className="text-sm">
                    Subtotal
                  </span>

                  <span className="font-semibold">
                    TK{" "}
                    {totalPrice.toLocaleString()}
                  </span>

                </div>


                {/* BUTTONS */}

                <div className="flex justify-between gap-2 w-full font-poppins">

                  <Link
                    to="/cart"
                    onClick={() =>
                      setOpenCart(false)
                    }
                    className="flex-1 text-center px-3 py-2 bg-black/70 hover:bg-black rounded-sm"
                  >
                    View Cart
                  </Link>

                  <Link
                    to="/checkout"
                    onClick={() =>
                      setOpenCart(false)
                    }
                    className="flex-1 text-center px-3 py-2 bg-orange-400 hover:bg-orange-500 text-black rounded-sm"
                  >
                    Checkout
                  </Link>

                </div>

              </div>

            )}

          </div>
        </div>

        <div
          className={`fixed left-0 w-full
            transition-all duration-300 ease-in-out
            ${isSticky
              ? "bg-black/40 backdrop-blur-3xl  text-white"
              : "bg-black text-white dark:bg-primary-dark dark:text-white"
            }
            ${showNavbar ? "translate-y-16" : "translate-y-0 "}
            lg:flex md:flex hidden justify-center`}
        >
          <ul className="menu menu-horizontal lg:px-1 px-0">
            {navLink}
          </ul>
        </div>

        <div
          ref={menuRef}
          className={`lg:hidden md:hidden fixed top-0 left-0 h-screen 
                    lg:w-[505px] md:w-[240px] sm:w-[320px] w-[300px]
                    z-[60] bg-black/30 backdrop-blur-2xl
                    border-r border-[#17161622] shadow-sm text-white
                    transform transition-transform duration-500 ease-in-out
                    ${open ? "translate-x-0 " : "-translate-x-full"}
                  `}
        >
          < div className="flex flex-row  lg:hidden md:hidden pt-2.5 pl-2 pb-4 bg-black/20">
            <div
              onClick={handleToggle}
              role="button"
              className="w-10 h-10 hover:bg-black/10 rounded-full lg:hidden md:hidden"
            >
              {open ? (
                <AiOutlineClose className="h-10 w-10 p-2" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 p-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h8m-8 6h16"
                  />
                </svg>
              )}
            </div>
            <div className="flex flex-row ml-5  items-center lg:gap-3 md:gap-  w-full sm:px-5 md:px-2  lg:w-2/4 md:w-4/4 select-none">
              <NavLink to="/" className="px- ">
                <div className="flex flex-col items-center w-fit text-center">
                  <span className="text-[13.5px] sm:text-base lg:text-xl text-orange-400 uppercase ">
                    Britto Shop
                  </span>
                  <span className="font-normal text-[8.5px] sm:text-[10px] lg:text-[12.3px] text-inherit hover:text-orange-400 uppercase tracking-widest">
                    E C O M M E R C E
                  </span>
                </div>
              </NavLink>
            </div>
          </div>
          {navLink}
        </div>

        <div className={`${showNavbar ? 'translate-y-[66px] transition-all duration-300 ease-in-out' : 'translate-y-0 transition-all duration-300 ease-in-out'}`}>
          <div className="navbar-center block md:hidden  items-center justify-center ">
            <div className="  lg:w-full  ">
              <div className="flex items-center lg:w-96  overflow-hidden  text-center justify-center">
                <input
                  className={`border border-yellow-600 border-r-0 ${isSticky ? "font-poppins   w-full px-3 py-2 bg-black/50 backdrop-blur-2xl placeholder:text-sm placeholder:text-gray-200 dark:placeholder:text-gray-300 text-[15px]  outline-none ring-0 focus:outline-none " : "font-poppins  w-full  px-3 py-2 bg-black/5 placeholder:text-sm placeholder:text-gray-900 text-black bg-white dark:placeholder:text-gray-200 text-[15px]  outline-none ring-0 focus:outline-none "}`}
                  type="search"
                  placeholder="Search product name..."
                />
                <div className="border border-yellow-600">
                  <button className="h-[39px] w-[36px] flex items-center justify-center bg-[#fb923c] hover:bg-yellow-500 transition text-black ">
                    <CiSearch className="absolute " />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Navbar;

