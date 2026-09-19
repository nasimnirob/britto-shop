import { useContext } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProviders";
import { Helmet } from "react-helmet-async";

const Register = () => {
  const { user, googleLogin, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleGoogleLogin = () => {
    googleLogin()
      .then((result) => {
        console.log(result.user);
        navigate("/");
      })

      .catch((error) => {
        console.error(error);
      });
  };
  return (
    <div className="flex items-center justify-center h-screen">
      <Helmet>
        <title>Britto Shop | Register</title>
      </Helmet>
      <div className="bg-white p-10 px- rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-orange-500">
          <NavLink to="/">Britto Shop</NavLink>
        </h2>
        <p className="font-bold uppercase py-2 text-blue-600">Register</p>
        <p className="text-[#7C7C7C] pb-2">Create a new account</p>
        <form className="space-y-4">
          <div className="relative mb-6 mt-5">
            <input
              type="text"
              id="Input"
              placeholder="Enter Your Name"
              className="peer block w-full border-b-2 border-gray-300 bg-transparent pt-4 pb-1 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-blue-600 focus:placeholder-transparent"
            />
            <label
              htmlFor="Input"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 mb-0 max-w-[90%] text-gray-400 text-sm transition-all duration-200 scale-100 origin-left pointer-events-none opacity-0 peer-focus:top-0 peer-focus:opacity-100 peer-focus:scale-75 peer-focus:text-blue-600"
            >
              Full Name
            </label>
          </div>

          <div className="relative mb-6 mt-5">
            <input
              type="text"
              id="Input2"
              placeholder="Enter Your Email"
              className="peer block w-full border-b-2 border-gray-300 bg-transparent pt-4 pb-1 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-blue-600 focus:placeholder-transparent"
            />
            <label
              htmlFor="Input2"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 mb-0 max-w-[90%] text-gray-400 text-sm transition-all duration-200 scale-100 origin-left pointer-events-none opacity-0 peer-focus:top-0 peer-focus:opacity-100 peer-focus:scale-75 peer-focus:text-blue-600"
            >
              Email Address
            </label>
          </div>

          <div className="relative mb-6">
            <input
              type="password"
              id="Input22"
              placeholder="Password"
              className="peer block w-full border-b-2 border-gray-300 bg-transparent pt-4 pb-1 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-blue-600 focus:placeholder-transparent"
            />
            <label
              htmlFor="Input22"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 mb-0 max-w-[90%] text-gray-400 text-sm transition-all duration-200 scale-100 origin-left pointer-events-none opacity-0 peer-focus:top-0 peer-focus:opacity-100 peer-focus:scale-75 peer-focus:text-blue-600"
            >
              Password
            </label>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div className="mb-[0.125rem] block min-h-[1.5rem]">
              <input type="checkbox" value="" id="exampleCheck2" />
              <label
                className="inline-block text-gray-500 ps-[0.15rem] hover:cursor-pointer"
                htmlFor="exampleCheck2"
              >
                <div className="pl-2 no-copy">
                  I accept{" "}
                <span className="text-blue-600">Terms & Conditions</span>
                </div>
              </label>
            </div>
          </div>

          <div className="text-center lg:text-left">
            
            <div className="flex items-center justify- py-4 rounded-md">
              <button
                type="button"
                className="btn border-none w-full h-[45px] bg-[#438AFE] uppercase text-white rounded-md"
                data-twe-ripple-init
                data-twe-ripple-color="light"
              >
                Register
              </button>
            </div>
            <hr />
            <p className="my-2 text-black text-center">OR</p>
            <hr />
            <div className="px-1 mt-2 flex items-center justify-between gap-1 uppercase text-white  h-[45px]">
              <div
                onClick={handleGoogleLogin}
                className="btn bg-white text-black border border-gray-300 rounded-full flex items-center justify-center w- h-[45px] px-[18px] gap-2 "
              >
                <div>
                  <p className="rounded-full  ">Continue With</p>
                </div>
                <div>
                  <FcGoogle />
                </div>
              </div>
              <div className="btn  bg-white text-black border-gray-300 border rounded-full flex items-center w- h-[45px] px-[18px] gap-2">
                <div>
                  <p className="rounded-full  ">Continue With</p>
                </div>
                <div>
                  <FaFacebook className="text-lg text-blue-500" />
                </div>
              </div>
            </div>

            <p className="mb-0 mt-2 pt-1 text-sm font-semibold text-center text-[#7C7C7C]">
              Already have an Account?
              <NavLink
                to="/login"
                className="px-1 text-blue-600 text-danger transition duration-150 ease-in-out hover:text-danger-600 focus:text-danger-600 active:text-danger-700"
              >
                Login Here{" "}
              </NavLink>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
