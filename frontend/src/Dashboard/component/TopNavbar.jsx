import { IoCloseSharp } from "react-icons/io5";
import { RiMenu2Line } from "react-icons/ri";
import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { RxPerson } from "react-icons/rx";
import { AuthContext } from "../../providers/AuthProviders";

const TopNavbar = ({ mobileOpen, setMobileOpen, isMobile }) => {
    const { user, loading } = useContext(AuthContext);

    return (
        <nav className="bg-[#F2F4F7] dark:bg-secondary-dark dark:text-[#E2E5E6] text-black md:hidden">
            <div className="flex justify-between items-center w-full px-4 py-3">

                {/* Left: Hamburger + Title */}
                <div className="flex items-center gap-5">
                    {isMobile && (
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="bg-[#9e9e9e11] dark:bg-gray-800 p-2 rounded-md text-blue-500"
                            aria-label="Open menu"
                        >
                            <RiMenu2Line className="text-xl" />
                        </button>
                    )}
                    <h1 className="font-semibold">Admin Panel</h1>
                </div>

                {/* Right: User */}
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-medium hidden sm:block">
                        {user?.displayName}
                    </h2>
                    <NavLink to="/profile" className="hover:text-black/80 btn-circle avatar">
                        <div className="w-10 rounded-full">
                            {loading ? (
                                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                            ) : user?.photoURL ? (
                                <img
                                    className="rounded-full p-1 w-10 h-10 hover:bg-black/10 dark:hover:bg-black/15"
                                    src={user.photoURL}
                                    alt="Profile"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <RxPerson className="text-4xl rounded-full border-yellow-700 p-1 mt-1.5 hover:bg-black/10" />
                            )}
                        </div>
                    </NavLink>
                </div>
            </div>
        </nav>
    );
};

export default TopNavbar;