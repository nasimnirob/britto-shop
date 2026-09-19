import { useContext, useState } from "react";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { RxEyeOpen } from "react-icons/rx";
import { IoEyeOffOutline } from "react-icons/io5";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProviders";
import { Helmet } from "react-helmet-async";

const Login = () => {
  const { user, googleLogin, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState();
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
    <div className="flex lg:flex-row md:flex-row sm:flex-col flex-col justify-center items-center py-12 w-full px-4 ">
      <Helmet>
        <title>Britto Shop | Login</title>
      </Helmet>

      <div className="w-full xl:w-1/3 lg:w-1/2 md:w-1/2 flex justify-center  items-center lg:border-r md:border-r lg:pr-10 md:pr-10 xl:pr-10 border-gray-200 ">
        <div className="  w-full max-w-md">
          <p className="font-bold text-blue-500 uppercase text-2xl py-5">Login</p>
          <p className="text-[#7C7C7C] pb-2 dark:text-gray-400">Login to access your account</p>
          <form className="space-y-4">
            <div className="relative mb-6 mt-5 ">
              <input
                type="text"
                id="Input2"
                placeholder="Your Phone Number Or Email"
                className="peer block w-full border-b-2 border-gray-300 bg-transparent pt-2 pb-1 text-gray-900 dark:text-white placeholder-gray-800 dark:placeholder-gray-200 outline-none transition-all duration-200 focus:border-blue-600  focus:placeholder-transparent dark:focus:placeholder-transparent"
              />
              <label
                htmlFor="Input2"
                className="absolute left-0 top-3/4 transform -translate-y-3/4 mb-0 max-w-[90%] text-gray-400 text-base transition-all duration-200 scale-100 origin-left pointer-events-none opacity-0 peer-focus:top-0 peer-focus:opacity-100 peer-focus:scale-75 peer-focus:text-blue-600"
              >
                Phone Number Or Email<span className="text-red-500">*</span>
              </label>
            </div>
            <div className="relative mb-6 mt-5 ">
              <input
                    type={`${showPassword ? 'text' : 'password'}`}
                    id="Input22"
                    placeholder="Password"
                    className="peer block w-full border-b-2 border-gray-300 bg-transparent pt-2 pb-1 text-gray-900 dark:text-white placeholder-gray-800 dark:placeholder-gray-200 outline-none transition-all duration-200 focus:border-blue-600 focus:placeholder-transparent dark:focus:placeholder-transparent"
                  />
                  <label
                    htmlFor="Input22"
                    className="absolute left-0 top-3/4 transform -translate-y-3/4 mb-0 max-w-[90%] text-gray-400 dark:text-white text-base transition-all duration-200 scale-100 origin-left pointer-events-none opacity-0 peer-focus:top-0 peer-focus:opacity-100 peer-focus:scale-75 peer-focus:text-blue-600 dark:focus:placeholder-transparent"
                  >
                    Password<span className="text-red-500">*</span>
                  </label>
                  <span
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-black dark:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <RxEyeOpen /> : <IoEyeOffOutline />}
                  </span>
            </div>


            <div className="flex w-full items-center justify-between ">
               <div className="flex items-center gap- justify-center  text-base">
                <input className="accent-blue-500 " type="checkbox" value="" id="exampleCheck2" />
                  <label
                    className="inline-block text-gray-500  hover:cursor-pointer"
                    for="exampleCheck2"
                  >
                    <span className="no-copy pl-1 text-base">Remember me</span>
                  </label>
              </div>
              <div className="">
                <button className="text-gray-700 dark:text-gray-300 text-sm ">Forgot password?</button>
              </div>
            </div>

            <div className="text-center lg:text-left ">
              <div className="flex items-center justify- py-4 rounded-md">
                <button
                  type="button"
                  className="btn border-none w-full h-[45px] bg-[#438AFE]- bg-black uppercase text-white rounded-sm hover:bg-gray-800 dark:hover:bg-gray-900 hover:text-white"
                  data-twe-ripple-init
                  data-twe-ripple-color="light"
                >
                  Login
                </button>
              </div>

              <hr />
              <p className="my-2 text-black text-center dark:text-white">OR</p>
              <hr />
              <div className=" px-1 mt-3 flex  items-center lg:justify-around justify-around  gap-1 uppercase text-white  h-[45px] w-full">
                <div
                  onClick={handleGoogleLogin}
                  className="btn dark:text-white bg-white dark:bg-gray-900 dark:border-gray-600 dark:hover:bg-gray-800 text-black border border-gray-300 rounded-full flex items-center justify-center w- h-[45px] lg:px-[18px] px-2 lg:gap-2 gap-1 lg:text-base text-[13px]  hover:bg-gray-200"
                >
                  <div>
                    <p className="rounded-full  ">Continue With</p>
                  </div>
                  <div>
                    <FcGoogle />
                  </div>
                </div>
                <div className="btn bg-white dark:bg-gray-900 dark:text-white dark:border-gray-600 dark:hover:bg-gray-800 text-black border-gray-300 border rounded-full flex items-center w- h-[45px] lg:px-[18px] px-2 lg:gap-2 gap-1 lg:text-base text-[13px] hover:bg-gray-200">
                  <div>
                    <p className="rounded-full  ">Continue With</p>
                  </div>
                  <div>
                    <FaFacebook className="text-lg text-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="w-full space-y-4 xl:w-1/3 lg:w-1/2 md:w-1/2 lg:pl- md:pl-10  max-w-md" >
        <div>
          <h1 className="text-blue-500 uppercase font-bold text-2xl py-5 hidden lg:block md:block">New Here? Register Now</h1>
          <h1 className="text-blue-500  font-bold text-3xl py-5 mt-3 block lg:hidden md:hidden">Don’t have an Account?</h1>
          <p className="text-black text-sm py- dark:text-gray-200 hidden lg:block md:block"><span className="text-base">Create your free account and unlock a smoother shopping experience.</span><br></br>
           <span className=""> With your account, you can: </span><br />

            ✔ Save your shipping addresses <br />

            ✔ Track your orders in real-time <br />

            ✔ Add items to your wishlist <br />

            ✔ Get personalized recommendations <br />

            ✔ Receive special offers & exclusive discounts <br />

          </p>
          <p className="mb-0 mt-2 pt-1 text-sm font-semibold text- text-[#7C7C7C] dark:text-gray-400 w-full py-3 hidden lg:block md:block">
            Don’t have an Account?  {"  "} <br />
          </p>
          <NavLink
            to="/register"
          >
            <div className="max-w-md justify-center  flex items-center py-4 rounded-md">
              <button
                type="button"
                className="btn border-none w-full h-[45px] bg-[#438AFE]- bg-black uppercase text-white rounded-sm hover:bg-gray-800 dark:hover:bg-gray-900 hover:text-white"
                data-twe-ripple-init
                data-twe-ripple-color="light"
              >
                Register Here
              </button>
            </div>
          </NavLink>
        </div>

      </div>

    </div>
  );
};

export default Login;