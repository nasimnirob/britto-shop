import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import useProducts from "../../Hooks/useProducts";
import { useCart } from "../../Context/CartContext";
import useColors from "../../Hooks/useColors";
import useSizes from "../../Hooks/useSizes";
import SelectedPreview from "./SelectedPreview";
import SizeChartDisplay from "../SizeChart/SizeChartDisplay";

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { products } = useProducts();
    const { colors } = useColors();
    const { sizes } = useSizes();
    const { addToCart } = useCart();

    const product = products.find((p) => p.slug === id);

    // ---------- Helper (null-safe) ----------
    const getColor = (colorId) => {
        if (!colorId) return undefined;
        return colors?.find((color) => color._id === colorId);
    };

    const getSize = (sizeId) => {
        if (!sizeId) return undefined;
        return sizes?.find((size) => size._id === sizeId);
    };

    // ---------- Variation flags ----------
    const hasVariants = product?.variants?.length > 0;

    const hasColor =
        product?.variationType === "color-size" ||
        product?.variationType === "color";

    const hasSize =
        product?.variationType === "color-size" ||
        product?.variationType === "size";

    // ---------- State ----------
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [showImageModal, setShowImageModal] = useState(false);

    // প্রোডাক্ট বদলালে reset
    useEffect(() => {
        setSelectedColor("");
        setSelectedSize("");
        setSelectedImage(0);
        setQuantity(1);
    }, [product?._id]);

    // ---------- Selected variant ----------
    const selectedVariant = hasColor
        ? product?.variants?.find(
            (variant) => variant.colorId === selectedColor
        )
        : product?.variants?.[0];

    // ---------- Selected size data ----------
    const selectedSizeData = hasSize
        ? selectedVariant?.sizes?.find(
            (size) => size.sizeId === selectedSize
        )
        : selectedVariant?.sizes?.[0];

    // ---------- Image preview logic ----------
    const previewImages = (() => {
        if (selectedSizeData?.images?.length > 0) {
            return selectedSizeData.images;
        }
        if (selectedVariant?.images?.length > 0) {
            return selectedVariant.images;
        }
        return product?.images?.length
            ? product.images
            : product?.thumbnail
                ? [product.thumbnail]
                : [];
    })();

    // color/size পরিবর্তন হলে image index reset
    useEffect(() => {
        setSelectedImage(0);
    }, [selectedColor, selectedSize]);

    // ---------- Stock ----------
    const currentStock = (() => {
        if (!hasVariants) return Number(product?.totalStock) || 0;
        if (hasColor && hasSize) {
            return selectedSizeData
                ? Number(selectedSizeData.stock) || 0
                : 0;
        }
        if (hasColor && !hasSize) {
            return selectedVariant?.sizes?.[0]
                ? Number(selectedVariant.sizes[0].stock) || 0
                : 0;
        }
        if (!hasColor && hasSize) {
            return selectedSizeData
                ? Number(selectedSizeData.stock) || 0
                : 0;
        }
        return 0;
    })();

    // ---------- Price ----------
    const currentPrice =
        Number(
            selectedSizeData?.price?.sellingPrice ||
            selectedVariant?.sizes?.[0]?.price?.sellingPrice
        ) ||
        Number(product?.price?.sellingPrice) ||
        0;

    const currentMrp =
        Number(
            selectedSizeData?.price?.mrp ||
            selectedVariant?.sizes?.[0]?.price?.mrp
        ) ||
        Number(product?.price?.mrp) ||
        0;

    // ---------- Total stock ----------
    const totalStock =
        product?.variants?.reduce(
            (total, variant) =>
                total +
                (variant.sizes?.reduce(
                    (sizeTotal, size) =>
                        sizeTotal + (Number(size.stock) || 0),
                    0
                ) || 0),
            0
        ) || 0;

    const displayStock = (() => {
        if (!hasVariants) return Number(product?.totalStock) || 0;
        if (hasColor && !selectedColor) return totalStock;
        if (hasSize && !selectedSize) return totalStock;
        return currentStock;
    })();

    // ---------- Selected names ----------
    const selectedColorName = getColor(selectedColor)?.name || "";
    const selectedSizeName = getSize(selectedSize)?.name || "";

    // Preview image
    const previewImage =
        previewImages?.[selectedImage] ||
        product?.thumbnail ||
        product?.images?.[0];

    // ---------- Preview show logic ----------
    // validation ছাড়া — শুধু select করলেই দেখাবে
    const showPreview =
        Boolean(selectedColor) || Boolean(selectedSize);

    // ---------- Quantity ----------
    const increase = () => {
        setQuantity((current) => {
            const value = Number(current) || 1;
            if (currentStock > 0 && value >= currentStock) return value;
            return value + 1;
        });
    };

    const decrease = () => {
        setQuantity((current) => {
            const value = Number(current) || 1;
            return value > 1 ? value - 1 : 1;
        });
    };

    // ---------- Cart item builder ----------
    const createCartItem = () => {
        if (!product) return null;

        const selectedColorData = getColor(selectedColor);
        const selectedSizeInfo = getSize(selectedSize);

        if (hasColor && !selectedColor) {
            alert("Please select a color");
            return null;
        }

        if (hasSize && !selectedSize) {
            alert("Please select a size");
            return null;
        }

        const sizeData = hasSize
            ? selectedSizeData
            : selectedVariant?.sizes?.[0];

        if (sizeData && sizeData.stock <= 0) {
            alert("Selected item is out of stock");
            return null;
        }

        const finalQuantity = Number(quantity) || 1;

        if (currentStock > 0 && finalQuantity > currentStock) {
            alert(`Only ${currentStock} items available`);
            return null;
        }

        return {
            cartId: `${product._id}-${selectedColor || "default"}-${selectedSize || "default"
                }`,
            productId: product._id,
            slug: product.slug,
            name: product.name,
            thumbnail:
                previewImages?.[0] ||
                product.thumbnail ||
                product.images?.[0],
            price: currentPrice || 0,
            mrp: currentMrp || 0,
            colorId: selectedColor || null,
            color: selectedColorData?.name || "",
            sizeId: selectedSize || null,
            size: selectedSizeInfo?.name || "",
            quantity: finalQuantity,
            stock: currentStock,
            addedAt: Date.now(),
        };
    };

    const handleAddToCart = () => {
        const cartItem = createCartItem();
        if (!cartItem) return;
        addToCart(cartItem);
        alert("Product added to cart");
    };

    const handleBuyNow = () => {
        const cartItem = createCartItem();
        if (!cartItem) return;
        localStorage.setItem("buyNow", JSON.stringify(cartItem));
        navigate("/checkout?buyNow=true");
    };

    if (!product) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <h1 className="text-xl">Product not found</h1>
            </div>
        );
    }

    //     console.log("PRODUCT:", product);
    // console.log("THUMBNAIL:", product?.thumbnail);
    // console.log("IMAGES:", product?.images);
    // console.log("PREVIEW IMAGES:", previewImages);
    // console.log("PREVIEW IMAGE:", previewImage);

    return (
        <div className="text-black dark:text-[#E2E5E9] my-2 w-full">
            <div className="grid lg:grid-cols-5 md:grid-cols-2 grid-cols-1 w-full">

                {/* ================= IMAGES ================= */}
                <div className="lg:col-span-3 col-span-5 flex flex-col">
                    <div className="flex lg:flex-row-reverse md:flex-row-reverse flex-col justify-center">

                        <div className="lg:w-[770px] lg:h-[770px] md:w-[700px] md:h-[700px] w-full h-[500px] flex items-center justify-center">
                            <img
                                src={
                                    previewImages?.[selectedImage] ||
                                    product?.thumbnail
                                }
                                alt={product?.name}
                                onClick={() => setShowImageModal(true)}
                                className="w-full h-full object-cover border rounded-[4px] border-[#E1E4E7] dark:border-[#202020] cursor-zoom-in"
                            />
                        </div>

                        <div className="flex p-2 lg:pt-0 gap-2 lg:flex-col md:flex-col lg:justify-start lg:items-start md:justify-start md:items-start items-center justify-center">
                            {previewImages?.slice(0, 4).map((img, i) => (
                                <img
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`lg:w-[95px] lg:h-[110px] md:w-[95px] md:h-[110px] w-[70px] h-[70px] object-cover cursor-pointer border hover:border-black ${selectedImage === i
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
                        {displayStock > 0 ? (
                            <span className="text-sm border border-green-300 px-1 py-0.5 bg-green-200 text-green-800 rounded-sm">
                                In Stock{" "}
                                <span className="text-zinc-500">
                                    {displayStock}
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
                            {currentMrp}
                        </p>
                        <p className="font-poppins text-2xl font-bold">
                            {currentPrice}
                            <span className="font-semibold"> TK</span>
                        </p>
                    </div>

                    {/* Size Chart */}


                    <div>
                        {/* ================= SIZE CHART ================= */}
                        {product?.sizeChart ? (
                            <div className="flex flex-col gap-1 py-2">
                                <h1 className="text-[15px] font-medium">Size Chart</h1>

                                <SizeChartDisplay chart={product.sizeChart} />
                            </div>
                        ) : product?.sizeChartUrl ? (
                            <div className="flex flex-col gap-1 py-2">
                                <h1 className="text-[15px] font-medium">Size Chart</h1>

                                <button
                                    type="button"
                                    onClick={() =>
                                        window.open(product.sizeChartUrl, "_blank", "noopener")
                                    }
                                    className="w-fit rounded-lg border border-gray-200 px-3 py-2 text-sm hover:border-gray-400 dark:border-gray-700"
                                >
                                    View Size Chart
                                </button>
                            </div>
                        ) : null}
                    </div>



                    {/* ================= COLOR ================= */}
                    {hasColor && (
                        <div className="flex flex-col gap-1 py-2">
                            <h1 className="text-[15px]">Select Color</h1>
                            <div className="flex gap-1.5 text-sm flex-wrap">
                                {product?.variants?.map((variant, index) => {
                                    const color = getColor(variant.colorId);
                                    return (
                                        <button
                                            key={variant.colorId || index}
                                            onClick={() => {
                                                // same color → deselect
                                                if (
                                                    selectedColor ===
                                                    variant.colorId
                                                ) {
                                                    setSelectedColor("");
                                                    setSelectedSize("");
                                                    return;
                                                }

                                                setSelectedColor(
                                                    variant.colorId
                                                );

                                                // size ধরে রাখার চেষ্টা
                                                if (hasSize && selectedSize) {
                                                    const sizeStillExists =
                                                        variant.sizes?.some(
                                                            (s) =>
                                                                s.sizeId ===
                                                                selectedSize &&
                                                                s.stock > 0
                                                        );

                                                    if (!sizeStillExists) {
                                                        setSelectedSize("");
                                                    }
                                                }

                                                setQuantity(1);
                                            }}
                                            className={`px-3 py-1 h-10 border ${selectedColor ===
                                                variant.colorId
                                                ? "bg-black text-white"
                                                : "bg-white dark:bg-[#252728]"
                                                }`}
                                        >
                                            {color?.name || "Unknown Color"}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ================= SIZE ================= */}
                    {hasSize &&
                        (!hasColor || selectedColor) &&
                        selectedVariant && (
                            <div className="flex flex-col gap-1 py-2">
                                <h1 className="text-[15px]">Select Size</h1>
                                <div className="flex gap-1.5 text-sm flex-wrap">
                                    {selectedVariant?.sizes?.map((size, idx) => {
                                        if (!size.sizeId) return null;

                                        const sizeInfo = getSize(
                                            size.sizeId
                                        );
                                        return (
                                            <button
                                                key={size.sizeId || idx}
                                                disabled={size.stock === 0}
                                                onClick={() => {
                                                    if (
                                                        selectedSize ===
                                                        size.sizeId
                                                    ) {
                                                        setSelectedSize("");
                                                        return;
                                                    }
                                                    setSelectedSize(
                                                        size.sizeId
                                                    );
                                                    setQuantity(1);
                                                }}
                                                className={`px-3 py-1 w-10 h-10 border flex justify-center items-center ${size.stock === 0
                                                    ? "opacity-40 cursor-not-allowed line-through"
                                                    : selectedSize ===
                                                        size.sizeId
                                                        ? "bg-black text-white border-black"
                                                        : "hover:bg-black hover:text-white cursor-pointer"
                                                    }`}
                                            >
                                                {sizeInfo?.name || "-"}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                    {/* ================= SELECTED PREVIEW ================= */}
                    {/* validation নেই — শুধু select করলেই দেখাবে */}
                    {showPreview && (
                        <div className="flex justify-start py-3">
                            <SelectedPreview
                                image={previewImage}
                                colorName={selectedColorName}
                                sizeName={selectedSizeName}
                                sellingPrice={currentPrice}
                                mrp={currentMrp}
                                currency="TK"
                                onImageClick={() => setShowImageModal(true)}
                            />
                        </div>
                    )}

                    {/* ================= QUANTITY ================= */}
                    <div className="flex flex-col gap-1 py-2">
                        <h1 className="text-[15px]">Quantity:</h1>
                        <div className="md:flex md:gap-2">
                            <div className="flex h-10 w-28 items-center justify-between border px-1 border-[#65686c] bg-white dark:border-none dark:bg-[#252728]">
                                <button
                                    onClick={decrease}
                                    className="text-lg px-2 hover:text-red-500"
                                >
                                    −
                                </button>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={quantity}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(
                                            /\D/g,
                                            ""
                                        );
                                        if (value === "") {
                                            setQuantity("");
                                            return;
                                        }
                                        let number = Number(value);
                                        if (
                                            currentStock > 0 &&
                                            number > currentStock
                                        ) {
                                            number = currentStock;
                                        }
                                        setQuantity(number);
                                    }}
                                    onBlur={() => {
                                        if (
                                            quantity === "" ||
                                            Number(quantity) < 1
                                        ) {
                                            setQuantity(1);
                                        }
                                    }}
                                    className="w-10 text-base bg-transparent text-center outline-none"
                                />
                                <button
                                    onClick={increase}
                                    className="text-lg px-2 hover:text-blue-500"
                                >
                                    +
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={currentStock === 0}
                                className="md:flex-1 lg:hidden md:block hidden border bg-white py-1 hover:bg-black hover:text-white dark:bg-[#252728] dark:hover:bg-[#3B3D3E] border-[#65686c] dark:border-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add To Cart
                            </button>
                        </div>
                    </div>

                    {/* ================= BUTTONS ================= */}
                    <div className="flex w-full lg:max-w-[460px] max-w-[460px] md:max-w-[1000px] gap-[10px] py-4">
                        <button
                            onClick={handleAddToCart}
                            disabled={currentStock === 0}
                            className="md:hidden lg:block lg:flex-1 flex-1 border bg-white py-1 hover:bg-black hover:text-white dark:bg-[#252728] dark:hover:bg-[#3B3D3E] border-[#65686c] dark:border-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add To Cart
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={currentStock === 0}
                            className="md:w-full flex-1 border bg-white py-1 hover:bg-black hover:text-white dark:bg-[#252728] dark:hover:bg-[#3B3D3E] border-[#65686c] dark:border-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Buy Now
                        </button>
                    </div>
                </div>

                {/* ================= DESCRIPTION ================= */}
                <div className="col-span-5 bg-white dark:bg-[#252728] px-2 my-3">
                    <h1 className="py-3 underline text-2xl">DesCripTion</h1>
                    <div className="uppercase">
                        <p className="text-[12px]">SKU: {product?.slug}</p>
                    </div>
                    <h2 className="whitespace-pre-line py-2 font-poppins">
                        {product?.description}
                    </h2>
                </div>
            </div>

            {/* ================= IMAGE MODAL ================= */}
            {showImageModal && (
                <div
                    onClick={() => setShowImageModal(false)}
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
                >
                    <img
                        src={previewImage}
                        alt="preview"
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            )}
        </div>
    );
};

export default ProductDetails;