import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import useProducts from "../../Hooks/useProducts";
import SizeChart from "../SizeChart/SizeChart";
import { useCart } from "../../Context/CartContext";

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { products } = useProducts();
    const { addToCart } = useCart();

    const product = products.find(
        (p) => p.slug === id
    );

    const [selectedImage, setSelectedImage] = useState(0);

    const [selectedColor, setSelectedColor] =
        useState("");

    const [selectedSize, setSelectedSize] =
        useState("");

    const [quantity, setQuantity] = useState(1);

    // Set first available color and size
    // useEffect(() => {
    //     if (!product?.variants?.length) {
    //         return;
    //     }

    //     const firstVariant = product.variants[0];

    //     setSelectedColor(firstVariant.color);

    //     const firstAvailableSize =
    //         firstVariant.sizes?.find(
    //             (size) => size.stock > 0
    //         );

    //     setSelectedSize(
    //         firstAvailableSize?.size || ""
    //     );

    //     setQuantity(1);
    // }, [product]);

    // Selected color variant
    const selectedVariant =
        product?.variants?.find(
            (variant) =>
                variant.color === selectedColor
        );

    // Selected size data
    const selectedSizeData =
        selectedVariant?.sizes?.find(
            (size) =>
                size.size === selectedSize
        );

    // Current stock
    const currentStock =
        selectedSizeData?.stock ??
        product?.stock ??
        0;

    // Quantity increase
    const increase = () => {
        setQuantity((current) => {
            const value = Number(current) || 1;

            if (
                currentStock > 0 &&
                value >= currentStock
            ) {
                return value;
            }

            return value + 1;
        });
    };

    // Quantity decrease
    const decrease = () => {
        setQuantity((current) => {
            const value = Number(current) || 1;

            return value > 1 ? value - 1 : 1;
        });
    };

    // Create cart item
    const createCartItem = () => {
        if (!product) {
            return null;
        }

        if (!selectedColor) {
            alert("Please select a color");
            return null;
        }

        if (
            selectedVariant?.sizes?.length > 0 &&
            !selectedSize
        ) {
            alert("Please select a size");
            return null;
        }

        if (
            selectedSizeData &&
            selectedSizeData.stock <= 0
        ) {
            alert("Selected size is out of stock");
            return null;
        }

        const finalQuantity =
            Number(quantity) || 1;

        if (
            currentStock > 0 &&
            finalQuantity > currentStock
        ) {
            alert(
                `Only ${currentStock} items available`
            );

            return null;
        }

        return {
            cartId: `${product._id}-${selectedColor}-${selectedSize || "default"}`,

            productId: product._id,

            slug: product.slug,

            name: product.name,

            thumbnail:
                product.thumbnail ||
                product.images?.[0],

            price:
                product.price?.sellingPrice || 0,

            mrp:
                product.price?.mrp || 0,

            color: selectedColor,

            size: selectedSize,

            quantity: finalQuantity,

            stock: currentStock,

            addedAt: Date.now(),
        };
    };

    // Add to cart
    const handleAddToCart = () => {
        const cartItem = createCartItem();

        if (!cartItem) {
            return;
        }

        addToCart(cartItem);

        alert("Product added to cart");
    };

    // Buy Now
    const handleBuyNow = () => {
        const cartItem = createCartItem();

        if (!cartItem) {
            return;
        }

        localStorage.setItem(
            "buyNow",
            JSON.stringify(cartItem)
        );

        navigate("/checkout?buyNow=true");
    };

    if (!product) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <h1 className="text-xl">
                    Product not found
                </h1>
            </div>
        );
    }

    return (
        <div className="text-black dark:text-[#E2E5E9] my-2 w-full">
            <div className="grid lg:grid-cols-5 md:grid-cols-2 grid-cols-1 w-full">

                {/* ================= IMAGES ================= */}

                <div className="lg:col-span-3 col-span-5 flex flex-col">
                    <div className="flex lg:flex-row-reverse md:flex-row-reverse flex-col justify-center">

                        {/* Main Image */}

                        <div className="lg:w-[770px] lg:h-[770px] md:w-[700px] md:h-[700px] w-full h-[500px] flex items-center justify-center">
                            <img
                                src={
                                    product?.images?.[
                                    selectedImage
                                    ] ||
                                    product?.image
                                }
                                alt={product?.name}
                                className="w-full h-full object-cover border rounded-[4px] border-[#E1E4E7] dark:border-[#202020]"
                            />
                        </div>

                        {/* Thumbnails */}

                        <div className="flex p-2 lg:pt-0 gap-2 lg:flex-col md:flex-col lg:justify-start lg:items-start md:justify-start md:items-start items-center justify-center">
                            {product?.images
                                ?.slice(0, 4)
                                .map((img, i) => (
                                    <img
                                        key={i}
                                        onClick={() =>
                                            setSelectedImage(
                                                i
                                            )
                                        }
                                        className={`lg:w-[95px] lg:h-[110px] md:w-[95px] md:h-[110px] w-[70px] h-[70px] object-cover cursor-pointer border hover:border-black ${selectedImage ===
                                                i
                                                ? "border-black"
                                                : "border-transparent"
                                            }`}
                                        src={img}
                                        alt=""
                                    />
                                ))}
                        </div>
                    </div>
                </div>

                {/* ================= PRODUCT INFO ================= */}

                <div className="lg:col-span-2 col-span-2 p-3 font-poppins">

                    <h1 className="text-3xl font-normal font-poppins lg:text-start md:text-start text-center">
                        {product?.name}
                    </h1>

                    {/* Stock */}

                    <div className="py-1">
                        {currentStock > 0 ? (
                            <span className="text-sm border border-green-300 px-1 py-0.5 bg-green-200 text-green-800 rounded-sm">
                                In Stock{" "}
                                <span className="text-zinc-500">
                                    {currentStock}
                                </span>
                            </span>
                        ) : (
                            <span className="text-sm border border-red-300 px-1 py-0.5 bg-red-200 text-red-600 rounded-sm">
                                Stock Out
                            </span>
                        )}
                    </div>

                    {/* Price */}

                    <div className="flex items-center gap-2 py-3">
                        <p className="font-poppins text-gray-600 text-lg line-through decoration-gray-600 decoration-solid decoration-3">
                            {product?.price?.mrp}
                        </p>

                        <p className="font-poppins text-2xl font-bold">
                            {product?.price?.sellingPrice}
                            <span className="font-semibold">
                                {" "}
                                TK
                            </span>
                        </p>
                    </div>

                    {/* Size Chart */}

                    <div className="flex flex-col gap-0 py-2">
                        <h1 className="text-[15px]">
                            Size Chart
                        </h1>

                        <div>
                            <SizeChart />
                        </div>
                    </div>

                    {/* ================= COLOR ================= */}

                    <div className="flex flex-col gap-1 py-2">
                        <h1 className="text-[15px]">
                            Select Color
                        </h1>

                        <div className="flex gap-1.5 text-sm flex-wrap">
                            {product?.variants?.map(
                                (variant) => (
                                    <button
                                        key={
                                            variant.color
                                        }
                                        onClick={() => {
                                            setSelectedColor(
                                                variant.color
                                            );

                                            const firstAvailableSize =
                                                variant.sizes?.find(
                                                    (
                                                        size
                                                    ) =>
                                                        size.stock >
                                                        0
                                                );

                                            setSelectedSize(
                                                firstAvailableSize?.size ||
                                                ""
                                            );

                                            setQuantity(
                                                1
                                            );
                                        }}
                                        className={`px-3 py-1 h-10 border ${selectedColor ===
                                                variant.color
                                                ? "bg-black text-white"
                                                : "bg-white dark:bg-[#252728]"
                                            }`}
                                    >
                                        {
                                            variant.color
                                        }
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* ================= SIZE ================= */}

                    {selectedVariant && (
                        <div className="flex flex-col gap-1 py-2">
                            <h1 className="text-[15px]">
                                Select Size
                            </h1>

                            <div className="flex gap-1.5 text-sm flex-wrap">
                                {selectedVariant?.sizes?.map(
                                    (size) => (
                                        <button
                                            key={
                                                size.sku
                                            }
                                            disabled={
                                                size.stock ===
                                                0
                                            }
                                            onClick={() => {
                                                setSelectedSize(
                                                    size.size
                                                );

                                                setQuantity(
                                                    1
                                                );
                                            }}
                                            className={`px-3 py-1 w-10 h-10 border flex justify-center items-center ${size.stock ===
                                                    0
                                                    ? "opacity-40 cursor-not-allowed line-through"
                                                    : selectedSize ===
                                                        size.size
                                                        ? "bg-black text-white border-black"
                                                        : "hover:bg-black hover:text-white cursor-pointer"
                                                }`}
                                        >
                                            {
                                                size.size
                                            }
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* ================= QUANTITY ================= */}

                    <div className="flex flex-col gap-1 py-2">
                        <h1 className="text-[15px]">
                            Quantity:
                        </h1>

                        <div className="md:flex md:gap-2">

                            <div className="flex h-10 w-28 items-center justify-between border px-1 border-[#65686c] bg-white dark:border-none dark:bg-[#252728]">

                                <button
                                    onClick={
                                        decrease
                                    }
                                    className="text-lg px-2 hover:text-red-500"
                                >
                                    −
                                </button>

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={quantity}
                                    onFocus={(e) =>
                                        e.target.select()
                                    }
                                    onChange={(e) => {
                                        const value =
                                            e.target.value.replace(
                                                /\D/g,
                                                ""
                                            );

                                        if (
                                            value ===
                                            ""
                                        ) {
                                            setQuantity(
                                                ""
                                            );
                                            return;
                                        }

                                        let number =
                                            Number(
                                                value
                                            );

                                        if (
                                            currentStock >
                                            0 &&
                                            number >
                                            currentStock
                                        ) {
                                            number =
                                                currentStock;
                                        }

                                        setQuantity(
                                            number
                                        );
                                    }}
                                    onBlur={() => {
                                        if (
                                            quantity ===
                                            "" ||
                                            Number(
                                                quantity
                                            ) < 1
                                        ) {
                                            setQuantity(
                                                1
                                            );
                                        }
                                    }}
                                    className="w-10 text-base bg-transparent text-center outline-none"
                                />

                                <button
                                    onClick={
                                        increase
                                    }
                                    className="text-lg px-2 hover:text-blue-500"
                                >
                                    +
                                </button>
                            </div>

                            {/* Mobile Add To Cart */}

                            <button
                                onClick={
                                    handleAddToCart
                                }
                                disabled={
                                    currentStock === 0
                                }
                                className="md:flex-1 lg:hidden md:block hidden border bg-white py-1 hover:bg-black hover:text-white dark:bg-[#252728] dark:hover:bg-[#3B3D3E] border-[#65686c] dark:border-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add To Cart
                            </button>
                        </div>
                    </div>

                    {/* ================= BUTTONS ================= */}

                    <div className="flex w-full lg:max-w-[460px] max-w-[460px] md:max-w-[1000px] gap-[10px] py-4">

                        <button
                            onClick={
                                handleAddToCart
                            }
                            disabled={
                                currentStock === 0
                            }
                            className="md:hidden lg:block lg:flex-1 flex-1 border bg-white py-1 hover:bg-black hover:text-white dark:bg-[#252728] dark:hover:bg-[#3B3D3E] border-[#65686c] dark:border-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add To Cart
                        </button>

                        <button
                            onClick={
                                handleBuyNow
                            }
                            disabled={
                                currentStock === 0
                            }
                            className="md:w-full flex-1 border bg-white py-1 hover:bg-black hover:text-white dark:bg-[#252728] dark:hover:bg-[#3B3D3E] border-[#65686c] dark:border-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Buy Now
                        </button>

                    </div>
                </div>

                {/* ================= DESCRIPTION ================= */}

                <div className="col-span-5 bg-white dark:bg-[#252728] px-2 my-3">
                    <h1 className="py-3 underline text-2xl">
                        DesCripTion
                    </h1>

                    <div className="uppercase">
                        <p className="text-[12px]">
                            SKU: {product?.slug}
                        </p>
                    </div>

                    <h2 className="whitespace-pre-line py-2 font-poppins">
                        {product?.description}
                    </h2>
                </div>

            </div>
        </div>
    );
};

export default ProductDetails;