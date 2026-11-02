import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { toast } from "react-hot-toast";
import {
    ArrowLeft,
    ImageIcon,
    Loader2,
    Package,
    Plus,
    Save,
    Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import MediaLibrary from "../../Component/Cloudinary/MediaLibrary";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const initialForm = {
    name: "",
    description: "",
    thumbnail: "",
    images: [],
    sellingPrice: "",
    isActive: true,
};

const BundleProductEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // bundle _id

    const [formData, setFormData] = useState(initialForm);
    const [products, setProducts] = useState([]);
    const [productSearch, setProductSearch] = useState("");
    const [productsLoading, setProductsLoading] = useState(false);
    const [bundleItems, setBundleItems] = useState([]);
    const [saving, setSaving] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    // ✅ Category state
    const [productTypes, setProductTypes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);

    const [productTypeId, setProductTypeId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [subCategoryId, setSubCategoryId] = useState("");

    // ============================================================
    // 1. FETCH BUNDLE (for edit)
    // ============================================================
    useEffect(() => {
        if (!id) return;
        fetchBundle();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchBundle = async () => {
        try {
            setInitialLoading(true);

            const res = await fetch(`${API_URL}/bundle-products/${id}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data?.message || "Failed to fetch bundle");

            const bundle = data?.bundle;
            if (!bundle) throw new Error("Bundle not found");

            // Populate form
            setFormData({
                name: bundle.name || "",
                description: bundle.description || "",
                thumbnail: bundle.thumbnail || "",
                images: Array.isArray(bundle.images) ? bundle.images : [],
                sellingPrice: bundle?.price?.sellingPrice || "",
                isActive: bundle?.isActive !== false,
            });

            // Populate bundle items
            const items = (bundle.products || []).map((item, idx) => {
                const product = item.product || {};

                return {
                    id: `${item.productId}-${Date.now()}-${idx}`,
                    productId: String(item.productId),
                    productName: product?.name || "Product unavailable",
                    customName: item.customName || "",
                    thumbnail: product?.thumbnail || product?.images?.[0] || "",
                    sellingPrice:
                        Number(product?.price?.sellingPrice) || 0,
                    availableStock: Number(product?.totalStock) || 0,
                    quantity: Number(item.quantity) || 1,
                };
            });

            setBundleItems(items);

            // ✅ Set category
            setProductTypeId(bundle.productTypeId || "");
            setCategoryId(bundle.categoryId || "");
            setSubCategoryId(bundle.subCategoryId || "");
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to load bundle");
            navigate("/admin/bundle-products");
        } finally {
            setInitialLoading(false);
        }
    };

    // ============================================================
    // 2. FETCH PRODUCTS (for dropdown)
    // ============================================================
    useEffect(() => {
        const timer = setTimeout(() => fetchProducts(), 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productSearch]);

    const fetchProducts = async () => {
        try {
            setProductsLoading(true);

            const params = new URLSearchParams({
                isActive: "true",
                page: "1",
                limit: "50",
            });

            if (productSearch.trim()) {
                params.set("search", productSearch.trim());
            }

            const res = await fetch(`${API_URL}/products?${params}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.message || "Failed to fetch products");
            }

            setProducts(Array.isArray(data?.products) ? data.products : []);
        } catch (error) {
            console.error(error);
            setProducts([]);
            toast.error(error.message || "Failed to load products");
        } finally {
            setProductsLoading(false);
        }
    };

    // ============================================================
    // 3. CATEGORY FETCHES
    // ============================================================
    useEffect(() => {
        fetchProductTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchProductTypes = async () => {
        try {
            const res = await fetch(`${API_URL}/product-types`);
            const data = await res.json();
            setProductTypes(
                Array.isArray(data)
                    ? data.filter((t) => t.isActive !== false)
                    : []
            );
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!productTypeId) {
            setCategories([]);
            return;
        }
        fetchCategories(productTypeId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productTypeId]);

    const fetchCategories = async (ptId) => {
        try {
            const res = await fetch(
                `${API_URL}/categories?productTypeId=${ptId}`
            );
            const data = await res.json();
            setCategories(
                Array.isArray(data)
                    ? data.filter((c) => c.isActive !== false)
                    : []
            );
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!categoryId) {
            setSubCategories([]);
            return;
        }
        fetchSubCategories(categoryId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryId]);

    const fetchSubCategories = async (catId) => {
        try {
            const res = await fetch(
                `${API_URL}/sub-categories?categoryId=${catId}`
            );
            const data = await res.json();
            setSubCategories(
                Array.isArray(data)
                    ? data.filter((s) => s.isActive !== false)
                    : []
            );
        } catch (err) {
            console.error(err);
        }
    };

    // ============================================================
    // 4. PRODUCT OPTIONS
    // ============================================================
    const productOptions = useMemo(() => {
        return products
            .filter(
                (product) =>
                    !bundleItems.some(
                        (item) => item.productId === String(product._id)
                    )
            )
            .map((product) => ({
                value: String(product._id),
                label: product.name,
                product,
            }));
    }, [products, bundleItems]);

    const getProductPrice = (product) => {
        const value = Number(product?.price?.sellingPrice || 0);
        return Number.isFinite(value) ? value : 0;
    };

    const getProductStock = (product) => {
        const value = Number(product?.totalStock || 0);
        return Number.isFinite(value) ? value : 0;
    };

    // ============================================================
    // 5. ADD PRODUCT
    // ============================================================
    const addProduct = (product) => {
        const stock = getProductStock(product);
        if (stock <= 0) {
            toast.error(`${product.name} is out of stock.`);
            return;
        }

        setBundleItems((prev) => [
            ...prev,
            {
                id: `${product._id}-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 7)}`,
                productId: String(product._id),
                productName: product.name,
                customName: "",
                thumbnail: product.thumbnail || product.images?.[0] || "",
                sellingPrice: getProductPrice(product),
                availableStock: stock,
                quantity: 1,
            },
        ]);
    };

    const handleProductSelect = (option) => {
        if (!option?.product) return;
        addProduct(option.product);
    };

    const handleQuantityChange = (id, value) => {
        let quantity = Number(value);
        if (!Number.isFinite(quantity) || quantity < 1) quantity = 1;

        setBundleItems((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;
                return {
                    ...item,
                    quantity: Math.min(quantity, item.availableStock),
                };
            })
        );
    };

    const handleCustomNameChange = (id, value) => {
        setBundleItems((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;
                return { ...item, customName: value };
            })
        );
    };

    const removeItem = (id) => {
        setBundleItems((prev) => prev.filter((item) => item.id !== id));
    };

    // ============================================================
    // 6. PRICING
    // ============================================================
    const originalPrice = useMemo(() => {
        return bundleItems.reduce((total, item) => {
            return (
                total +
                Number(item.sellingPrice || 0) *
                Number(item.quantity || 0)
            );
        }, 0);
    }, [bundleItems]);

    const savingAmount = Math.max(
        0,
        originalPrice - Number(formData.sellingPrice || 0)
    );

    const discountPercent =
        originalPrice > 0 &&
            Number(formData.sellingPrice || 0) < originalPrice
            ? Math.round((savingAmount / originalPrice) * 100)
            : 0;

    const totalStock = useMemo(() => {
        if (!bundleItems.length) return 0;
        return Math.min(
            ...bundleItems.map((item) =>
                Math.floor(
                    Number(item.availableStock || 0) /
                    Number(item.quantity || 1)
                )
            )
        );
    }, [bundleItems]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // ============================================================
    // 7. VALIDATE
    // ============================================================
    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error("Bundle name is required.");
            return false;
        }
        if (!formData.thumbnail) {
            toast.error("Bundle thumbnail is required.");
            return false;
        }
        if (!bundleItems.length) {
            toast.error("Add at least one product to the bundle.");
            return false;
        }
        if (originalPrice <= 0) {
            toast.error("Selected products must have valid prices.");
            return false;
        }
        if (!formData.sellingPrice || Number(formData.sellingPrice) <= 0) {
            toast.error("Enter a valid bundle selling price.");
            return false;
        }
        if (Number(formData.sellingPrice) >= originalPrice) {
            toast.error(
                "Bundle selling price must be lower than the total product price."
            );
            return false;
        }

        for (const item of bundleItems) {
            if (item.quantity < 1) {
                toast.error(`Invalid quantity for ${item.productName}.`);
                return false;
            }
            if (item.quantity > item.availableStock) {
                toast.error(
                    `${item.productName} does not have enough stock.`
                );
                return false;
            }
        }
        return true;
    };

    // ============================================================
    // 8. SUBMIT (PATCH)
    // ============================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setSaving(true);

            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                thumbnail: formData.thumbnail,
                images: Array.isArray(formData.images)
                    ? formData.images.filter(Boolean)
                    : [],
                products: bundleItems.map((item) => ({
                    productId: item.productId,
                    quantity: Number(item.quantity),
                    customName: item.customName?.trim() || null,
                })),
                price: {
                    mrp: originalPrice,
                    sellingPrice: Number(formData.sellingPrice),
                },
                isActive: Boolean(formData.isActive),

                // ✅ Category
                productTypeId: productTypeId || null,
                categoryId: categoryId || null,
                subCategoryId: subCategoryId || null,
            };

            const res = await fetch(`${API_URL}/bundle-products/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Failed to update bundle");

            toast.success(data?.message || "Bundle updated successfully.");
            navigate("/admin/bundle-products");
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to update bundle.");
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // 9. STYLES
    // ============================================================
    const selectClassNames = {
        control: () =>
            "min-h-[46px] bg-white dark:bg-primary-dark border border-gray-300 dark:border-gray-600 shadow-none",
        menu: () =>
            "z-50 bg-white dark:bg-primary-dark border border-gray-200 dark:border-gray-600",
        menuList: () => "bg-white dark:bg-primary-dark",
        option: (state) =>
            `${state.isSelected
                ? "bg-gray-900 text-white"
                : state.isFocused
                    ? "bg-gray-100 dark:bg-gray-700"
                    : "bg-white dark:bg-primary-dark"
            } text-sm`,
        input: () => "text-gray-900 dark:text-white",
        placeholder: () => "text-gray-500 dark:text-gray-400",
        singleValue: () => "text-gray-900 dark:text-white",
    };

    // ============================================================
    // 10. GALLERY DRAG
    // ============================================================
    const handleGalleryDragStart = (index) => setDraggedIndex(index);

    const handleGalleryDragOver = (e, index) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleGalleryDrop = (e, dropIndex) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }
        setFormData((prev) => {
            const images = [...prev.images];
            const [moved] = images.splice(draggedIndex, 1);
            images.splice(dropIndex, 0, moved);
            return { ...prev, images };
        });
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    // ============================================================
    // 11. LOADING
    // ============================================================
    if (initialLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 dark:bg-primary-dark md:p-6 flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-500">
                    <Loader2 size={20} className="animate-spin" />
                    Loading bundle...
                </div>
            </div>
        );
    }

    // ============================================================
    // 12. RENDER
    // ============================================================
    return (
        <div className="min-h-screen bg-gray-50 p-4 dark:bg-primary-dark md:p-6">
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() => navigate("/admin/bundle-products")}
                    className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                    <ArrowLeft size={17} /> Back to Bundles
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Edit Bundle Product
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Update bundle information, products and pricing.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col-reverse gap-6 lg:flex-row">
                    <div className="space-y-6 lg:w-8/12">
                        {/* ================= BASIC INFO ================= */}
                        <section className="rounded border border-gray-200 bg-white dark:border-white/10 dark:bg-secondary-dark">
                            <div className="border-b border-gray-200 p-5 dark:border-white/10">
                                <h2 className="font-semibold text-gray-900 dark:text-white">
                                    Basic Information
                                </h2>
                            </div>
                            <div className="grid gap-5 p-5">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Bundle Name
                                        <span className="ml-1 text-red-400">*</span>
                                    </label>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Panjabi + Pajama Combo"
                                        className="w-full rounded border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-400 dark:border-white/10 dark:bg-primary-dark dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Describe this bundle..."
                                        className="w-full resize-none rounded border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-400 dark:border-white/10 dark:bg-primary-dark dark:text-white"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* ================= CATEGORY ================= */}
                        <section className="rounded border border-gray-200 bg-white dark:border-white/10 dark:bg-secondary-dark">
                            <div className="border-b border-gray-200 p-5 dark:border-white/10">
                                <h2 className="font-semibold text-gray-900 dark:text-white">
                                    Category
                                </h2>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Optional — bundle কে category তে show করতে চাইলে সিলেক্ট করুন
                                </p>
                            </div>
                            <div className="grid gap-5 p-5 md:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Product Type
                                    </label>
                                    <select
                                        value={productTypeId}
                                        onChange={(e) => {
                                            setProductTypeId(e.target.value);
                                            setCategoryId("");
                                            setSubCategoryId("");
                                        }}
                                        className="w-full rounded border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-400 dark:border-white/10 dark:bg-primary-dark dark:text-white"
                                    >
                                        <option value="">Select Product Type</option>
                                        {productTypes.map((t) => (
                                            <option key={t._id} value={t._id}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Category
                                    </label>
                                    <select
                                        value={categoryId}
                                        onChange={(e) => {
                                            setCategoryId(e.target.value);
                                            setSubCategoryId("");
                                        }}
                                        disabled={!productTypeId}
                                        className="w-full rounded border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-400 disabled:opacity-50 dark:border-white/10 dark:bg-primary-dark dark:text-white"
                                    >
                                        <option value="">
                                            {productTypeId
                                                ? "Select Category"
                                                : "Select Product Type first"}
                                        </option>
                                        {categories.map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Sub Category
                                    </label>
                                    <select
                                        value={subCategoryId}
                                        onChange={(e) =>
                                            setSubCategoryId(e.target.value)
                                        }
                                        disabled={!categoryId}
                                        className="w-full rounded border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-400 disabled:opacity-50 dark:border-white/10 dark:bg-primary-dark dark:text-white"
                                    >
                                        <option value="">
                                            {categoryId
                                                ? "Select Sub Category"
                                                : "Select Category first"}
                                        </option>
                                        {subCategories.map((s) => (
                                            <option key={s._id} value={s._id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* ================= BUNDLE ITEMS ================= */}
                        <section className="rounded border border-gray-200 bg-white dark:border-white/10 dark:bg-secondary-dark">
                            <div className="border-b border-gray-200 p-5 dark:border-white/10">
                                <div className="flex items-center gap-2">
                                    <Package size={19} className="text-gray-500" />
                                    <h2 className="font-semibold text-gray-900 dark:text-white">
                                        Bundle Items
                                    </h2>
                                </div>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Add or remove products from this bundle.
                                </p>
                            </div>
                            <div className="p-5">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Add Product
                                </label>
                                <Select
                                    className="text-sm"
                                    classNames={selectClassNames}
                                    options={productOptions}
                                    isLoading={productsLoading}
                                    isClearable
                                    placeholder="Search and select a product..."
                                    onInputChange={(value) =>
                                        setProductSearch(value)
                                    }
                                    onChange={handleProductSelect}
                                    noOptionsMessage={() =>
                                        productSearch
                                            ? "No products found"
                                            : "Type to search products"
                                    }
                                />

                                {bundleItems.length > 0 ? (
                                    <div className="mt-6 space-y-3">
                                        {bundleItems.map((item, index) => (
                                            <div
                                                key={item.id}
                                                className="rounded border border-gray-200 p-4 dark:border-white/10"
                                            >
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                                    {/* Thumbnail */}
                                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded bg-gray-100 dark:bg-[#222]">
                                                        {item.thumbnail ? (
                                                            <img
                                                                src={item.thumbnail}
                                                                alt={item.productName}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                                                No Image
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info + Custom Name */}
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                                            Original Product
                                                        </p>
                                                        <p className="font-semibold text-gray-900 dark:text-white">
                                                            {index + 1}.{" "}
                                                            {item.productName}
                                                        </p>

                                                        <div className="mt-3">
                                                            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                Display Name in Bundle{" "}
                                                                <span className="text-gray-400 font-normal">
                                                                    (optional)
                                                                </span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={item.customName || ""}
                                                                onChange={(e) =>
                                                                    handleCustomNameChange(
                                                                        item.id,
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder={
                                                                    item.productName
                                                                }
                                                                className="w-full rounded border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-gray-400 dark:border-white/10 dark:bg-[#111] dark:text-white"
                                                            />
                                                            <p className="mt-1 text-[11px] text-gray-400">
                                                                খালি রাখলে "
                                                                {item.productName}" দেখাবে
                                                            </p>
                                                        </div>

                                                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                                            <span className="rounded bg-gray-100 px-2 py-1 text-gray-600 dark:bg-white/5 dark:text-gray-400">
                                                                Price:{" "}
                                                                <strong>
                                                                    ৳
                                                                    {item.sellingPrice.toLocaleString()}
                                                                </strong>
                                                            </span>
                                                            <span className="rounded bg-green-50 px-2 py-1 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                                                                Stock:{" "}
                                                                <strong>
                                                                    {item.availableStock}
                                                                </strong>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Quantity + Remove */}
                                                    <div className="flex items-end gap-3">
                                                        <div>
                                                            <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                Quantity
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max={item.availableStock}
                                                                value={item.quantity}
                                                                onChange={(e) =>
                                                                    handleQuantityChange(
                                                                        item.id,
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-24 rounded border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400 dark:border-white/10 dark:bg-[#111] dark:text-white"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeItem(item.id)
                                                            }
                                                            className="rounded border border-red-200 p-2 text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
                                                        >
                                                            <Trash2 size={17} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-5 rounded border border-dashed border-gray-300 p-8 text-center dark:border-white/10">
                                        <Plus
                                            size={24}
                                            className="mx-auto text-gray-400"
                                        />
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            No products added yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* ================= PRICING ================= */}
                        <section className="rounded border border-gray-200 bg-white dark:border-white/10 dark:bg-secondary-dark">
                            <div className="border-b border-gray-200 p-5 dark:border-white/10">
                                <h2 className="font-semibold text-gray-900 dark:text-white">
                                    Bundle Pricing
                                </h2>
                            </div>
                            <div className="grid gap-5 p-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Products Total Price
                                    </label>
                                    <div className="rounded border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                                        ৳{originalPrice.toLocaleString()}
                                    </div>
                                    <p className="mt-1 text-xs text-gray-400">
                                        Automatically calculated from selected products.
                                    </p>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Bundle Selling Price
                                        <span className="ml-1 text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="sellingPrice"
                                        min="1"
                                        value={formData.sellingPrice}
                                        onChange={handleChange}
                                        placeholder="1799"
                                        className="w-full rounded border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-400 dark:border-white/10 dark:bg-primary-dark dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="px-5 pb-5">
                                <div className="grid gap-3 rounded bg-gray-50 p-4 sm:grid-cols-3 dark:bg-white/5">
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            You Save
                                        </p>
                                        <p className="mt-1 font-bold text-gray-900 dark:text-white">
                                            ৳{savingAmount.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Discount
                                        </p>
                                        <p className="mt-1 font-bold text-red-600">
                                            {discountPercent}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Bundle Stock
                                        </p>
                                        <p
                                            className={`mt-1 font-bold ${totalStock > 0
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                                }`}
                                        >
                                            {totalStock}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ================= ACTIVE ================= */}
                        <section className="rounded border border-gray-200 bg-white dark:border-white/10 dark:bg-secondary-dark">
                            <div className="p-5">
                                <label className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <span>
                                        <span className="block text-sm font-medium text-gray-900 dark:text-white">
                                            Active Bundle
                                        </span>
                                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                                            Make this bundle available for customers.
                                        </span>
                                    </span>
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* ================= RIGHT: IMAGES ================= */}
                    <div className="space-y-6 lg:w-4/12">
                        <div className="flex flex-col gap-3">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Main Image
                            </h3>
                            <div className="relative aspect-square w-full overflow-hidden rounded border border-dashed border-gray-400/70 bg-gray-50 dark:border-gray-500/50 dark:bg-secondary-dark">
                                {formData.thumbnail ? (
                                    <>
                                        <img
                                            src={formData.thumbnail}
                                            alt="Main"
                                            className="h-full w-full object-contain"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData((p) => ({
                                                    ...p,
                                                    thumbnail: "",
                                                }))
                                            }
                                            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </>
                                ) : (
                                    <div className="relative h-full w-full">
                                        <MediaLibrary
                                            value={[]}
                                            multiple={false}
                                            fullArea
                                            onChange={(image) =>
                                                setFormData((p) => ({
                                                    ...p,
                                                    thumbnail: image,
                                                }))
                                            }
                                        />
                                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                            <ImageIcon
                                                size={140}
                                                strokeWidth={1.5}
                                                className="text-gray-400 dark:text-gray-600"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Gallery Images
                            </h3>
                            <div className="grid grid-cols-4 gap-3">
                                {formData.images.map((image, index) => {
                                    const isDragging = draggedIndex === index;
                                    const isDragOver = dragOverIndex === index;

                                    return (
                                        <div
                                            key={`${image}-${index}`}
                                            draggable
                                            onDragStart={() =>
                                                handleGalleryDragStart(index)
                                            }
                                            onDragOver={(e) =>
                                                handleGalleryDragOver(e, index)
                                            }
                                            onDragEnd={() => {
                                                setDraggedIndex(null);
                                                setDragOverIndex(null);
                                            }}
                                            onDrop={(e) =>
                                                handleGalleryDrop(e, index)
                                            }
                                            className={`group relative aspect-square overflow-hidden rounded border border-dashed bg-gray-50 dark:bg-secondary-dark ${isDragging
                                                    ? "opacity-40"
                                                    : isDragOver
                                                        ? "scale-105 border-blue-500"
                                                        : "border-gray-400/70 dark:border-gray-500/50"
                                                }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`Gallery ${index + 1}`}
                                                className="h-full w-full object-cover pointer-events-none select-none"
                                                draggable={false}
                                            />
                                            <div className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-2 py-1 text-[11px] text-white">
                                                {index + 1}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        images: p.images.filter(
                                                            (_, i) => i !== index
                                                        ),
                                                    }))
                                                }
                                                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    );
                                })}

                                {formData.images.length < 10 && (
                                    <div className="relative aspect-square overflow-hidden rounded border border-dashed border-gray-400/70 bg-gray-50 dark:border-gray-500/50 dark:bg-secondary-dark">
                                        <MediaLibrary
                                            value={formData.images}
                                            multiple
                                            maxFiles={10}
                                            fullArea
                                            onChange={(images) =>
                                                setFormData((p) => ({
                                                    ...p,
                                                    images,
                                                }))
                                            }
                                        />
                                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                            <Plus
                                                size={32}
                                                className="text-yellow-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= STICKY FOOTER ================= */}
                <div className="sticky bottom-0 z-30 p-3 backdrop-blur-md md:p-4">
                    <div className="mx-auto flex max-w-[1600px] flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => navigate("/admin/bundle-products")}
                            className="rounded border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 rounded bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-gray-900"
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Update Bundle
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BundleProductEdit;