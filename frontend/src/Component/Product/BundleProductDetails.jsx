import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";

import useBundleProducts from "../../Hooks/useBundleProducts";
import { useCart } from "../../Context/CartContext";
// import useColors from "../../Hooks/useColors";
// import useSizes from "../../Hooks/useSizes";
import SelectedPreview from "../Product/SelectedPreview";
import SizeChartDisplay from "../SizeChart/SizeChartDisplay";

const BundleProductDetails = () => {
    const { id } = useParams(); // slug
    const navigate = useNavigate();

    const { addToCart } = useCart();
    // const { colors } = useColors();
    // const { sizes } = useSizes();

    // ---------------------------------------------------------
    // Bundle fetch
    // ---------------------------------------------------------
    const {
        singleBundle: bundle,
        singleLoading: loading,
        singleError: error,
        fetchBundleBySlug,
        resetSingleError,
        resetSingleBundle,
    } = useBundleProducts({ autoFetch: false });

    // ---------------------------------------------------------
    // UI State
    // ---------------------------------------------------------
    const [selectedImage, setSelectedImage] = useState(0);
    const [showImageModal, setShowImageModal] = useState(false);
    const [quantity, setQuantity] = useState(1);

    // ✅ প্রতিটি bundle product এর selected variant
    // { [productId]: { colorId, sizeId, quantity } }
    const [selectedVariants, setSelectedVariants] = useState({});

    // ---------------------------------------------------------
    // Fetch bundle
    // ---------------------------------------------------------
    useEffect(() => {
        if (!id) return;

        resetSingleError();
        resetSingleBundle();
        setSelectedImage(0);
        setQuantity(1);
        setSelectedVariants({});

        fetchBundleBySlug(id).catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // ---------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------
    // const getColor = (colorId) => {
    //     if (!colorId) return undefined;
    //     return colors?.find((c) => String(c._id) === String(colorId));
    // };

    // const getSize = (sizeId) => {
    //     if (!sizeId) return undefined;
    //     return sizes?.find((s) => String(s._id) === String(sizeId));
    // };

    const getColor = (colorId, product) => {
        if (!colorId || !product?.variants) return undefined;
        const variant = product.variants.find(
            (v) => String(v.colorId) === String(colorId)
        );
        return variant?.color || undefined;
    };

    const getSize = (sizeId, product) => {
        if (!sizeId || !product?.variants) return undefined;
        for (const variant of product.variants) {
            const sizeItem = (variant.sizes || []).find(
                (s) => String(s.sizeId) === String(sizeId)
            );
            if (sizeItem?.size) return sizeItem.size;
        }
        return undefined;
    };

    // ---------------------------------------------------------
    // Gallery
    // ---------------------------------------------------------
    const galleryImages = useMemo(() => {
        if (!bundle) return [];
        if (Array.isArray(bundle.images) && bundle.images.length > 0) {
            return bundle.images;
        }
        return bundle.thumbnail ? [bundle.thumbnail] : [];
    }, [bundle]);

    const previewImage =
        galleryImages[selectedImage] || bundle?.thumbnail || "";

    // ---------------------------------------------------------
    // Pricing
    // ---------------------------------------------------------
    const pricing = bundle?.pricing || {
        originalValue: 0,
        sellingPrice: Number(bundle?.price?.sellingPrice) || 0,
        savings: 0,
        discountPercent: 0,
        currency: "BDT",
    };

    // ---------------------------------------------------------
    // ✅ প্রতিটি bundle product এর selected variant info
    // ---------------------------------------------------------
    const getProductSelectionState = (bundleItem) => {
        const product = bundleItem.product;
        if (!product) {
            return {
                hasColor: false,
                hasSize: false,
                variationType: "none",
                selectedColor: "",
                selectedSize: "",
                selectedVariant: null,
                selectedSizeData: null,
                currentStock: 0,
                currentPrice: 0,
                currentMrp: 0,
                previewImage: "",
                previewImages: [],
            };
        }

        const variationType = product.variationType || "none";
        const hasColor =
            variationType === "color" || variationType === "color-size";
        const hasSize =
            variationType === "size" || variationType === "color-size";

        const sel = selectedVariants[String(bundleItem.productId)] || {};
        const selectedColor = sel.colorId || "";
        const selectedSize = sel.sizeId || "";

        // Selected variant
        const selectedVariant = hasColor
            ? product.variants?.find(
                (v) => String(v.colorId) === String(selectedColor)
            )
            : product.variants?.[0];

        // Selected size data
        const selectedSizeData = hasSize
            ? selectedVariant?.sizes?.find(
                (s) => String(s.sizeId) === String(selectedSize)
            )
            : selectedVariant?.sizes?.[0];

        // Stock
        let currentStock = 0;
        if (!hasColor && !hasSize) {
            currentStock = Number(product.totalStock) || 0;
        } else if (hasColor && hasSize) {
            currentStock = selectedSizeData
                ? Number(selectedSizeData.stock) || 0
                : 0;
        } else if (hasColor && !hasSize) {
            currentStock = selectedVariant
                ? (selectedVariant.sizes || []).reduce(
                    (sum, s) => sum + (Number(s.stock) || 0),
                    0
                )
                : 0;
        } else if (!hasColor && hasSize) {
            currentStock = selectedSizeData
                ? Number(selectedSizeData.stock) || 0
                : 0;
        }

        // Price
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

        // Preview images
        let previewImages = [];
        if (selectedSizeData?.images?.length > 0) {
            previewImages = selectedSizeData.images;
        } else if (selectedVariant?.images?.length > 0) {
            previewImages = selectedVariant.images;
        } else if (product?.images?.length > 0) {
            previewImages = product.images;
        } else if (product?.thumbnail) {
            previewImages = [product.thumbnail];
        }

        return {
            hasColor,
            hasSize,
            variationType,
            selectedColor,
            selectedSize,
            selectedVariant,
            selectedSizeData,
            currentStock,
            currentPrice,
            currentMrp,
            previewImages,
            previewImage:
                previewImages?.[0] || product?.thumbnail || "",
        };
    };

    // ---------------------------------------------------------
    // ✅ Variant change handlers (per product)
    // ---------------------------------------------------------
    const handleColorChange = (productId, colorId) => {
        setSelectedVariants((prev) => {
            const current = prev[String(productId)] || {};
            const isSame = String(current.colorId) === String(colorId);

            return {
                ...prev,
                [String(productId)]: {
                    ...current,
                    colorId: isSame ? "" : colorId,
                    sizeId: "", // reset size when color changes
                },
            };
        });
        setQuantity(1);
    };

    const handleSizeChange = (productId, sizeId) => {
        setSelectedVariants((prev) => {
            const current = prev[String(productId)] || {};
            const isSame = String(current.sizeId) === String(sizeId);

            return {
                ...prev,
                [String(productId)]: {
                    ...current,
                    sizeId: isSame ? "" : sizeId,
                },
            };
        });
        setQuantity(1);
    };

    // ---------------------------------------------------------
    // ✅ Per-product stock & validation
    // ---------------------------------------------------------
    const productStates = useMemo(() => {
        if (!bundle?.products) return [];

        return bundle.products.map((item) => {
            const state = getProductSelectionState(item);
            const requiredQty = Number(item.quantity) || 1;

            const possibleBundles =
                requiredQty > 0
                    ? Math.floor(state.currentStock / requiredQty)
                    : 0;

            // Is this product fully selected?
            const isSelected =
                (!state.hasColor || state.selectedColor) &&
                (!state.hasSize || state.selectedSize);

            return {
                ...state,
                item,
                requiredQty,
                possibleBundles,
                isSelected,
            };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
        // }, [bundle, selectedVariants, colors, sizes]);
    }, [bundle, selectedVariants]);

    // ---------------------------------------------------------
    // ✅ Bundle stock = min over all products
    // ---------------------------------------------------------
    const totalStock = useMemo(() => {
        if (!productStates.length) return 0;

        // If any product isn't fully selected, return 0
        const allSelected = productStates.every((p) => p.isSelected);
        if (!allSelected) return 0;

        return Math.min(...productStates.map((p) => p.possibleBundles));
    }, [productStates]);

    const allVariantsSelected = useMemo(() => {
        if (!productStates.length) return false;
        return productStates.every((p) => p.isSelected);
    }, [productStates]);

    // ---------------------------------------------------------
    // Quantity handlers
    // ---------------------------------------------------------
    const increase = () =>
        setQuantity((q) => {
            const v = Number(q) || 1;
            if (totalStock > 0 && v >= totalStock) return v;
            return v + 1;
        });

    const decrease = () =>
        setQuantity((q) => {
            const v = Number(q) || 1;
            return v > 1 ? v - 1 : 1;
        });

    // ---------------------------------------------------------
    // ✅ Cart item
    // ---------------------------------------------------------
    const createCartItem = () => {
        if (!bundle) return null;

        if (!allVariantsSelected) {
            alert("Please select color and size for all products");
            return null;
        }

        const finalQty = Number(quantity) || 1;

        if (totalStock <= 0) {
            alert("This bundle is out of stock");
            return null;
        }

        if (finalQty > totalStock) {
            alert(`Only ${totalStock} bundles available`);
            return null;
        }

        const items = (bundle.products || []).map((item) => {
            const product = item.product;
            const sel = selectedVariants[String(item.productId)] || {};

            // const color = getColor(sel.colorId);
            // const size = getSize(sel.sizeId);

            const color = getColor(sel.colorId, product);
            const size = getSize(sel.sizeId, product);

            return {
                productId: item.productId,
                name: product?.name || "Unavailable",
                quantity: item.quantity,
                thumbnail: product?.thumbnail,
                colorId: sel.colorId || null,
                colorName: color?.name || "",
                sizeId: sel.sizeId || null,
                sizeName: size?.name || "",
            };
        });

        return {
            cartId: `bundle-${bundle._id}`,
            type: "bundle",
            productId: bundle._id,
            slug: bundle.slug,
            name: bundle.name,
            thumbnail: bundle.thumbnail,
            price: pricing.sellingPrice,
            mrp: pricing.originalValue,
            quantity: finalQty,
            stock: totalStock,
            items,
            addedAt: Date.now(),
        };
    };

    const handleAddToCart = () => {
        const item = createCartItem();
        if (!item) return;
        addToCart(item);
        alert("Bundle added to cart");
    };

    const handleBuyNow = () => {
        const item = createCartItem();
        if (!item) return;
        localStorage.setItem("buyNow", JSON.stringify(item));
        navigate("/checkout?buyNow=true");
    };

    // ---------------------------------------------------------
    // Loading / Error
    // ---------------------------------------------------------
    // if (loading) {
    //     return (
    //         <div className="min-h-[400px] flex items-center justify-center">
    //             <p className="text-gray-500">Loading bundle...</p>
    //         </div>
    //     );
    // }

    if (loading) {
        return (
            <div className="text-black dark:text-[#E2E5E9] my-2 w-full">
                <div className="grid lg:grid-cols-5 md:grid-cols-2 grid-cols-1 w-full">
                    {/* Images skeleton */}
                    <div className="lg:col-span-3 col-span-5 flex flex-col">
                        <div className="flex lg:flex-row-reverse md:flex-row-reverse flex-col justify-center">
                            <div className="lg:w-[770px] lg:h-[770px] md:w-[700px] md:h-[700px] w-full h-[500px] bg-gray-200 dark:bg-gray-800 rounded" />
                            <div className="flex p-2 lg:pt-0 gap-2 lg:flex-col">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="lg:w-[95px] lg:h-[110px] w-[70px] h-[70px] bg-gray-200 dark:bg-gray-800 rounded"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Info skeleton */}
                    <div className="lg:col-span-2 col-span-2 p-3 space-y-3">
                        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded" />
                        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !bundle) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
                <h1 className="text-xl text-red-600">
                    {error || "Bundle not found"}
                </h1>
                <p className="text-xs text-gray-400">Slug: {id}</p>
                <button
                    onClick={() => navigate("/")}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    // ---------------------------------------------------------
    // Render
    // ---------------------------------------------------------
    return (
        <div className="text-black dark:text-[#E2E5E9] my-2 w-full">
            <div className="grid lg:grid-cols-5 md:grid-cols-2 grid-cols-1 w-full">

                {/* ================= IMAGES ================= */}
                <div className="lg:col-span-3 col-span-5 flex flex-col">
                    <div className="flex lg:flex-row-reverse md:flex-row-reverse flex-col justify-center">
                        <div className="lg:w-[770px] lg:h-[770px] md:w-[700px] md:h-[700px] w-full h-[500px] flex items-center justify-center">
                            <img
                                src={previewImage}
                                alt={bundle.name}
                                onClick={() => setShowImageModal(true)}
                                className="w-full h-full object-cover border rounded-[4px] border-[#E1E4E7] dark:border-[#202020] cursor-zoom-in"
                            />
                        </div>

                        <div className="flex p-2 lg:pt-0 gap-2 lg:flex-col md:flex-col lg:justify-start lg:items-start md:justify-start md:items-start items-center justify-center">
                            {galleryImages.slice(0, 4).map((img, i) => (
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

                {/* ================= INFO ================= */}
                <div className="lg:col-span-2 col-span-2 p-3 font-poppins">
                    <h1 className="text-3xl font-normal lg:text-start md:text-start text-center">
                        {bundle.name}
                    </h1>

                    <div className="py-1 flex items-center gap-2 flex-wrap">
                        <span className="text-xs border border-purple-300 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-sm">
                            Bundle Offer
                        </span>
                        {pricing.discountPercent > 0 && (
                            <span className="text-xs border border-red-300 px-2 py-0.5 bg-red-100 text-red-700 rounded-sm">
                                {pricing.discountPercent}% OFF
                            </span>
                        )}
                    </div>

                    {/* ✅ Category Breadcrumb */}
                    {/* {(bundle.productType || bundle.category || bundle.subCategory) && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 py-1">
                            {bundle.productType && (
                                <span>{bundle.productType.name}</span>
                            )}
                            {bundle.category && (
                                <>
                                    <span>/</span>
                                    <span>{bundle.category.name}</span>
                                </>
                            )}
                            {bundle.subCategory && (
                                <>
                                    <span>/</span>
                                    <span>{bundle.subCategory.name}</span>
                                </>
                            )}
                        </div>
                    )} */}

                    {/* Stock */}
                    <div className="py-1">
                        {totalStock > 0 ? (
                            <span className="text-sm border border-green-300 px-1 py-0.5 bg-green-200 text-green-800 rounded-sm">
                                In Stock{" "}
                                <span className="text-zinc-500">
                                    {totalStock}
                                </span>
                            </span>
                        ) : (
                            <span className="text-sm border border-red-300 px-1 py-0.5 bg-red-200 text-red-600 rounded-sm">
                                {allVariantsSelected
                                    ? "Stock Out"
                                    : "Select All Variants"}
                            </span>
                        )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 py-3">
                        <p className="font-poppins text-gray-600 text-lg line-through decoration-gray-600 decoration-solid decoration-3">
                            {pricing.originalValue}
                        </p>
                        <p className="font-poppins text-2xl font-bold">
                            {pricing.sellingPrice}
                            <span className="font-semibold"> TK</span>
                        </p>
                    </div>

                    {pricing.savings > 0 && (
                        <p className="text-sm text-green-600 -mt-2 pb-2">
                            You save ৳{pricing.savings}
                        </p>
                    )}

                    {/* ============================================ */}
                    {/* ✅ PRODUCTS WITH VARIANTS — ProductDetails style */}
                    {/* ============================================ */}
                    <div className="space-y-5 border-t border-gray-200 dark:border-gray-700 pt-3">
                        {bundle.products.map((bundleItem, bIdx) => {
                            const state = productStates[bIdx];
                            if (!state || !bundleItem.product) return null;

                            const product = bundleItem.product;

                            // Per-product preview images & preview
                            const productPreviewImage =
                                state.previewImages?.[0] ||
                                product?.thumbnail ||
                                "";

                            return (
                                <div
                                    key={bundleItem.productId || bIdx}
                                    className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"
                                >
                                    {/* ========== Product Header ========== */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-bold">
                                            {bIdx + 1}
                                        </span>
                                        <h2 className="text-lg font-medium">
                                            {bundleItem.customName || bundleItem.displayName || product.name}
                                        </h2>
                                        {bundleItem.quantity > 1 && (
                                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                                × {bundleItem.quantity}
                                            </span>
                                        )}
                                    </div>

                                    {/* ========== Size Chart ========== */}
                                    {product.sizeChart ? (
                                        <div className="flex flex-col gap-1 py-2">
                                            <h3 className="text-[14px] font-medium">
                                                Size Chart
                                            </h3>
                                            <SizeChartDisplay
                                                chart={product.sizeChart}
                                            />
                                        </div>
                                    ) : null}

                                    {/* ========== COLOR ========== */}
                                    {state.hasColor && (
                                        <div className="flex flex-col gap-1 py-2">
                                            <h3 className="text-[15px]">
                                                Select Color
                                            </h3>
                                            <div className="flex gap-1.5 text-sm flex-wrap">
                                                {product.variants?.map(
                                                    (variant, index) => {
                                                        // const color = getColor(
                                                        //     variant.colorId
                                                        // );
                                                        const color = getColor(variant.colorId, product);
                                                        const isSelected =
                                                            String(
                                                                state.selectedColor
                                                            ) ===
                                                            String(
                                                                variant.colorId
                                                            );

                                                        return (
                                                            <button
                                                                key={
                                                                    variant.colorId ||
                                                                    index
                                                                }
                                                                type="button"
                                                                onClick={() =>
                                                                    handleColorChange(
                                                                        bundleItem.productId,
                                                                        variant.colorId
                                                                    )
                                                                }
                                                                className={`px-3 py-1 h-10 border ${isSelected
                                                                    ? "bg-black text-white"
                                                                    : "bg-white dark:bg-[#252728]"
                                                                    }`}
                                                            >
                                                                {color?.name ||
                                                                    "Unknown Color"}
                                                            </button>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* ========== SIZE ========== */}
                                    {state.hasSize &&
                                        (!state.hasColor ||
                                            state.selectedColor) &&
                                        state.selectedVariant && (
                                            <div className="flex flex-col gap-1 py-2">
                                                <h3 className="text-[15px]">
                                                    Select Size
                                                </h3>
                                                <div className="flex gap-1.5 text-sm flex-wrap">
                                                    {state.selectedVariant?.sizes?.map(
                                                        (size, idx) => {
                                                            if (
                                                                !size.sizeId
                                                            )
                                                                return null;

                                                            // const sizeInfo =
                                                            //     getSize(
                                                            //         size.sizeId
                                                            //     );
                                                            const sizeInfo = getSize(size.sizeId, product);

                                                            const isSelected =
                                                                String(
                                                                    state.selectedSize
                                                                ) ===
                                                                String(
                                                                    size.sizeId
                                                                );

                                                            const stock =
                                                                Number(
                                                                    size.stock
                                                                ) || 0;

                                                            return (
                                                                <button
                                                                    key={
                                                                        size.sizeId ||
                                                                        idx
                                                                    }
                                                                    type="button"
                                                                    disabled={
                                                                        stock ===
                                                                        0
                                                                    }
                                                                    onClick={() =>
                                                                        handleSizeChange(
                                                                            bundleItem.productId,
                                                                            size.sizeId
                                                                        )
                                                                    }
                                                                    className={`px-3 py-1 w-10 h-10 border flex justify-center items-center ${stock ===
                                                                        0
                                                                        ? "opacity-40 cursor-not-allowed line-through"
                                                                        : isSelected
                                                                            ? "bg-black text-white border-black"
                                                                            : "hover:bg-black hover:text-white cursor-pointer"
                                                                        }`}
                                                                >
                                                                    {sizeInfo?.name ||
                                                                        "-"}
                                                                </button>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    {/* ========== Selected Preview (per product) ========== */}
                                    {state.isSelected &&
                                        state.currentPrice > 0 && (
                                            <div className="flex justify-start py-3">
                                                <SelectedPreview
                                                    image={
                                                        productPreviewImage
                                                    }
                                                    // colorName={
                                                    //     getColor(
                                                    //         state.selectedColor
                                                    //     )?.name || ""
                                                    // }
                                                    // sizeName={
                                                    //     getSize(
                                                    //         state.selectedSize
                                                    //     )?.name || ""
                                                    // }
                                                    colorName={
                                                        getColor(state.selectedColor, product)?.name || ""
                                                    }
                                                    sizeName={
                                                        getSize(state.selectedSize, product)?.name || ""
                                                    }

                                                    sellingPrice={
                                                        state.currentPrice
                                                    }
                                                    mrp={state.currentMrp}
                                                    currency="TK"
                                                    onImageClick={() =>
                                                        setShowImageModal(
                                                            true
                                                        )
                                                    }
                                                />
                                            </div>
                                        )}

                                    {/* ========== Per-product stock warning ========== */}
                                    {state.isSelected &&
                                        state.currentStock === 0 && (
                                            <p className="text-[12px] text-red-600 mt-1">
                                                Selected variant is out of
                                                stock
                                            </p>
                                        )}
                                </div>
                            );
                        })}
                    </div>

                    {/* ================= QUANTITY ================= */}
                    <div className="flex flex-col gap-1 py-2">
                        <h1 className="text-[15px]">Quantity:</h1>
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
                                        totalStock > 0 &&
                                        number > totalStock
                                    ) {
                                        number = totalStock;
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
                    </div>

                    {/* ================= BUTTONS ================= */}
                    <div className="flex w-full lg:max-w-[460px] max-w-[460px] md:max-w-[1000px] gap-[10px] py-4">
                        <button
                            onClick={handleAddToCart}
                            disabled={
                                totalStock === 0 || !allVariantsSelected
                            }
                            className="md:hidden lg:block lg:flex-1 flex-1 border bg-white py-1 hover:bg-black hover:text-white dark:bg-[#252728] dark:hover:bg-[#3B3D3E] border-[#65686c] dark:border-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add To Cart
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={
                                totalStock === 0 || !allVariantsSelected
                            }
                            className="md:w-full flex-1 border bg-white py-1 hover:bg-black hover:text-white dark:bg-[#252728] dark:hover:bg-[#3B3D3E] border-[#65686c] dark:border-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Buy Now
                        </button>
                    </div>

                    {!allVariantsSelected && (
                        <p className="text-xs text-orange-600 text-center -mt-2">
                            Please select color & size for all products
                        </p>
                    )}
                </div>

                {/* ================= DESCRIPTION ================= */}
                <div className="col-span-5 bg-white dark:bg-[#252728] px-2 my-3">
                    <h1 className="py-3 underline text-2xl">Description</h1>
                    <div className="uppercase">
                        <p className="text-[12px]">SKU: {bundle.slug}</p>
                    </div>
                    <h2 className="whitespace-pre-line py-2 font-poppins">
                        {bundle.description || "No description available."}
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

export default BundleProductDetails;