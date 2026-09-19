import { Link } from "react-router-dom";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "../../../Context/CartContext";


const Cart = () => {
    const {
        cartItems,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        totalItems,
        totalPrice,
    } = useCart();

    console.log(cartItems)

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[500px] flex flex-col items-center justify-center gap-4 px-4">
                <h1 className="text-2xl font-semibold">
                    Your cart is empty
                </h1>

                <Link
                    to="/"
                    className="px-6 py-2 bg-black text-white dark:bg-white dark:text-black"
                >
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full px-3 md:px-6 py-6 text-black dark:text-[#E2E5E9]">

            <h1 className="text-2xl md:text-3xl font-semibold mb-6">
                Shopping Cart
            </h1>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* ================= CART ITEMS ================= */}

                <div className="lg:col-span-2 flex flex-col gap-4">

                    {cartItems.map((item) => (
                        <div
                            key={item.cartId}
                            className="border border-[#e1e4e7] dark:border-[#383838] p-3 flex gap-4"
                        >

                            {/* Image */}

                            <div className="w-28 h-32 md:w-36 md:h-40 shrink-0">
                                <img
                                    src={item.thumbnail}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Details */}

                            <div className="flex-1 flex flex-col justify-between">

                                <div>
                                    <div className="flex justify-between gap-2">

                                        <h2 className="font-medium text-base md:text-lg">
                                            {item.name}
                                        </h2>

                                        <button
                                            onClick={() =>
                                                removeFromCart(
                                                    item.cartId
                                                )
                                            }
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2
                                                size={19}
                                            />
                                        </button>

                                    </div>

                                    <div className="text-sm text-gray-500 mt-1 space-y-1">
                                        {item.color && (
                                            <p>
                                                Color:{" "}
                                                <span className="text-black dark:text-white">
                                                    {item.color}
                                                </span>
                                            </p>
                                        )}

                                        {item.size && (
                                            <p>
                                                Size:{" "}
                                                <span className="text-black dark:text-white">
                                                    {item.size}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3 mt-3">

                                    {/* Quantity */}

                                    <div className="flex h-9 items-center border border-[#65686c]">

                                        <button
                                            onClick={() =>
                                                decreaseQuantity(
                                                    item.cartId
                                                )
                                            }
                                            className="px-2"
                                        >
                                            <Minus
                                                size={15}
                                            />
                                        </button>

                                        <span className="w-8 text-center text-sm">
                                            {item.quantity}
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
                                            className="px-2 disabled:opacity-30"
                                        >
                                            <Plus
                                                size={15}
                                            />
                                        </button>

                                    </div>

                                    {/* Price */}

                                    <div className="font-semibold">
                                        ৳{" "}
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

                {/* ================= SUMMARY ================= */}

                <div className="lg:col-span-1">

                    <div className="border border-[#e1e4e7] dark:border-[#383838] p-5 sticky top-20">

                        <h2 className="text-xl font-semibold mb-5">
                            Order Summary
                        </h2>

                        <div className="flex justify-between text-sm mb-3">
                            <span>
                                Items
                            </span>

                            <span>
                                {totalItems}
                            </span>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

                        <div className="flex justify-between text-lg font-semibold">
                            <span>
                                Total
                            </span>

                            <span>
                                ৳{" "}
                                {totalPrice.toLocaleString()}
                            </span>
                        </div>

                        <Link
                            to="/checkout"
                            className="block text-center w-full mt-5 bg-black text-white dark:bg-white dark:text-black py-3 hover:opacity-80"
                        >
                            Proceed to Checkout
                        </Link>

                        <Link
                            to="/"
                            className="block text-center w-full mt-3 border border-[#65686c] py-3"
                        >
                            Continue Shopping
                        </Link>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;