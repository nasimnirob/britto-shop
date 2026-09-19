import { Background } from 'react-parallax';
import img from '../../../assets/Feature/TravelLifestyle.jpg'

const Feature = () => {
    return (
        <div
            className="hero min-h-[500px] bg-fixed mb-8"
            style={{
                backgroundImage:
                    `url(${img})`

            }}
        >
            <div className="hero-overlay"></div>
            <div className="hero-content text-neutral-content text-center">
                <div className=" lg:p-10 p-5 py-4 lg:py-14 bg-white  text-black border-2 w-4/5" >
                    {/* <img src={img} alt="" /> */}
                    <h1 className="mb-5 text-5xl font-bold text-blue-600">Britto Shop</h1>
                    <p className="mb-5 p-1  text-center  text-gray-600">
                        <span className='text-blue-700'>Britto Shop</span> হচ্ছে ফ্যাশন, ইলেকট্রনিকস, হোম প্রোডাক্টস, বিউটি কেয়ার এবং আরও অনেক কিছু কেনার জন্য একটি আধুনিক অনলাইন মার্কেটপ্লেস। আমরা দিচ্ছি মানসম্পন্ন পণ্য, সহজ অর্ডারিং প্রক্রিয়া এবং দ্রুত ডেলিভারি — সব কিছু এক জায়গায়।
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Feature;