import React, { useEffect, useMemo, useState } from "react";
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    Eye,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Package,
    Star,
    Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const Products = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);

    const [productTypes, setProductTypes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);

    const [search, setSearch] = useState("");

    const [productTypeId, setProductTypeId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [subCategoryId, setSubCategoryId] = useState("");

    const [status, setStatus] = useState("active");
    const [specialFilter, setSpecialFilter] = useState("");

    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);

    // ============================================
    // FETCH PRODUCT TYPES
    // ============================================

    useEffect(() => {
        fetchProductTypes();
    }, []);

    const fetchProductTypes = async () => {
        try {
            const response = await fetch(
                `${API_URL}/product-types`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch product types"
                );
            }

            const data = await response.json();

            setProductTypes(
                Array.isArray(data)
                    ? data.filter(
                        (item) => item.isActive !== false
                    )
                    : []
            );
        } catch (error) {
            console.error(error);
            toast.error(
                "Failed to load product types"
            );
        }
    };

    // ============================================
    // FETCH CATEGORIES
    // ============================================

    useEffect(() => {
        if (!productTypeId) {
            setCategories([]);
            setCategoryId("");
            setSubCategories([]);
            setSubCategoryId("");
            return;
        }

        fetchCategories(productTypeId);
    }, [productTypeId]);

    const fetchCategories = async (
        selectedProductTypeId
    ) => {
        try {
            setFilterLoading(true);

            const response = await fetch(
                `${API_URL}/categories?productTypeId=${selectedProductTypeId}`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch categories"
                );
            }

            const data = await response.json();

            setCategories(
                Array.isArray(data)
                    ? data.filter(
                        (item) => item.isActive !== false
                    )
                    : []
            );
        } catch (error) {
            console.error(error);
            setCategories([]);
            toast.error(
                "Failed to load categories"
            );
        } finally {
            setFilterLoading(false);
        }
    };

    // ============================================
    // FETCH SUB CATEGORIES
    // ============================================

    useEffect(() => {
        if (!categoryId) {
            setSubCategories([]);
            setSubCategoryId("");
            return;
        }

        fetchSubCategories(categoryId);
    }, [categoryId]);

    const fetchSubCategories = async (
        selectedCategoryId
    ) => {
        try {
            setFilterLoading(true);

            const response = await fetch(
                `${API_URL}/sub-categories?categoryId=${selectedCategoryId}`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch sub categories"
                );
            }

            const data = await response.json();

            setSubCategories(
                Array.isArray(data)
                    ? data.filter(
                        (item) => item.isActive !== false
                    )
                    : []
            );
        } catch (error) {
            console.error(error);
            setSubCategories([]);

            toast.error(
                "Failed to load sub categories"
            );
        } finally {
            setFilterLoading(false);
        }
    };

    // ============================================
    // FETCH PRODUCTS
    // ============================================

    const fetchProducts = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            if (search.trim()) {
                params.set("search", search.trim());
            }

            if (productTypeId) {
                params.set(
                    "productTypeId",
                    productTypeId
                );
            }

            if (categoryId) {
                params.set(
                    "categoryId",
                    categoryId
                );
            }

            if (subCategoryId) {
                params.set(
                    "subCategoryId",
                    subCategoryId
                );
            }

            if (status === "active") {
                params.set("isActive", "true");
            }

            if (status === "inactive") {
                params.set("isActive", "false");
            }

            if (specialFilter === "featured") {
                params.set("isFeatured", "true");
            }

            if (specialFilter === "newArrival") {
                params.set("isNewArrival", "true");
            }

            params.set("page", page);
            params.set("limit", limit);

            const response = await fetch(
                `${API_URL}/products?${params.toString()}`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch products"
                );
            }

            const data = await response.json();

            setProducts(
                Array.isArray(data.products)
                    ? data.products
                    : []
            );

            setTotal(data.total || 0);

            setTotalPages(
                Math.max(1, data.totalPages || 1)
            );
        } catch (error) {
            console.error(error);

            toast.error(
                "Failed to load products"
            );

            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch whenever filters/page change
    useEffect(() => {
        fetchProducts();
    }, [
        page,
        productTypeId,
        categoryId,
        subCategoryId,
        status,
        specialFilter,
    ]);

    // ============================================
    // SEARCH
    // ============================================

    const handleSearchSubmit = (e) => {
        e.preventDefault();

        setPage(1);

        fetchProducts();
    };

    // ============================================
    // PRODUCT TYPE FILTER
    // ============================================

    const handleProductTypeChange = (e) => {
        setProductTypeId(e.target.value);

        setCategoryId("");
        setSubCategoryId("");

        setPage(1);
    };

    // ============================================
    // CATEGORY FILTER
    // ============================================

    const handleCategoryChange = (e) => {
        setCategoryId(e.target.value);

        setSubCategoryId("");

        setPage(1);
    };

    // ============================================
    // STATUS
    // ============================================

    const handleStatusChange = (e) => {
        setStatus(e.target.value);

        setPage(1);
    };

    // ============================================
    // SPECIAL FILTER
    // ============================================

    const handleSpecialFilterChange = (e) => {
        setSpecialFilter(e.target.value);

        setPage(1);
    };

    // ============================================
    // CLEAR FILTERS
    // ============================================

    const clearFilters = () => {
        setSearch("");
        setProductTypeId("");
        setCategoryId("");
        setSubCategoryId("");
        setStatus("active");
        setSpecialFilter("");
        setPage(1);
    };

    // ============================================
    // DELETE / DEACTIVATE
    // ============================================

    const handleDelete = async (product) => {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate "${product.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/products/${product._id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to deactivate product"
                );
            }

            toast.success(
                "Product deactivated successfully"
            );

            fetchProducts();
        } catch (error) {
            console.error(error);

            toast.error(
                error.message ||
                "Failed to deactivate product"
            );
        }
    };

    // ============================================
    // ACTIVATE
    // ============================================

    const handleActivate = async (product) => {
        try {
            const response = await fetch(
                `${API_URL}/products/${product._id}`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        isActive: true,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to activate product"
                );
            }

            toast.success(
                "Product activated successfully"
            );

            fetchProducts();
        } catch (error) {
            console.error(error);

            toast.error(
                error.message ||
                "Failed to activate product"
            );
        }
    };

    // ============================================
    // TOTAL STOCK
    // ============================================

    const getTotalStock = (product) => {
        if (!Array.isArray(product.variants)) {
            return 0;
        }

        return product.variants.reduce(
            (variantTotal, variant) => {

                if (!Array.isArray(variant.sizes)) {
                    return variantTotal;
                }

                return (
                    variantTotal +
                    variant.sizes.reduce(
                        (sizeTotal, size) =>
                            sizeTotal +
                            Number(size.stock || 0),
                        0
                    )
                );
            },
            0
        );
    };

    // ============================================
    // TOTAL VARIANTS
    // ============================================

    const getVariantCount = (product) => {
        if (!Array.isArray(product.variants)) {
            return 0;
        }

        return product.variants.reduce(
            (total, variant) =>
                total +
                (Array.isArray(variant.sizes)
                    ? variant.sizes.length
                    : 0),
            0
        );
    };

    // ============================================
    // PAGINATION RANGE
    // ============================================

    const paginationPages = useMemo(() => {
        const pages = [];

        const start = Math.max(
            1,
            page - 2
        );

        const end = Math.min(
            totalPages,
            page + 2
        );

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    }, [page, totalPages]);

    return (
        <div className="min-h-full bg-gray-50 p-4 dark:bg-gray-950 md:p-6">

            {/* ========================================
          HEADER
      ========================================= */}

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Products
                    </h1>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage all products in your store
                    </p>
                </div>

                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={fetchProducts}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        <RefreshCw
                            size={16}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/admin/products/create"
                            )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                    >
                        <Plus size={17} />

                        Add Product
                    </button>

                </div>

            </div>


            {/* ========================================
          FILTERS
      ========================================= */}

            <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">

                {/* SEARCH */}

                <form
                    onSubmit={handleSearchSubmit}
                    className="mb-4 flex gap-2"
                >

                    <div className="relative flex-1">

                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="search"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search product..."
                            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-gray-500 dark:focus:ring-gray-800"
                        />

                    </div>

                    <button
                        type="submit"
                        className="rounded-lg bg-gray-900 px-5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                    >
                        Search
                    </button>

                </form>


                {/* FILTER ROW */}

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">

                    {/* PRODUCT TYPE */}

                    <select
                        value={productTypeId}
                        onChange={
                            handleProductTypeChange
                        }
                        className={selectClass}
                    >
                        <option value="">
                            All Product Types
                        </option>

                        {productTypes.map(
                            (item) => (
                                <option
                                    key={item._id}
                                    value={item._id}
                                >
                                    {item.name}
                                </option>
                            )
                        )}
                    </select>


                    {/* CATEGORY */}

                    <select
                        value={categoryId}
                        onChange={
                            handleCategoryChange
                        }
                        disabled={!productTypeId}
                        className={selectClass}
                    >
                        <option value="">
                            {productTypeId
                                ? "All Categories"
                                : "Select Product Type"}
                        </option>

                        {categories.map(
                            (item) => (
                                <option
                                    key={item._id}
                                    value={item._id}
                                >
                                    {item.name}
                                </option>
                            )
                        )}
                    </select>


                    {/* SUB CATEGORY */}

                    <select
                        value={subCategoryId}
                        onChange={(e) => {
                            setSubCategoryId(
                                e.target.value
                            );
                            setPage(1);
                        }}
                        disabled={!categoryId}
                        className={selectClass}
                    >
                        <option value="">
                            {categoryId
                                ? "All Sub Categories"
                                : "Select Category"}
                        </option>

                        {subCategories.map(
                            (item) => (
                                <option
                                    key={item._id}
                                    value={item._id}
                                >
                                    {item.name}
                                </option>
                            )
                        )}
                    </select>


                    {/* STATUS */}

                    <select
                        value={status}
                        onChange={
                            handleStatusChange
                        }
                        className={selectClass}
                    >
                        <option value="active">
                            Active
                        </option>

                        <option value="inactive">
                            Inactive
                        </option>

                        <option value="all">
                            All Status
                        </option>
                    </select>


                    {/* SPECIAL */}

                    <select
                        value={specialFilter}
                        onChange={
                            handleSpecialFilterChange
                        }
                        className={selectClass}
                    >
                        <option value="">
                            All Products
                        </option>

                        <option value="featured">
                            Featured
                        </option>

                        <option value="newArrival">
                            New Arrival
                        </option>
                    </select>

                </div>


                {/* CLEAR */}

                {(search ||
                    productTypeId ||
                    categoryId ||
                    subCategoryId ||
                    status !== "active" ||
                    specialFilter) && (

                        <div className="mt-3 flex justify-end">

                            <button
                                type="button"
                                onClick={
                                    clearFilters
                                }
                                className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            >
                                Clear Filters
                            </button>

                        </div>

                    )}

            </div>


            {/* ========================================
          SUMMARY
      ========================================= */}

            <div className="mb-4 flex items-center justify-between">

                <p className="text-sm text-gray-500 dark:text-gray-400">

                    {loading
                        ? "Loading products..."
                        : `${total} product${total !== 1
                            ? "s"
                            : ""
                        } found`}

                </p>

                {filterLoading && (
                    <p className="text-xs text-gray-400">
                        Loading filters...
                    </p>
                )}

            </div>


            {/* ========================================
          TABLE
      ========================================= */}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[1050px] text-left">

                        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">

                            <tr>

                                <th className={thClass}>
                                    Product
                                </th>

                                <th className={thClass}>
                                    Category
                                </th>

                                <th className={thClass}>
                                    Price
                                </th>

                                <th className={thClass}>
                                    Variants
                                </th>

                                <th className={thClass}>
                                    Stock
                                </th>

                                <th className={thClass}>
                                    Status
                                </th>

                                <th className={thClass}>
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">

                            {loading ? (

                                Array.from({
                                    length: 6,
                                }).map((_, index) => (

                                    <ProductSkeleton
                                        key={index}
                                    />

                                ))

                            ) : products.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="px-6 py-16 text-center"
                                    >

                                        <Package
                                            size={35}
                                            className="mx-auto mb-3 text-gray-300 dark:text-gray-700"
                                        />

                                        <p className="font-medium text-gray-700 dark:text-gray-300">
                                            No products found
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Try changing your filters or add a new product.
                                        </p>

                                    </td>

                                </tr>

                            ) : (

                                products.map(
                                    (product) => (

                                        <ProductRow
                                            key={product._id}
                                            product={product}
                                            getTotalStock={
                                                getTotalStock
                                            }
                                            getVariantCount={
                                                getVariantCount
                                            }
                                            onView={() =>
                                                window.open(`/product/${product.slug}`, "_blank", "noopener,noreferrer")
                                            }
                                            onEdit={() =>
                                                navigate(
                                                    `/admin/products/${product._id}/edit`
                                                )
                                            }
                                            onDelete={() =>
                                                handleDelete(
                                                    product
                                                )
                                            }
                                            onActivate={() =>
                                                handleActivate(
                                                    product
                                                )
                                            }
                                        />

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>


                {/* =====================================
            PAGINATION
        ====================================== */}

                {!loading &&
                    products.length > 0 && (
                        <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">

                            <p className="text-sm text-gray-500 dark:text-gray-400">

                                Page {page} of{" "}
                                {totalPages}

                            </p>


                            <div className="flex items-center gap-1">

                                <button
                                    type="button"
                                    disabled={page <= 1}
                                    onClick={() =>
                                        setPage(
                                            (prev) =>
                                                Math.max(
                                                    1,
                                                    prev - 1
                                                )
                                        )
                                    }
                                    className={paginationButton}
                                >
                                    <ChevronLeft
                                        size={16}
                                    />
                                </button>


                                {paginationPages.map(
                                    (pageNumber) => (

                                        <button
                                            key={
                                                pageNumber
                                            }
                                            type="button"
                                            onClick={() =>
                                                setPage(
                                                    pageNumber
                                                )
                                            }
                                            className={
                                                pageNumber === page
                                                    ? activePaginationButton
                                                    : paginationButton
                                            }
                                        >
                                            {pageNumber}
                                        </button>

                                    )
                                )}


                                <button
                                    type="button"
                                    disabled={
                                        page >=
                                        totalPages
                                    }
                                    onClick={() =>
                                        setPage(
                                            (prev) =>
                                                Math.min(
                                                    totalPages,
                                                    prev + 1
                                                )
                                        )
                                    }
                                    className={paginationButton}
                                >
                                    <ChevronRight
                                        size={16}
                                    />
                                </button>

                            </div>

                        </div>
                    )}

            </div>

        </div>
    );
};


// =====================================================
// PRODUCT ROW
// =====================================================

const ProductRow = ({
    product,
    getTotalStock,
    getVariantCount,
    onView,
    onEdit,
    onDelete,
    onActivate,
}) => {

    const stock = getTotalStock(product);

    const variantCount =
        getVariantCount(product);

    const isInactive =
        product.isActive === false;

    return (
        <tr className="transition hover:bg-gray-50 dark:hover:bg-gray-800/40">

            {/* PRODUCT */}

            <td className="px-4 py-4">

                <div className="flex items-center gap-3">

                    <div className="h-14 w-11 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">

                        {product.thumbnail ? (

                            <img
                                src={product.thumbnail}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                loading="lazy"
                            />

                        ) : (

                            <div className="flex h-full items-center justify-center">
                                <Package
                                    size={18}
                                    className="text-gray-400"
                                />
                            </div>

                        )}

                    </div>


                    <div className="min-w-0">

                        <p className="max-w-[260px] truncate text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                        </p>

                        {product.brand && (
                            <p className="mt-0.5 text-xs text-gray-500">
                                {product.brand}
                            </p>
                        )}

                        <div className="mt-1 flex items-center gap-2">

                            {product.isFeatured && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-amber-600">
                                    <Star
                                        size={11}
                                        fill="currentColor"
                                    />
                                    Featured
                                </span>
                            )}

                            {product.isNewArrival && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-blue-600">
                                    <Sparkles size={11} />
                                    New
                                </span>
                            )}

                        </div>

                    </div>

                </div>

            </td>


            {/* CATEGORY */}

            <td className="px-4 py-4">

                <div className="text-xs text-gray-500 dark:text-gray-400">

                    <div>
                        Type ID:{" "}
                        <span className="text-gray-700 dark:text-gray-300">
                            {shortId(
                                product.productTypeId
                            )}
                        </span>
                    </div>

                    <div className="mt-1">
                        Category ID:{" "}
                        <span className="text-gray-700 dark:text-gray-300">
                            {shortId(
                                product.categoryId
                            )}
                        </span>
                    </div>

                    <div className="mt-1">
                        Sub:{" "}
                        <span className="text-gray-700 dark:text-gray-300">
                            {shortId(
                                product.subCategoryId
                            )}
                        </span>
                    </div>

                </div>

            </td>


            {/* PRICE */}

            <td className="px-4 py-4">

                <div>

                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        ৳
                        {Number(
                            product.price
                                ?.sellingPrice || 0
                        ).toLocaleString()}
                    </p>

                    {product.price?.mrp && (
                        <p className="mt-0.5 text-xs text-gray-400 line-through">
                            ৳
                            {Number(
                                product.price.mrp
                            ).toLocaleString()}
                        </p>
                    )}

                    {product.price
                        ?.discountPercent > 0 && (
                            <span className="mt-1 inline-block text-[11px] font-medium text-green-600">
                                {product.price.discountPercent}%
                                OFF
                            </span>
                        )}

                </div>

            </td>


            {/* VARIANTS */}

            <td className="px-4 py-4">

                <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {variantCount} SKU
                    {variantCount !== 1
                        ? "s"
                        : ""}
                </span>

            </td>


            {/* STOCK */}

            <td className="px-4 py-4">

                <div>

                    <p
                        className={`text-sm font-medium ${stock === 0
                            ? "text-red-600"
                            : stock <= 10
                                ? "text-orange-600"
                                : "text-gray-900 dark:text-white"
                            }`}
                    >
                        {stock}
                    </p>

                    <p className="text-xs text-gray-400">
                        total units
                    </p>

                </div>

            </td>


            {/* STATUS */}

            <td className="px-4 py-4">

                <div className="flex flex-col items-start gap-1.5">

                    <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${isInactive
                            ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            : "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                            }`}
                    >
                        {isInactive
                            ? "Inactive"
                            : "Active"}
                    </span>

                    {stock === 0 && (
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">
                            Out of stock
                        </span>
                    )}

                </div>

            </td>


            {/* ACTIONS */}

            <td className="px-4 py-4">

                <div className="flex items-center gap-1">

                    <button
                        type="button"
                        onClick={onView}
                        title="View"
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                        <Eye size={17} />
                    </button>


                    <button
                        type="button"
                        onClick={onEdit}
                        title="Edit"
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                        <Pencil size={17} />
                    </button>


                    {isInactive ? (

                        <button
                            type="button"
                            onClick={onActivate}
                            title="Activate"
                            className="rounded-lg p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                        >
                            <RefreshCw
                                size={17}
                            />
                        </button>

                    ) : (

                        <button
                            type="button"
                            onClick={onDelete}
                            title="Deactivate"
                            className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                        >
                            <Trash2 size={17} />
                        </button>

                    )}

                </div>

            </td>

        </tr>
    );
};


// =====================================================
// PRODUCT SKELETON
// =====================================================

const ProductSkeleton = () => {
    return (
        <tr>

            <td className="px-4 py-4">
                <div className="flex gap-3">

                    <div className="h-14 w-11 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />

                    <div className="space-y-2">
                        <div className="h-3 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                        <div className="h-2.5 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                    </div>

                </div>
            </td>

            <td className="px-4 py-4">
                <div className="space-y-2">
                    <div className="h-2.5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-2.5 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                </div>
            </td>

            <td className="px-4 py-4">
                <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </td>

            <td className="px-4 py-4">
                <div className="h-6 w-14 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </td>

            <td className="px-4 py-4">
                <div className="h-3 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </td>

            <td className="px-4 py-4">
                <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
            </td>

            <td className="px-4 py-4">
                <div className="h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </td>

        </tr>
    );
};


// =====================================================
// HELPERS
// =====================================================

const shortId = (id) => {
    if (!id) return "-";

    const value = id.toString();

    return `${value.slice(0, 6)}...`;
};


// =====================================================
// CLASSES
// =====================================================

const selectClass =
    "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-gray-500 dark:focus:ring-gray-800";

const thClass =
    "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400";

const paginationButton =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-gray-200 px-2 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800";

const activePaginationButton =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-gray-900 px-2 text-sm font-medium text-white dark:bg-white dark:text-gray-900";

export default Products;