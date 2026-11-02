// import React, { useEffect, useMemo, useState } from "react";
// import {
//     Search,
//     Plus,
//     Pencil,
//     Trash2,
//     Eye,
//     RefreshCw,
//     ChevronLeft,
//     ChevronRight,
//     Package,
//     Tag,
//     ShoppingBag,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";

// const API_URL = import.meta.env.VITE_API_URL;

// const BundleProducts = () => {
//     const navigate = useNavigate();

//     const [bundles, setBundles] = useState([]);

//     const [search, setSearch] = useState("");
//     const [status, setStatus] = useState("active");

//     const [page, setPage] = useState(1);
//     const [limit] = useState(10);

//     const [total, setTotal] = useState(0);
//     const [totalPages, setTotalPages] = useState(1);

//     const [loading, setLoading] = useState(true);

//     // ============================================
//     // FETCH BUNDLES
//     // ============================================

//     const fetchBundles = async () => {
//         try {
//             setLoading(true);

//             const params = new URLSearchParams();

//             if (search.trim()) {
//                 params.set("search", search.trim());
//             }

//             if (status === "active") {
//                 params.set("isActive", "true");
//             }

//             if (status === "inactive") {
//                 params.set("isActive", "false");
//             }

//             params.set("page", page);
//             params.set("limit", limit);

//             const response = await fetch(
//                 `${API_URL}/bundle-products?${params.toString()}`
//             );

//             if (!response.ok) {
//                 throw new Error("Failed to fetch bundle products");
//             }

//             const data = await response.json();

//             /*
//              * Supports:
//              *
//              * {
//              *   bundles: [],
//              *   total,
//              *   totalPages
//              * }
//              *
//              * Also supports direct array response.
//              */

//             if (Array.isArray(data)) {
//                 setBundles(data);
//                 setTotal(data.length);
//                 setTotalPages(1);
//             } else {
//                 setBundles(
//                     Array.isArray(data.bundles)
//                         ? data.bundles
//                         : []
//                 );

//                 setTotal(data.total || 0);

//                 setTotalPages(
//                     Math.max(1, data.totalPages || 1)
//                 );
//             }
//         } catch (error) {
//             console.error(error);

//             toast.error(
//                 error.message ||
//                 "Failed to load bundle products"
//             );

//             setBundles([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ============================================
//     // FETCH WHEN FILTER/PAGE CHANGES
//     // ============================================

//     useEffect(() => {
//         fetchBundles();
//     }, [page, status]);

//     // ============================================
//     // SEARCH
//     // ============================================

//     const handleSearchSubmit = (e) => {
//         e.preventDefault();

//         setPage(1);
//         fetchBundles();
//     };

//     // ============================================
//     // STATUS
//     // ============================================

//     const handleStatusChange = (e) => {
//         setStatus(e.target.value);
//         setPage(1);
//     };

//     // ============================================
//     // CLEAR FILTERS
//     // ============================================

//     const clearFilters = () => {
//         setSearch("");
//         setStatus("active");
//         setPage(1);
//     };

//     // ============================================
//     // DEACTIVATE
//     // ============================================

//     const handleDelete = async (bundle) => {
//         const confirmed = window.confirm(
//             `Are you sure you want to deactivate "${bundle.name}"?`
//         );

//         if (!confirmed) {
//             return;
//         }

//         try {
//             const response = await fetch(
//                 `${API_URL}/bundle-products/${bundle._id}`,
//                 {
//                     method: "DELETE",
//                 }
//             );

//             const data = await response.json();

//             if (!response.ok) {
//                 throw new Error(
//                     data.message ||
//                     "Failed to deactivate bundle"
//                 );
//             }

//             toast.success(
//                 "Bundle deactivated successfully"
//             );

//             fetchBundles();
//         } catch (error) {
//             console.error(error);

//             toast.error(
//                 error.message ||
//                 "Failed to deactivate bundle"
//             );
//         }
//     };

//     // ============================================
//     // ACTIVATE
//     // ============================================

//     const handleActivate = async (bundle) => {
//         try {
//             const response = await fetch(
//                 `${API_URL}/bundle-products/${bundle._id}`,
//                 {
//                     method: "PATCH",

//                     headers: {
//                         "Content-Type": "application/json",
//                     },

//                     body: JSON.stringify({
//                         isActive: true,
//                     }),
//                 }
//             );

//             const data = await response.json();

//             if (!response.ok) {
//                 throw new Error(
//                     data.message ||
//                     "Failed to activate bundle"
//                 );
//             }

//             toast.success(
//                 "Bundle activated successfully"
//             );

//             fetchBundles();
//         } catch (error) {
//             console.error(error);

//             toast.error(
//                 error.message ||
//                 "Failed to activate bundle"
//             );
//         }
//     };

//     // ============================================
//     // PAGINATION
//     // ============================================

//     const paginationPages = useMemo(() => {
//         const pages = [];

//         const start = Math.max(
//             1,
//             page - 2
//         );

//         const end = Math.min(
//             totalPages,
//             page + 2
//         );

//         for (let i = start; i <= end; i++) {
//             pages.push(i);
//         }

//         return pages;
//     }, [page, totalPages]);

//     // ============================================
//     // RENDER
//     // ============================================

//     return (
//         <div className="min-h-full bg-white p-4 dark:bg-primary-dark md:p-6">

//             {/* ========================================
//                 HEADER
//             ======================================== */}

//             <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

//                 <div>
//                     <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
//                         Bundle Products
//                     </h1>

//                     <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
//                         Manage all bundle products in your store
//                     </p>
//                 </div>

//                 <div className="flex gap-2">

//                     <button
//                         type="button"
//                         onClick={fetchBundles}
//                         className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-secondary-dark dark:text-gray-300 dark:hover:bg-gray-800"
//                     >
//                         <RefreshCw
//                             size={16}
//                             className={
//                                 loading
//                                     ? "animate-spin"
//                                     : ""
//                             }
//                         />

//                         Refresh
//                     </button>

//                     <button
//                         type="button"
//                         onClick={() =>
//                             navigate(
//                                 "/admin/bundle-products/create"
//                             )
//                         }
//                         className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
//                     >
//                         <Plus size={17} />

//                         Add Bundle
//                     </button>

//                 </div>

//             </div>


//             {/* ========================================
//                 FILTERS
//             ======================================== */}

//             <div className="mb-5 rounded border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-secondary-dark">

//                 <form
//                     onSubmit={handleSearchSubmit}
//                     className="flex flex-col gap-3 sm:flex-row"
//                 >

//                     <div className="relative flex-1">

//                         <Search
//                             size={18}
//                             className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                         />

//                         <input
//                             type="search"
//                             value={search}
//                             onChange={(e) =>
//                                 setSearch(e.target.value)
//                             }
//                             placeholder="Search bundle..."
//                             className="h-10 w-full rounded-md border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 dark:border-gray-700 dark:bg-secondary-dark dark:text-white dark:focus:border-gray-500 dark:focus:ring-gray-800"
//                         />

//                     </div>

//                     <select
//                         value={status}
//                         onChange={handleStatusChange}
//                         className={selectClass}
//                     >
//                         <option value="active">
//                             Active
//                         </option>

//                         <option value="inactive">
//                             Inactive
//                         </option>

//                         <option value="all">
//                             All Status
//                         </option>
//                     </select>

//                     <button
//                         type="submit"
//                         className="h-10 rounded-md bg-gray-900 px-5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
//                     >
//                         Search
//                     </button>

//                 </form>

//                 {(search || status !== "active") && (
//                     <div className="mt-3 flex justify-end">

//                         <button
//                             type="button"
//                             onClick={clearFilters}
//                             className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
//                         >
//                             Clear Filters
//                         </button>

//                     </div>
//                 )}

//             </div>


//             {/* ========================================
//                 SUMMARY
//             ======================================== */}

//             <div className="mb-4 flex items-center justify-between">

//                 <p className="text-sm text-gray-500 dark:text-gray-400">

//                     {loading
//                         ? "Loading bundles..."
//                         : `${total} bundle${total !== 1
//                             ? "s"
//                             : ""
//                         } found`}

//                 </p>

//             </div>


//             {/* ========================================
//                 TABLE
//             ======================================== */}

//             <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-secondary-dark">

//                 <div className="overflow-x-auto">

//                     <table className="w-full min-w-[1100px] text-left">

//                         <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">

//                             <tr>

//                                 <th className={thClass}>
//                                     Bundle
//                                 </th>

//                                 <th className={thClass}>
//                                     Products
//                                 </th>

//                                 <th className={thClass}>
//                                     Value
//                                 </th>

//                                 <th className={thClass}>
//                                     Bundle Price
//                                 </th>

//                                 <th className={thClass}>
//                                     Stock
//                                 </th>

//                                 <th className={thClass}>
//                                     Status
//                                 </th>

//                                 <th className={thClass}>
//                                     Actions
//                                 </th>

//                             </tr>

//                         </thead>


//                         <tbody className="divide-y divide-gray-200 dark:divide-gray-800">

//                             {loading ? (

//                                 Array.from({
//                                     length: 6,
//                                 }).map((_, index) => (
//                                     <BundleSkeleton
//                                         key={index}
//                                     />
//                                 ))

//                             ) : bundles.length === 0 ? (

//                                 <tr>

//                                     <td
//                                         colSpan="7"
//                                         className="px-6 py-16 text-center"
//                                     >

//                                         <Package
//                                             size={35}
//                                             className="mx-auto mb-3 text-gray-300 dark:text-gray-700"
//                                         />

//                                         <p className="font-medium text-gray-700 dark:text-gray-300">
//                                             No bundle products found
//                                         </p>

//                                         <p className="mt-1 text-sm text-gray-500">
//                                             Try changing your filters or create a new bundle.
//                                         </p>

//                                     </td>

//                                 </tr>

//                             ) : (

//                                 bundles.map((bundle) => (

//                                     <BundleRow
//                                         key={bundle._id}
//                                         bundle={bundle}

//                                         onView={() =>
//                                             window.open(
//                                                 `/bundle/${bundle.slug}`, "_blank", "noopener,noreferrer"
//                                             )
//                                         }

//                                         onEdit={() =>
//                                             navigate(
//                                                 `/bundle-products/edit/${bundle.slug}`
//                                             )
//                                         }

//                                         onDelete={() =>
//                                             handleDelete(bundle)
//                                         }

//                                         onActivate={() =>
//                                             handleActivate(bundle)
//                                         }
//                                     />

//                                 ))

//                             )}

//                         </tbody>

//                     </table>

//                 </div>


//                 {/* =====================================
//                     PAGINATION
//                 ====================================== */}

//                 {!loading &&
//                     bundles.length > 0 && (
//                         <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">

//                             <p className="text-sm text-gray-500 dark:text-gray-400">
//                                 Page {page} of {totalPages}
//                             </p>

//                             <div className="flex items-center gap-1">

//                                 <button
//                                     type="button"
//                                     disabled={page <= 1}
//                                     onClick={() =>
//                                         setPage((prev) =>
//                                             Math.max(
//                                                 1,
//                                                 prev - 1
//                                             )
//                                         )
//                                     }
//                                     className={paginationButton}
//                                 >
//                                     <ChevronLeft size={16} />
//                                 </button>


//                                 {paginationPages.map(
//                                     (pageNumber) => (

//                                         <button
//                                             key={pageNumber}
//                                             type="button"
//                                             onClick={() =>
//                                                 setPage(
//                                                     pageNumber
//                                                 )
//                                             }
//                                             className={
//                                                 pageNumber === page
//                                                     ? activePaginationButton
//                                                     : paginationButton
//                                             }
//                                         >
//                                             {pageNumber}
//                                         </button>

//                                     )
//                                 )}


//                                 <button
//                                     type="button"
//                                     disabled={
//                                         page >= totalPages
//                                     }
//                                     onClick={() =>
//                                         setPage((prev) =>
//                                             Math.min(
//                                                 totalPages,
//                                                 prev + 1
//                                             )
//                                         )
//                                     }
//                                     className={paginationButton}
//                                 >
//                                     <ChevronRight size={16} />
//                                 </button>

//                             </div>

//                         </div>
//                     )}

//             </div>

//         </div>
//     );
// };


// // =====================================================
// // BUNDLE ROW
// // =====================================================

// const BundleRow = ({
//     bundle,
//     onView,
//     onEdit,
//     onDelete,
//     onActivate,
// }) => {

//     const isInactive =
//         bundle.isActive === false;

//     const pricing = getBundlePricing(bundle);

//     const stock =
//         Number(bundle.totalStock || 0);

//     const products =
//         Array.isArray(bundle.products)
//             ? bundle.products
//             : [];

//     return (
//         <tr className="transition hover:bg-gray-50 dark:hover:bg-gray-800/40">

//             {/* =====================================
//                 BUNDLE
//             ===================================== */}

//             <td className="px-4 py-4">

//                 <div className="flex items-center gap-3">

//                     <div className="h-14 w-11 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">

//                         {bundle.thumbnail ? (

//                             <img
//                                 src={bundle.thumbnail}
//                                 alt={bundle.name}
//                                 className="h-full w-full object-cover"
//                                 loading="lazy"
//                             />

//                         ) : (

//                             <div className="flex h-full items-center justify-center">
//                                 <Package
//                                     size={18}
//                                     className="text-gray-400"
//                                 />
//                             </div>

//                         )}

//                     </div>


//                     <div className="min-w-0">

//                         <p className="max-w-[240px] truncate text-sm font-medium text-gray-900 dark:text-white">
//                             {bundle.name}
//                         </p>

//                         <p className="mt-0.5 text-xs text-gray-500">
//                             /{bundle.slug}
//                         </p>

//                         <p className="mt-1 text-[11px] text-gray-400">
//                             {products.length} product
//                             {products.length !== 1
//                                 ? "s"
//                                 : ""}
//                         </p>

//                     </div>

//                 </div>

//             </td>


//             {/* =====================================
//                 PRODUCTS
//             ===================================== */}

//             <td className="px-4 py-4">

//                 <div className="max-w-[260px] space-y-1">

//                     {products
//                         .slice(0, 3)
//                         .map((item, index) => {

//                             const product =
//                                 item.product;

//                             return (
//                                 <div
//                                     key={
//                                         item.productId ||
//                                         index
//                                     }
//                                     className="flex items-center gap-2"
//                                 >

//                                     {product?.thumbnail ? (
//                                         <img
//                                             src={
//                                                 product.thumbnail
//                                             }
//                                             alt={
//                                                 product.name ||
//                                                 "Product"
//                                             }
//                                             className="h-7 w-6 shrink-0 rounded object-cover"
//                                         />
//                                     ) : (
//                                         <div className="flex h-7 w-6 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
//                                             <ShoppingBag
//                                                 size={12}
//                                                 className="text-gray-400"
//                                             />
//                                         </div>
//                                     )}

//                                     <p className="min-w-0 truncate text-xs text-gray-600 dark:text-gray-300">
//                                         {product?.name ||
//                                             "Product unavailable"}

//                                         <span className="ml-1 text-gray-400">
//                                             × {item.quantity}
//                                         </span>
//                                     </p>

//                                 </div>
//                             );
//                         })}

//                     {products.length > 3 && (
//                         <p className="text-[11px] text-gray-400">
//                             + {products.length - 3} more
//                         </p>
//                     )}

//                 </div>

//             </td>


//             {/* =====================================
//                 VALUE
//             ===================================== */}

//             <td className="px-4 py-4">

//                 <div>

//                     <p className="text-sm font-semibold text-gray-900 dark:text-white">
//                         ৳
//                         {Number(
//                             pricing.originalValue
//                         ).toLocaleString()}
//                     </p>

//                     {pricing.savings > 0 && (
//                         <p className="mt-0.5 text-xs text-green-600">
//                             Save ৳
//                             {Number(
//                                 pricing.savings
//                             ).toLocaleString()}
//                         </p>
//                     )}

//                 </div>

//             </td>


//             {/* =====================================
//                 BUNDLE PRICE
//             ===================================== */}

//             <td className="px-4 py-4">

//                 <div>

//                     <p className="text-sm font-semibold text-gray-900 dark:text-white">
//                         ৳
//                         {Number(
//                             pricing.sellingPrice
//                         ).toLocaleString()}
//                     </p>

//                     {pricing.discountPercent > 0 && (
//                         <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-green-600">
//                             <Tag size={11} />

//                             {pricing.discountPercent}% OFF
//                         </span>
//                     )}

//                 </div>

//             </td>


//             {/* =====================================
//                 STOCK
//             ===================================== */}

//             <td className="px-4 py-4">

//                 <div>

//                     <p
//                         className={`text-sm font-medium ${stock === 0
//                             ? "text-red-600"
//                             : stock <= 10
//                                 ? "text-orange-600"
//                                 : "text-gray-900 dark:text-white"
//                             }`}
//                     >
//                         {stock}
//                     </p>

//                     <p className="text-xs text-gray-400">
//                         bundles
//                     </p>

//                 </div>

//             </td>


//             {/* =====================================
//                 STATUS
//             ===================================== */}

//             <td className="px-4 py-4">

//                 <div className="flex flex-col items-start gap-1.5">

//                     <span
//                         className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${isInactive
//                             ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
//                             : "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
//                             }`}
//                     >
//                         {isInactive
//                             ? "Inactive"
//                             : "Active"}
//                     </span>

//                     {stock === 0 && (
//                         <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">
//                             Out of stock
//                         </span>
//                     )}

//                 </div>

//             </td>


//             {/* =====================================
//                 ACTIONS
//             ===================================== */}

//             <td className="px-4 py-4">

//                 <div className="flex items-center gap-1">

//                     <button
//                         type="button"
//                         onClick={onView}
//                         title="View"
//                         className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
//                     >
//                         <Eye size={17} />
//                     </button>


//                     <button
//                         type="button"
//                         onClick={onEdit}
//                         title="Edit"
//                         className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
//                     >
//                         <Pencil size={17} />
//                     </button>


//                     {isInactive ? (

//                         <button
//                             type="button"
//                             onClick={onActivate}
//                             title="Activate"
//                             className="rounded-md p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
//                         >
//                             <RefreshCw size={17} />
//                         </button>

//                     ) : (

//                         <button
//                             type="button"
//                             onClick={onDelete}
//                             title="Deactivate"
//                             className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
//                         >
//                             <Trash2 size={17} />
//                         </button>

//                     )}

//                 </div>

//             </td>

//         </tr>
//     );
// };


// // =====================================================
// // SKELETON
// // =====================================================

// const BundleSkeleton = () => {
//     return (
//         <tr>

//             <td className="px-4 py-4">
//                 <div className="flex gap-3">

//                     <div className="h-14 w-11 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />

//                     <div className="space-y-2">
//                         <div className="h-3 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
//                         <div className="h-2.5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
//                     </div>

//                 </div>
//             </td>

//             <td className="px-4 py-4">
//                 <div className="space-y-2">
//                     <div className="h-2.5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
//                     <div className="h-2.5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
//                 </div>
//             </td>

//             <td className="px-4 py-4">
//                 <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
//             </td>

//             <td className="px-4 py-4">
//                 <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
//             </td>

//             <td className="px-4 py-4">
//                 <div className="h-3 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
//             </td>

//             <td className="px-4 py-4">
//                 <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
//             </td>

//             <td className="px-4 py-4">
//                 <div className="h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
//             </td>

//         </tr>
//     );
// };


// // =====================================================
// // PRICING HELPER
// // =====================================================

// const getBundlePricing = (bundle) => {

//     /*
//      * Preferred response:
//      *
//      * bundle.pricing = {
//      *   originalValue,
//      *   sellingPrice,
//      *   savings,
//      *   discountPercent
//      * }
//      */

//     if (bundle?.pricing) {
//         return {
//             originalValue:
//                 Number(
//                     bundle.pricing.originalValue || 0
//                 ),

//             sellingPrice:
//                 Number(
//                     bundle.pricing.sellingPrice ??
//                     bundle.price?.sellingPrice ??
//                     0
//                 ),

//             savings:
//                 Number(
//                     bundle.pricing.savings || 0
//                 ),

//             discountPercent:
//                 Number(
//                     bundle.pricing.discountPercent || 0
//                 ),
//         };
//     }

//     /*
//      * Fallback for old API response.
//      */

//     const originalValue =
//         Number(bundle?.price?.mrp || 0);

//     const sellingPrice =
//         Number(
//             bundle?.price?.sellingPrice || 0
//         );

//     const savings =
//         Math.max(
//             0,
//             originalValue - sellingPrice
//         );

//     const discountPercent =
//         originalValue > 0
//             ? Number(
//                 (
//                     (savings / originalValue) *
//                     100
//                 ).toFixed(2)
//             )
//             : 0;

//     return {
//         originalValue,
//         sellingPrice,
//         savings,
//         discountPercent,
//     };
// };


// // =====================================================
// // CLASSES
// // =====================================================

// const selectClass =
//     "h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 dark:border-gray-700 dark:bg-secondary-dark dark:text-gray-300 dark:focus:border-gray-500 dark:focus:ring-gray-800";

// const thClass =
//     "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400";

// const paginationButton =
//     "inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-gray-200 px-2 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800";

// const activePaginationButton =
//     "inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-gray-900 px-2 text-sm font-medium text-white dark:bg-white dark:text-gray-900";


// export default BundleProducts;



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
    Tag,
    ShoppingBag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useBundleProducts from "../../Hooks/useBundleProducts";



const BundleProducts = () => {
    const navigate = useNavigate();

    // ---------------------------------------------------------
    // Local UI state (search input is debounced/controlled here)
    // ---------------------------------------------------------
    const [searchInput, setSearchInput] = useState("");
    const [status, setStatus] = useState("active");

    // ---------------------------------------------------------
    // Hook: everything else (fetch, pagination, mutations)
    // ---------------------------------------------------------
    const {
        bundles,
        pagination,
        filters,
        loading,
        error,
        updateFilters,
        fetchBundles,
        updateBundle,
        deleteBundle,
        // mutation flags
        updating,
        deleting,
    } = useBundleProducts({
        autoFetch: true,
        initialFilters: {
            search: "",
            isActive: "true",
            page: 1,
            limit: 10,
        },
    });

    // ---------------------------------------------------------
    // Sync `status` select → `isActive` filter on the hook
    // ---------------------------------------------------------
    useEffect(() => {
        if (status === "all") {
            // Send no isActive filter — but our hook appends it only if defined
            updateFilters({
                isActive: undefined,
                page: 1,
            });
        } else {
            updateFilters({
                isActive: status === "active" ? "true" : "false",
                page: 1,
            });
        }
    }, [status, updateFilters]);

    // ---------------------------------------------------------
    // Show toast on fetch error
    // ---------------------------------------------------------
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // ---------------------------------------------------------
    // Search submit → push into hook filters
    // ---------------------------------------------------------
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        updateFilters({
            search: searchInput.trim(),
            page: 1,
        });
    };

    // ---------------------------------------------------------
    // Clear all filters
    // ---------------------------------------------------------
    const clearFilters = () => {
        setSearchInput("");
        setStatus("active");

        updateFilters({
            search: "",
            isActive: "true",
            page: 1,
        });
    };

    // ---------------------------------------------------------
    // Deactivate (soft delete)
    // ---------------------------------------------------------
    const handleDelete = async (bundle) => {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate "${bundle.name}"?`
        );
        if (!confirmed) return;

        try {
            await deleteBundle(bundle._id);
            toast.success("Bundle deactivated successfully");
        } catch (err) {
            toast.error(err.message || "Failed to deactivate bundle");
        }
    };

    // ---------------------------------------------------------
    // Activate
    // ---------------------------------------------------------
    const handleActivate = async (bundle) => {
        try {
            await updateBundle(bundle._id, { isActive: true });
            toast.success("Bundle activated successfully");
        } catch (err) {
            toast.error(err.message || "Failed to activate bundle");
        }
    };

    // ---------------------------------------------------------
    // Pagination page numbers
    // ---------------------------------------------------------
    const paginationPages = useMemo(() => {
        const start = Math.max(1, filters.page - 2);
        const end = Math.min(pagination.totalPages, filters.page + 2);

        const pages = [];
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    }, [filters.page, pagination.totalPages]);

    // ---------------------------------------------------------
    // Derived
    // ---------------------------------------------------------
    const total = pagination.total;
    const totalPages = pagination.totalPages || 1;

    // ==========================================================
    // RENDER
    // ==========================================================
    return (
        <div className="min-h-full bg-white p-4 dark:bg-primary-dark md:p-6">
            {/* HEADER */}
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Bundle Products
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage all bundle products in your store
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={fetchBundles}
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-secondary-dark dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/bundle-products/create")
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                    >
                        <Plus size={17} />
                        Add Bundle
                    </button>
                </div>
            </div>

            {/* FILTERS */}
            <div className="mb-5 rounded border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-secondary-dark">
                <form
                    onSubmit={handleSearchSubmit}
                    className="flex flex-col gap-3 sm:flex-row"
                >
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="search"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search bundle..."
                            className="h-10 w-full rounded-md border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 dark:border-gray-700 dark:bg-secondary-dark dark:text-white dark:focus:border-gray-500 dark:focus:ring-gray-800"
                        />
                    </div>

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={selectClass}
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="all">All Status</option>
                    </select>

                    <button
                        type="submit"
                        className="h-10 rounded-md bg-gray-900 px-5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                    >
                        Search
                    </button>
                </form>

                {(searchInput || status !== "active") && (
                    <div className="mt-3 flex justify-end">
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* SUMMARY */}
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {loading
                        ? "Loading bundles..."
                        : `${total} bundle${total !== 1 ? "s" : ""} found`}
                </p>
            </div>

            {/* TABLE */}
            <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-secondary-dark">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px] text-left">
                        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                            <tr>
                                <th className={thClass}>Bundle</th>
                                <th className={thClass}>Products</th>
                                <th className={thClass}>Value</th>
                                <th className={thClass}>Bundle Price</th>
                                <th className={thClass}>Stock</th>
                                <th className={thClass}>Status</th>
                                <th className={thClass}>Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <BundleSkeleton key={i} />
                                ))
                            ) : bundles.length === 0 ? (
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
                                            No bundle products found
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Try changing your filters or create
                                            a new bundle.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                bundles.map((bundle) => (
                                    <BundleRow
                                        key={bundle._id}
                                        bundle={bundle}
                                        onView={() =>
                                            window.open(
                                                `/bundle/${bundle.slug}`,
                                                "_blank",
                                                "noopener,noreferrer"
                                            )
                                        }
                                        onEdit={() =>
                                            navigate(
                                                `/admin/bundle-products/${bundle._id}/edit`
                                            )
                                        }
                                        onDelete={() => handleDelete(bundle)}
                                        onActivate={() =>
                                            handleActivate(bundle)
                                        }
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {!loading && bundles.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Page {filters.page} of {totalPages}
                        </p>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={filters.page <= 1}
                                onClick={() =>
                                    updateFilters({
                                        page: Math.max(1, filters.page - 1),
                                    })
                                }
                                className={paginationButton}
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {paginationPages.map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    onClick={() =>
                                        updateFilters({ page: pageNumber })
                                    }
                                    className={
                                        pageNumber === filters.page
                                            ? activePaginationButton
                                            : paginationButton
                                    }
                                >
                                    {pageNumber}
                                </button>
                            ))}

                            <button
                                type="button"
                                disabled={filters.page >= totalPages}
                                onClick={() =>
                                    updateFilters({
                                        page: Math.min(
                                            totalPages,
                                            filters.page + 1
                                        ),
                                    })
                                }
                                className={paginationButton}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ==========================================================
// BUNDLE ROW (unchanged)
// ==========================================================
const BundleRow = ({ bundle, onView, onEdit, onDelete, onActivate }) => {
    const isInactive = bundle.isActive === false;
    const pricing = getBundlePricing(bundle);
    const stock = Number(bundle.totalStock || 0);

    const products = Array.isArray(bundle.products) ? bundle.products : [];

    return (
        <tr className="transition hover:bg-gray-50 dark:hover:bg-gray-800/40">
            {/* BUNDLE */}
            <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-14 w-11 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                        {bundle.thumbnail ? (
                            <img
                                src={bundle.thumbnail}
                                alt={bundle.name}
                                className="h-full w-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <Package size={18} className="text-gray-400" />
                            </div>
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="max-w-[240px] truncate text-sm font-medium text-gray-900 dark:text-white">
                            {bundle.name}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                            /{bundle.slug}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-400">
                            {products.length} product
                            {products.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
            </td>

            {/* PRODUCTS */}
            <td className="px-4 py-4">
                <div className="max-w-[260px] space-y-1">
                    {products.slice(0, 3).map((item, index) => {
                        const product = item.product;
                        return (
                            <div
                                key={item.productId || index}
                                className="flex items-center gap-2"
                            >
                                {product?.thumbnail ? (
                                    <img
                                        src={product.thumbnail}
                                        alt={product.name || "Product"}
                                        className="h-7 w-6 shrink-0 rounded object-cover"
                                    />
                                ) : (
                                    <div className="flex h-7 w-6 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
                                        <ShoppingBag
                                            size={12}
                                            className="text-gray-400"
                                        />
                                    </div>
                                )}
                                <p className="min-w-0 truncate text-xs text-gray-600 dark:text-gray-300">
                                    {product?.name || "Product unavailable"}
                                    <span className="ml-1 text-gray-400">
                                        × {item.quantity}
                                    </span>
                                </p>
                            </div>
                        );
                    })}

                    {products.length > 3 && (
                        <p className="text-[11px] text-gray-400">
                            + {products.length - 3} more
                        </p>
                    )}
                </div>
            </td>

            {/* VALUE */}
            <td className="px-4 py-4">
                <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        ৳
                        {Number(pricing.originalValue).toLocaleString()}
                    </p>
                    {pricing.savings > 0 && (
                        <p className="mt-0.5 text-xs text-green-600">
                            Save ৳
                            {Number(pricing.savings).toLocaleString()}
                        </p>
                    )}
                </div>
            </td>

            {/* BUNDLE PRICE */}
            <td className="px-4 py-4">
                <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        ৳
                        {Number(pricing.sellingPrice).toLocaleString()}
                    </p>
                    {pricing.discountPercent > 0 && (
                        <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-green-600">
                            <Tag size={11} />
                            {pricing.discountPercent}% OFF
                        </span>
                    )}
                </div>
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
                    <p className="text-xs text-gray-400">bundles</p>
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
                        {isInactive ? "Inactive" : "Active"}
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
                        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                        <Eye size={17} />
                    </button>

                    <button
                        type="button"
                        onClick={onEdit}
                        title="Edit"
                        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                        <Pencil size={17} />
                    </button>

                    {isInactive ? (
                        <button
                            type="button"
                            onClick={onActivate}
                            title="Activate"
                            className="rounded-md p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                        >
                            <RefreshCw size={17} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onDelete}
                            title="Deactivate"
                            className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                        >
                            <Trash2 size={17} />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};

// ==========================================================
// SKELETON (unchanged)
// ==========================================================
const BundleSkeleton = () => (
    <tr>
        <td className="px-4 py-4">
            <div className="flex gap-3">
                <div className="h-14 w-11 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
                <div className="space-y-2">
                    <div className="h-3 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-2.5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                </div>
            </div>
        </td>
        <td className="px-4 py-4">
            <div className="space-y-2">
                <div className="h-2.5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-2.5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
        </td>
        <td className="px-4 py-4">
            <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        </td>
        <td className="px-4 py-4">
            <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
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

// ==========================================================
// PRICING HELPER (unchanged)
// ==========================================================
const getBundlePricing = (bundle) => {
    if (bundle?.pricing) {
        return {
            originalValue: Number(bundle.pricing.originalValue || 0),
            sellingPrice: Number(
                bundle.pricing.sellingPrice ??
                bundle.price?.sellingPrice ??
                0
            ),
            savings: Number(bundle.pricing.savings || 0),
            discountPercent: Number(bundle.pricing.discountPercent || 0),
        };
    }

    const originalValue = Number(bundle?.price?.mrp || 0);
    const sellingPrice = Number(bundle?.price?.sellingPrice || 0);
    const savings = Math.max(0, originalValue - sellingPrice);
    const discountPercent =
        originalValue > 0
            ? Number(((savings / originalValue) * 100).toFixed(2))
            : 0;

    return { originalValue, sellingPrice, savings, discountPercent };
};

// ==========================================================
// CLASSES (unchanged)
// ==========================================================
const selectClass =
    "h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 dark:border-gray-700 dark:bg-secondary-dark dark:text-gray-300 dark:focus:border-gray-500 dark:focus:ring-gray-800";

const thClass =
    "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400";

const paginationButton =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-gray-200 px-2 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800";

const activePaginationButton =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-gray-900 px-2 text-sm font-medium text-white dark:bg-white dark:text-gray-900";

export default BundleProducts;