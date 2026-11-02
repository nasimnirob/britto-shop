import { useState, useRef, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useCart } from "../../Context/CartContext";

const Checkout = () => {
    const [searchParams] = useSearchParams();

    const isBuyNow = searchParams.get("buyNow") === "true";

    const { cartItems, clearCart } = useCart();

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        district: "",
    });

    const districts = [
        "Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj",
        "Madaripur", "Manikganj", "Munshiganj", "Narayanganj",
        "Narsingdi", "Rajbari", "Shariatpur", "Tangail",
        "Bandarban", "Brahmanbaria", "Chandpur", "Chattogram",
        "Cumilla", "Cox's Bazar", "Feni", "Khagrachhari",
        "Lakshmipur", "Noakhali", "Rangamati",
        "Bogura", "Chapainawabganj", "Joypurhat", "Naogaon",
        "Natore", "Pabna", "Rajshahi", "Sirajganj",
        "Bagerhat", "Chuadanga", "Jashore", "Jhenaidah",
        "Khulna", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira",
        "Barguna", "Barishal", "Bhola", "Jhalokathi",
        "Patuakhali", "Pirojpur",
        "Habiganj", "Moulvibazar", "Sunamganj", "Sylhet",
        "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat",
        "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon",
        "Jamalpur", "Mymensingh", "Netrokona", "Sherpur",
    ];

    /* ============ DISTRICT DROPDOWN STATE ============ */
    const [districtOpen, setDistrictOpen] = useState(false);
    const [districtSearch, setDistrictSearch] = useState("");
    const districtRef = useRef(null);

    const filteredDistricts = districts.filter((d) =>
        d.toLowerCase().includes(districtSearch.toLowerCase())
    );

    // বাইরে click করলে dropdown বন্ধ
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (districtRef.current && !districtRef.current.contains(e.target)) {
                setDistrictOpen(false);
                setDistrictSearch("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDistrictSelect = (district) => {
        setFormData((prev) => ({ ...prev, district }));
        setDistrictOpen(false);
        setDistrictSearch("");
    };

    /* ============ FORM ============ */
    const [isSubmitting, setIsSubmitting] = useState(false);

    const buyNowItem = isBuyNow
        ? JSON.parse(localStorage.getItem("buyNow") || "null")
        : null;

    const checkoutItems = isBuyNow
        ? buyNowItem ? [buyNowItem] : []
        : cartItems;

    const checkoutTotal = checkoutItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (checkoutItems.length === 0) {
            alert("Your cart is empty");
            return;
        }

        if (
            !formData.name ||
            !formData.phone ||
            !formData.address ||
            !formData.district
        ) {
            alert("Please fill all information");
            return;
        }

        setIsSubmitting(true);

        const orderData = {
            customer: formData,
            items: checkoutItems,
            totalAmount: checkoutTotal,
            paymentMethod: "cash_on_delivery",
            createdAt: new Date().toISOString(),
        };

        console.log("ORDER DATA:", orderData);

        await new Promise((resolve) => setTimeout(resolve, 800));

        if (isBuyNow) {
            localStorage.removeItem("buyNow");
        } else {
            clearCart();
        }

        setIsSubmitting(false);

        alert("Order placed successfully!");
    };

    if (checkoutItems.length === 0) {
        return (
            <div className="min-h-[500px] flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-semibold">No items to checkout</h1>
                <Link to="/" className="bg-black text-white px-6 py-2">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full px-3 md:px-6 py- text-black dark:text-[#E2E5E9]">

            {/* <h1 className="text-2xl md:text-3xl font-semibold mb-6 border-b border-dashed bg-white dark:bg-secondary-dark border-gray-200 dark:border-gray-700 py-3 text-center relative left-1/2 w-screen -translate-x-1/2">
                Checkout
            </h1> */}

            <h1 className="relative text-2xl md:text-3xl font-semibold mb-6 bg-white dark:bg-secondary-dark py-3 text-center left-1/2 w-screen -translate-x-1/2 overflow-hidden">
                <span className="absolute top-0 left-0 w-full h-[1px] 
    bg-[repeating-linear-gradient(90deg,theme(colors.gray.300)_0_3px,transparent_3px_4px)]
    dark:bg-[repeating-linear-gradient(90deg,theme(colors.gray.600)_0_3px,transparent_3px_4px)]
    animate-[slide-ltr_0.4s_linear_infinite]" />
                Checkout
                <span className="absolute bottom-0 left-0 w-full h-[1px] 
    bg-[repeating-linear-gradient(90deg,theme(colors.gray.300)_0_3px,transparent_3px_4px)]
    dark:bg-[repeating-linear-gradient(90deg,theme(colors.gray.600)_0_3px,transparent_3px_4px)]
    animate-[slide-rtl_0.4s_linear_infinite]" />
            </h1>

            <div className="grid lg:grid-cols-4 gap-6">

                {/* ================= CUSTOMER INFO ================= */}

                <form onSubmit={handleSubmit} className="lg:col-span-2 border-dashed border-[#e1e4e7] dark:border-[#383838] p-">

                    <h2 className="text-xl font-semibold mb-5">
                        Delivery Information{" "}
                        <span className="text-[16px]">
                            (<span className="font-hindSiliguri text-[16px]">ডেলিভারি তথ্য</span>)
                        </span>
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">

                        {/* NAME */}
                        <div className="md:col-span-2">
                            <label className="block text-sm mb-1">
                                Name (<span className="font-hindSiliguri text-[14px]">আপনার নাম</span>){" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                autoComplete="name"
                                className="bg-white dark:bg-secondary-dark w-full border border-dashed rounded-[4px] border-gray-300 hover:border-[#9ca3af] dark:border-gray-600 dark:hover:border-gray-400 bg-transparent px-3 min-h-11 outline-none text-black dark:text-[#E2E5E9] focus:border-[#9ca3af] transition-colors"
                            />
                        </div>

                        {/* PHONE */}
                        <div className="md:col-span-2">
                            <label className="block text-sm mb-1">
                                Phone Number (<span className="font-hindSiliguri text-[14px]">মোবাইল নাম্বার</span>){" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="01XXXXXXXXX"
                                autoComplete="tel"
                                className="bg-white dark:bg-secondary-dark w-full border border-dashed rounded-[4px] border-gray-300 hover:border-[#9ca3af] dark:border-gray-600 dark:hover:border-gray-400 bg-transparent px-3 min-h-11 outline-none text-black dark:text-[#E2E5E9] focus:border-[#9ca3af] transition-colors"
                            />
                        </div>

                        {/* ============ DISTRICT — CUSTOM DROPDOWN ============ */}
                        <div className="md:col-span-2">
                            <label className="block text-sm mb-1">
                                District (<span className="font-hindSiliguri text-[14px]">জেলা</span>){" "}
                                <span className="text-red-500">*</span>
                            </label>

                            <div className="relative" ref={districtRef}>

                                {/* input with arrow */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="district"
                                        value={
                                            districtOpen
                                                ? districtSearch
                                                : formData.district
                                        }
                                        onChange={(e) => {
                                            setDistrictSearch(e.target.value);
                                            if (!districtOpen) setDistrictOpen(true);
                                        }}
                                        onFocus={() => {
                                            setDistrictOpen(true);
                                            setDistrictSearch("");
                                        }}
                                        placeholder="Select District.."
                                        autoComplete="address-level2"
                                        className="w-full min-h-11 px-3 pr-10 border border-dashed rounded-[4px] border-gray-300 hover:border-[#9ca3af] dark:border-gray-600 dark:hover:border-gray-400 bg-white dark:bg-secondary-dark text-black dark:text-[#E2E5E9] outline-none focus:border-[#9ca3af] transition-colors cursor-pointer"
                                    />

                                    {/* arrow icon — click করলে toggle */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDistrictOpen((o) => !o);
                                            setDistrictSearch("");
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    >
                                        <svg
                                            className={`w-4 h-4 transition-transform duration-200 ${districtOpen ? "rotate-180" : ""}`}
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>

                                {/* dropdown list */}
                                {districtOpen && (
                                    <ul className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-[#1f1f1f] border border-dashed border-[#e5e7eb] dark:border-[#383838] rounded-[4px] shadow-lg">

                                        {filteredDistricts.length === 0 ? (
                                            <li className="px-3 py-2 text-sm text-gray-400">
                                                No district found
                                            </li>
                                        ) : (
                                            filteredDistricts.map((d) => {
                                                const isSelected = d === formData.district;
                                                return (
                                                    <li
                                                        key={d}
                                                        onClick={() => handleDistrictSelect(d)}
                                                        className={`px-3 py-2 text-sm cursor-pointer transition-colors ${isSelected
                                                            ? "bg-black text-white dark:bg-white dark:text-black"
                                                            : "text-black dark:text-[#E2E5E9] hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                                                            }`}
                                                    >
                                                        {d}
                                                    </li>
                                                );
                                            })
                                        )}

                                    </ul>
                                )}

                            </div>
                        </div>

                        {/* ADDRESS */}
                        <div className="md:col-span-2">
                            <label className="block text-sm mb-1">
                                Full Address (<span className="font-hindSiliguri text-[14px]">সম্পূর্ণ ঠিকানা</span>){" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="4"
                                placeholder="House, Road, Area..."
                                autoComplete="street-address"
                                className="bg-white dark:bg-secondary-dark w-full border border-dashed rounded-[4px] border-gray-300 hover:border-[#9ca3af] dark:border-gray-600 dark:hover:border-gray-400 bg-transparent px-3 py-3 outline-none resize-none text-black dark:text-[#E2E5E9] focus:border-[#9ca3af] transition-colors"
                            />
                        </div>

                    </div>

                    {/* Payment */}
                    {/* <div className="mt-6">
                        <h2 className="text-lg font-semibold mb-3">Payment Method</h2>
                        <div className="border rounded-sm border-dashed border-gray-300 dark:border-gray-600 p-4">
                            <label className="flex items-center gap-3">
                                <input type="radio" checked readOnly />
                                <span>Cash on Delivery</span>
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-6 bg-gray-900 hover:bg-gray-700 uppercase text-white dark:bg-white dark:text-black py-3 disabled:opacity-50 font-semibold text-base tracking-wide"
                    >
                        {isSubmitting
                            ? "Placing Order..."
                            : `Place Order`}
                    </button> */}
                </form>

                {/* ================= ORDER SUMMARY ================= */}

                <div className="lg:col-span-2">
                    <div className=" border border-dashed border-[#c8cccf] rounded-sm dark:border-[#383838] p-5 sticky top-20">

                        <h2 className="text-xl font-semibold mb-5 text-center uppercase">Your Order</h2>

                        <div className="flex flex-col gap-4 bg-white dark:bg-secondary-dark p-5">
                            {checkoutItems.map((item) => (
                                <div key={item.cartId} className="flex gap-3">
                                    <img
                                        src={item.thumbnail}
                                        alt={item.name}
                                        className="w-20 h-20 object-cover"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium">{item.name}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                                            {item.color} / {item.size}
                                        </p>
                                        <p className="text-sm mt-1">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold mt-1">
                                        {(item.price * item.quantity).toLocaleString()} TK
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col py-3 gap-2">
                            <h1 className="font-semibold ">Delivery Method</h1>
                            <div className="text-gray-700 dark:text-gray-400 font-thin">
                                <div className="flex items-center gap-1.5 ">

                                    <span>Outside Dhaka — <span>100</span> TK</span>
                                </div>
                                <div className="flex items-center gap-1.5 ">

                                    <span>Inside Dhaka — <span>60</span> TK</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col py-3 gap-2 dark:text-gray-400 text-gray-700">
                            <div className="flex items-center justify-between gap-1.5 ">
                                <span>Subtotal</span>
                                <span><span>100</span> TK</span>
                            </div>
                            <div className="flex items-center justify-between gap-1.5 ">

                                <span>Delivery Charges</span>
                                <span><span>100</span> TK</span>
                            </div>
                        </div>


                        <div className="flex flex-col gap-2">
                            <h3 className="font-semibold text-sm uppercase tracking-wide">Payment Options</h3>
                            <div className="flex flex-wrap gap-2">
                                {["Cash On Delivery", "Bkash", "Nagad"].map((method) => (
                                    <span
                                        key={method}
                                        className="text-xs px-3 py-1.5 rounded-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/40"
                                    >
                                        {method}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {/* <div className="border-t border-gray-200 dark:border-gray-700 my-5" /> */}
                        <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-4" />

                        <div className="flex justify-between text-lg font-semibold">
                            <span>Total</span>
                            <span> {checkoutTotal.toLocaleString()} TK</span>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full mt-6 bg-gray-900  hover:bg-gray-700 uppercase text-white dark:bg-white dark:text-black py-3 disabled:opacity-50 rounded-sm text-base tracking-wide cursor-not-allowed"
                        >
                            {isSubmitting
                                ? "Placing Order..."
                                : `Place Order`}
                        </button>

                    </div>

                    {/* <div className="border border-dashed border-[#c8cccf] dark:border-[#383838] rounded-sm p-5 sticky top-20 bg-w dark:bg-secondary-dark">

                
                        <h2 className="text-xl font-semibold mb-5 text-center uppercase tracking-wide">
                            Your Order
                        </h2>

                 
                        <div className="flex flex-col gap-4 bg-white p-5">
                            {checkoutItems.map((item) => (
                                <div key={item.cartId} className="flex gap-3 pb-4 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-none last:pb-0">
                                    <img
                                        src={item.thumbnail}
                                        alt={item.name}
                                        className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-sm border border-gray-100 dark:border-gray-800"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium line-clamp-2">{item.name}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {item.color} / {item.size}
                                        </p>
                                        <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                                            Qty: <span className="font-medium text-gray-800 dark:text-gray-200">{item.quantity}</span>
                                        </p>
                                    </div>
                                    <p className="font-semibold text-sm whitespace-nowrap">
                                        {(item.price * item.quantity).toLocaleString()} TK
                                    </p>
                                </div>
                            ))}
                        </div>

           
                        <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-4" />

                    
                        <div className="flex flex-col gap-2">
                            <h3 className="font-semibold text-sm uppercase tracking-wide">Delivery Method</h3>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <div className="flex justify-between">
                                    <span>Outside Dhaka</span>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">100 TK</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Inside Dhaka</span>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">60 TK</span>
                                </div>
                            </div>
                        </div>

                       
                        <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-4" />

                        
                        <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">100 TK</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Charges</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">100 TK</span>
                            </div>
                        </div>

                        
                        <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-4" />

                       
                        <div className="flex flex-col gap-2">
                            <h3 className="font-semibold text-sm uppercase tracking-wide">Payment Options</h3>
                            <div className="flex flex-wrap gap-2">
                                {["Cash On Delivery", "Bkash", "Nagad"].map((method) => (
                                    <span
                                        key={method}
                                        className="text-xs px-3 py-1.5 rounded-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/40"
                                    >
                                        {method}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-4" />

                     
                        <div className="flex justify-between items-center text-lg font-semibold">
                            <span>Total</span>
                            <span className="text-xl">৳ {checkoutTotal.toLocaleString()}</span>
                        </div>
                    </div> */}
                </div>

            </div>
        </div>
    );
};

export default Checkout;