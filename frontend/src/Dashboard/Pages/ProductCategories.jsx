import React, { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
    Image as ImageIcon,
    Loader2,
    Power,
} from "lucide-react";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const initialForm = {
    productTypeId: "",
    name: "",
    image: "",
    isActive: true,
};

const ProductCategories = () => {
    const [categories, setCategories] = useState([]);
    const [productTypes, setProductTypes] = useState([]);

    const [loading, setLoading] = useState(true);
    const [productTypesLoading, setProductTypesLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [filterProductType, setFilterProductType] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [formData, setFormData] = useState(initialForm);

    // =========================
    // FETCH PRODUCT TYPES
    // =========================
    const fetchProductTypes = async () => {
        try {
            setProductTypesLoading(true);

            const res = await fetch(`${API_URL}/product-types`);

            if (!res.ok) {
                throw new Error("Failed to fetch product types");
            }

            const data = await res.json();

            setProductTypes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Product types fetch error:", error);
        } finally {
            setProductTypesLoading(false);
        }
    };

    // =========================
    // FETCH CATEGORIES
    // =========================
    const fetchCategories = async () => {
        try {
            setLoading(true);

            const query = filterProductType
                ? `?productTypeId=${filterProductType}`
                : "";

            const res = await fetch(`${API_URL}/categories${query}`);

            if (!res.ok) {
                throw new Error("Failed to fetch categories");
            }

            const data = await res.json();

            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Categories fetch error:", error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductTypes();
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [filterProductType]);

    // =========================
    // SEARCH
    // =========================
    const filteredCategories = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        if (!searchText) return categories;

        return categories.filter((category) =>
            category.name?.toLowerCase().includes(searchText)
        );
    }, [categories, search]);

    // =========================
    // OPEN ADD MODAL
    // =========================
    const handleAdd = () => {
        setEditingCategory(null);

        setFormData({
            productTypeId: filterProductType || "",
            name: "",
            image: "",
            isActive: true,
        });

        setModalOpen(true);
    };

    // =========================
    // OPEN EDIT MODAL
    // =========================
    const handleEdit = (category) => {
        setEditingCategory(category);

        setFormData({
            productTypeId: category.productTypeId || "",
            name: category.name || "",
            image: category.image || "",
            isActive: category.isActive ?? true,
        });

        setModalOpen(true);
    };

    // =========================
    // CLOSE MODAL
    // =========================
    const closeModal = () => {
        if (saving) return;

        setModalOpen(false);
        setEditingCategory(null);
        setFormData(initialForm);
    };

    // =========================
    // INPUT CHANGE
    // =========================
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // =========================
    // CREATE / UPDATE
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();

        const cleanName = formData.name.trim();

        if (!formData.productTypeId) {
            alert("Please select a product type.");
            return;
        }

        if (!cleanName) {
            alert("Category name is required.");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                productTypeId: formData.productTypeId,
                name: cleanName,
                image: formData.image.trim(),
                isActive: formData.isActive,
            };

            const url = editingCategory
                ? `${API_URL}/categories/${editingCategory._id}`
                : `${API_URL}/categories`;

            const method = editingCategory ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            closeModal();
            await fetchCategories();
        } catch (error) {
            console.error("Category save error:", error);
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // DELETE
    // =========================
    const handleDelete = async (category) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${category.name}"?`
        );

        if (!confirmed) return;

        try {
            const res = await fetch(
                `${API_URL}/categories/${category._id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to delete category");
            }

            await fetchCategories();
        } catch (error) {
            console.error("Category delete error:", error);
            alert(error.message);
        }
    };

    // =========================
    // TOGGLE ACTIVE
    // =========================
    const handleToggleActive = async (category) => {
        try {
            const res = await fetch(
                `${API_URL}/categories/${category._id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        isActive: !category.isActive,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to update status");
            }

            await fetchCategories();
        } catch (error) {
            console.error("Category status error:", error);
            alert(error.message);
        }
    };

    // =========================
    // PRODUCT TYPE NAME
    // =========================
    const getProductTypeName = (productTypeId) => {
        const type = productTypes.find(
            (item) => String(item._id) === String(productTypeId)
        );

        return type?.name || "Unknown";
    };

    return (
        <div className="w-full p-4 md:p-6">
            {/* ================= HEADER ================= */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Product Categories
                    </h1>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage categories and their product type relationships.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleAdd}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            {/* ================= FILTERS ================= */}
            <div className="mb-5 flex flex-col gap-3 md:flex-row">
                {/* Search */}
                <div className="relative flex-1">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        placeholder="Search category..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                </div>

                {/* Product Type Filter */}
                <select
                    value={filterProductType}
                    onChange={(e) => setFilterProductType(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                    <option value="">All Product Types</option>

                    {productTypes.map((type) => (
                        <option key={type._id} value={type._id}>
                            {type.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* ================= TABLE ================= */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left">
                        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60">
                            <tr>
                                <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                                    Category
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                                    Product Type
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                                    Slug
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                                    Status
                                </th>

                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-5 py-12 text-center">
                                        <Loader2
                                            size={24}
                                            className="mx-auto animate-spin text-gray-400"
                                        />
                                    </td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-5 py-12 text-center text-sm text-gray-500"
                                    >
                                        No categories found.
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <tr
                                        key={category._id}
                                        className="transition hover:bg-gray-50 dark:hover:bg-gray-800/40"
                                    >
                                        {/* Category */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                                    {category.image ? (
                                                        <img
                                                            src={category.image}
                                                            alt={category.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <ImageIcon
                                                            size={18}
                                                            className="text-gray-400"
                                                        />
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {category.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Product Type */}
                                        <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            {getProductTypeName(category.productTypeId)}
                                        </td>

                                        {/* Slug */}
                                        <td className="px-5 py-4">
                                            <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                {category.slug}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleActive(category)}
                                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${category.isActive
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                    }`}
                                            >
                                                <Power size={13} />

                                                {category.isActive ? "Active" : "Inactive"}
                                            </button>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(category)}
                                                    className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-black dark:hover:bg-gray-800 dark:hover:text-white"
                                                    title="Edit"
                                                >
                                                    <Pencil size={17} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(category)}
                                                    className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ================= MODAL ================= */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl dark:bg-gray-900">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {editingCategory
                                        ? "Edit Category"
                                        : "Add Category"}
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    {editingCategory
                                        ? "Update category information."
                                        : "Create a new product category."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-5">
                            <div className="space-y-4">
                                {/* Product Type */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Product Type
                                    </label>

                                    <select
                                        name="productTypeId"
                                        value={formData.productTypeId}
                                        onChange={handleChange}
                                        disabled={productTypesLoading}
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    >
                                        <option value="">
                                            {productTypesLoading
                                                ? "Loading..."
                                                : "Select Product Type"}
                                        </option>

                                        {productTypes.map((type) => (
                                            <option key={type._id} value={type._id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Category Name */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Category Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Topwear"
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>

                                {/* Image */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Image URL
                                    </label>

                                    <input
                                        type="url"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>

                                {/* Sort Order */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Sort Order
                                    </label>

                                    <input
                                        type="number"
                                        name="sortOrder"
                                        min="1"
                                        value={formData.sortOrder}
                                        onChange={handleChange}
                                        placeholder="e.g. 1"
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    />

                                    <p className="mt-1 text-xs text-gray-500">
                                        Lower number appears first.
                                    </p>
                                </div>

                                {/* Status */}
                                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            Active Status
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            Show this category on the storefront.
                                        </p>
                                    </div>

                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="h-4 w-4"
                                    />
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                                >
                                    {saving && (
                                        <Loader2 size={16} className="animate-spin" />
                                    )}

                                    {editingCategory
                                        ? "Update Category"
                                        : "Create Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductCategories;