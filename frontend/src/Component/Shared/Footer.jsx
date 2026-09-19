import { FaFacebook, FaGithub } from "react-icons/fa";
import { IoLogoLinkedin } from "react-icons/io";

const Footer = () => {
    return (
        <>
            <footer className="footer sm:footer-horizontal bg-neutral text-neutral-content p-6 flex lg:flex-row flex-col md:flex-row justify-around items-center h-full">
                <aside className="">
                    {/* <h1 className="uppercase text-center w-full  p-2 ">Contact Us</h1> */}
                    <h1 className="uppercase text-center w-full text-xl text-orange-500">ব্রিট্টো শপ</h1>
                    <p>
                        Chartola Mor, College Road, Rangpur
                        <br />
                    </p>
                    <h1 className=" text-center w-full ">Email : mdnasimnirob4650@gmail.com</h1>
                    <h1 className=" text-center w-full ">Phone : +8801757-706811</h1>
                    <h1 className=" text-center w-full ">Weekdays : 9:00 AM - 6:00 PM</h1>
                    <h1 className=" text-center w-full ">weekends : 10:00 AM - 4:00 PM</h1>
                </aside>
                <nav className="">
                    <h1 className="text-xl p-2 text-center w-full">Follow US</h1>
                    <h6 className="footer-title text-white font-poppins font-extralight text-lg">Join us on Social Media</h6>
                    <div className="grid grid-flow-col gap-8 w-full  px-5">
                        <a href="https://github.com/nasimnirob" target="_blank">
                            <FaGithub className=" w-10 h-10 hover:text-yellow-500" />

                        </a>
                        <a href="https://www.linkedin.com/in/nasim-nirob/" target="_blank">
                            <IoLogoLinkedin className="w-11 h-11  text-white hover:text-yellow-500" />

                        </a>
                        <a href="https://www.facebook.com/nasim.nirob.official" target="_blank" className="  " >
                            <FaFacebook className="w-10 h-10 hover:text-yellow-500 text-blue-600 bg-black outline-none rounded-3xl border-none " />

                        </a>

                    </div>
                </nav>

            </footer>
            <footer className="z-10 footer sm:footer-horizontal footer-center bg-neutral text-[12px] p-4 text-white font-poppins">
                <aside>
                    <p>Copyright © {new Date().getFullYear()} - All right reserved by <span className="text-blue-600">Britto Shop</span></p>
                </aside>
            </footer>
        </>
    );
};

export default Footer;