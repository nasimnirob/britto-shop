import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useCart } from "../../Context/CartContext";

const Checkout = () => {
    const [searchParams] = useSearchParams();

    const isBuyNow =
        searchParams.get("buyNow") === "true";

    const { cartItems, totalPrice, clearCart } =
        useCart();

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        city: "",
    });

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    // Buy Now item
    const buyNowItem = isBuyNow
        ? JSON.parse(
            localStorage.getItem("buyNow") || "null"
        )
        : null;

    const checkoutItems = isBuyNow
        ? buyNowItem
            ? [buyNowItem]
            : []
        : cartItems;

    const checkoutTotal = checkoutItems.reduce(
        (total, item) =>
            total +
            item.price * item.quantity,
        0
    );

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
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
            !formData.city
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

        /*
        Later backend API:

        await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        });
        */

        await new Promise((resolve) =>
            setTimeout(resolve, 800)
        );

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
                <h1 className="text-2xl font-semibold">
                    No items to checkout
                </h1>

                <Link
                    to="/"
                    className="bg-black text-white px-6 py-2"
                >
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full px-3 md:px-6 py-6 text-black dark:text-[#E2E5E9]">

            <h1 className="text-2xl md:text-3xl font-semibold mb-6">
                Checkout
            </h1>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* ================= CUSTOMER INFO ================= */}

                <form
                    onSubmit={handleSubmit}
                    className="lg:col-span-2 border border-[#e1e4e7] dark:border-[#383838] p-5"
                >
                    <h2 className="text-xl font-semibold mb-5">
                        Delivery Information
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">

                        <div className="md:col-span-2">
                            <label className="block text-sm mb-1">
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                className="w-full border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-3 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-1">
                                Phone Number
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="01XXXXXXXXX"
                                className="w-full border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-3 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-1">
                                City
                            </label>

                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Dhaka"
                                className="w-full border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-3 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm mb-1">
                                Full Address
                            </label>

                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="4"
                                placeholder="House, Road, Area..."
                                className="w-full border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-3 outline-none resize-none"
                            />
                        </div>

                    </div>

                    {/* Payment */}

                    <div className="mt-6">
                        <h2 className="text-lg font-semibold mb-3">
                            Payment Method
                        </h2>

                        <div className="border border-black dark:border-white p-4">
                            <label className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    checked
                                    readOnly
                                />

                                <span>
                                    Cash on Delivery
                                </span>
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-6 bg-black text-white dark:bg-white dark:text-black py-3 disabled:opacity-50"
                    >
                        {isSubmitting
                            ? "Placing Order..."
                            : `Place Order - ৳ ${checkoutTotal.toLocaleString()}`}
                    </button>
                </form>

                {/* ================= ORDER SUMMARY ================= */}

                <div className="lg:col-span-1">

                    <div className="border border-[#e1e4e7] dark:border-[#383838] p-5 sticky top-20">

                        <h2 className="text-xl font-semibold mb-5">
                            Your Order
                        </h2>

                        <div className="flex flex-col gap-4">

                            {checkoutItems.map(
                                (item) => (
                                    <div
                                        key={
                                            item.cartId
                                        }
                                        className="flex gap-3"
                                    >
                                        <img
                                            src={
                                                item.thumbnail
                                            }
                                            alt={
                                                item.name
                                            }
                                            className="w-16 h-20 object-cover"
                                        />

                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium">
                                                {
                                                    item.name
                                                }
                                            </h3>

                                            <p className="text-xs text-gray-500 mt-1">
                                                {
                                                    item.color
                                                }{" "}
                                                /{" "}
                                                {
                                                    item.size
                                                }
                                            </p>

                                            <p className="text-sm mt-1">
                                                Qty:{" "}
                                                {
                                                    item.quantity
                                                }
                                            </p>

                                            <p className="font-semibold mt-1">
                                                ৳{" "}
                                                {(
                                                    item.price *
                                                    item.quantity
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 my-5" />

                        <div className="flex justify-between text-lg font-semibold">
                            <span>
                                Total
                            </span>

                            <span>
                                ৳{" "}
                                {checkoutTotal.toLocaleString()}
                            </span>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;