import { useEffect, useMemo, useState } from "react";
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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ProductTypes = () => {
    const [productTypes, setProductTypes] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [editingProductType, setEditingProductType] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        image: "",
        isActive: true,
    });

    const [error, setError] = useState("");

    // ==========================================
    // GET PRODUCT TYPES
    // ==========================================

    const fetchProductTypes = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/product-types`);

            if (!response.ok) {
                throw new Error("Failed to fetch product types");
            }

            const data = await response.json();
            console.log(data)

            setProductTypes(Array.isArray(data) ? data : []);

        } catch (err) {
            console.error(err);
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductTypes();
    }, []);

    // ==========================================
    // SEARCH
    // ==========================================

    const filteredProductTypes = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        if (!searchText) {
            return productTypes;
        }

        return productTypes.filter((item) =>
            item.name?.toLowerCase().includes(searchText)
        );
    }, [productTypes, search]);

    // ==========================================
    // INPUT CHANGE
    // ==========================================

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // ==========================================
    // OPEN ADD MODAL
    // ==========================================

    const handleAdd = () => {
        setEditingProductType(null);

        setFormData({
            name: "",
            image: "",
            isActive: true,
        });

        setError("");
        setShowModal(true);
    };

    // ==========================================
    // OPEN EDIT MODAL
    // ==========================================

    const handleEdit = (productType) => {
        setEditingProductType(productType);

        setFormData({
            name: productType.name || "",
            image: productType.image || "",
            isActive: productType.isActive !== false,
        });

        setError("");
        setShowModal(true);
    };

    // ==========================================
    // CLOSE MODAL
    // ==========================================

    const handleCloseModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingProductType(null);

        setFormData({
            name: "",
            image: "",
            isActive: true,
        });

        setError("");
    };

    // ==========================================
    // ADD / UPDATE
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        const name = formData.name.trim();

        if (!name) {
            setError("Product type name is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const isEditing = Boolean(editingProductType);

            const url = isEditing
                ? `${API_URL}/product-types/${editingProductType._id}`
                : `${API_URL}/product-types`;

            const method = isEditing ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    image: formData.image.trim(),
                    isActive: formData.isActive,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to save product type"
                );
            }

            await fetchProductTypes();

            handleCloseModal();

        } catch (err) {
            console.error(err);

            setError(
                err.message || "Failed to save product type"
            );
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // DELETE
    // ==========================================

    const handleDelete = async (id, name) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${name}"?`
        );

        if (!confirmed) return;

        try {
            setDeletingId(id);

            const response = await fetch(
                `${API_URL}/product-types/${id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete product type"
                );
            }

            setProductTypes((prev) =>
                prev.filter((item) => item._id !== id)
            );

        } catch (err) {
            console.error(err);

            window.alert(
                err.message || "Failed to delete product type"
            );
        } finally {
            setDeletingId(null);
        }
    };

    // ==========================================
    // ACTIVE / INACTIVE
    // ==========================================

    const handleToggleStatus = async (productType) => {
        try {
            const newStatus = productType.isActive === false;

            const response = await fetch(
                `${API_URL}/product-types/${productType._id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        isActive: newStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update status"
                );
            }

            setProductTypes((prev) =>
                prev.map((item) =>
                    item._id === productType._id
                        ? {
                            ...item,
                            isActive: newStatus,
                        }
                        : item
                )
            );

        } catch (err) {
            console.error(err);

            window.alert(
                err.message || "Failed to update status"
            );
        }
    };

    return (
        <div className="w-full p-4 md:p-6">

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Product Types
                    </h1>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage your product types
                    </p>
                </div>

                <button
                    onClick={handleAdd}
                    className="flex w-fit items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                    <Plus size={18} />

                    Add Product Type
                </button>

            </div>

            {/* ==========================================
                SEARCH
            ========================================== */}

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="relative w-full sm:max-w-sm">

                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search product type..."
                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />

                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredProductTypes.length} product type
                    {filteredProductTypes.length !== 1 ? "s" : ""}
                </div>

            </div>

            {/* ==========================================
                ERROR
            ========================================== */}

            {error && !showModal && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* ==========================================
                TABLE
            ========================================== */}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">

                {loading ? (
                    <div className="flex min-h-[300px] items-center justify-center">

                        <div className="flex items-center gap-2 text-gray-500">
                            <Loader2
                                size={20}
                                className="animate-spin"
                            />

                            Loading product types...
                        </div>

                    </div>
                ) : filteredProductTypes.length === 0 ? (

                    <div className="flex min-h-[300px] flex-col items-center justify-center px-4 text-center">

                        <div className="mb-3 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                            <ImageIcon
                                size={28}
                                className="text-gray-400"
                            />
                        </div>

                        <h3 className="text-base font-medium text-gray-800 dark:text-white">
                            No product types found
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Add your first product type.
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[700px] text-left">

                            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">

                                <tr>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        #
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Product Type
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Slug
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Status
                                    </th>

                                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">

                                {filteredProductTypes.map(
                                    (productType, index) => {

                                        const isActive =
                                            productType.isActive !== false;

                                        return (
                                            <tr
                                                key={productType._id}
                                                className="transition hover:bg-gray-50 dark:hover:bg-gray-800/40"
                                            >

                                                {/* NUMBER */}

                                                <td className="px-5 py-4 text-sm text-gray-500">
                                                    {index + 1}
                                                </td>

                                                {/* PRODUCT TYPE */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">

                                                            {productType.image ? (
                                                                <img
                                                                    src={productType.image}
                                                                    alt={productType.name}
                                                                    className="h-full w-full object-cover"
                                                                    onError={(
                                                                        e
                                                                    ) => {
                                                                        e.currentTarget.style.display =
                                                                            "none";
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center">
                                                                    <ImageIcon
                                                                        size={
                                                                            20
                                                                        }
                                                                        className="text-gray-400"
                                                                    />
                                                                </div>
                                                            )}

                                                        </div>

                                                        <div>

                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {
                                                                    productType.name
                                                                }
                                                            </p>

                                                            <p className="text-xs text-gray-500">
                                                                ID:{" "}
                                                                {
                                                                    productType._id
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* SLUG */}

                                                <td className="px-5 py-4">

                                                    <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                        /
                                                        {
                                                            productType.slug
                                                        }
                                                    </span>

                                                </td>

                                                {/* STATUS */}

                                                <td className="px-5 py-4">

                                                    <button
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                productType
                                                            )
                                                        }
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${isActive
                                                                ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950/40 dark:text-green-400"
                                                                : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/40 dark:text-red-400"
                                                            }`}
                                                    >

                                                        <Power size={13} />

                                                        {isActive
                                                            ? "Active"
                                                            : "Inactive"}

                                                    </button>

                                                </td>

                                                {/* ACTIONS */}

                                                <td className="px-5 py-4">

                                                    <div className="flex justify-end gap-2">

                                                        <button
                                                            onClick={() =>
                                                                handleEdit(
                                                                    productType
                                                                )
                                                            }
                                                            className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                                            title="Edit"
                                                        >
                                                            <Pencil
                                                                size={16}
                                                            />
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    productType._id,
                                                                    productType.name
                                                                )
                                                            }
                                                            disabled={
                                                                deletingId ===
                                                                productType._id
                                                            }
                                                            className="rounded-lg border border-red-200 p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
                                                            title="Delete"
                                                        >

                                                            {deletingId ===
                                                                productType._id ? (
                                                                <Loader2
                                                                    size={
                                                                        16
                                                                    }
                                                                    className="animate-spin"
                                                                />
                                                            ) : (
                                                                <Trash2
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            )}

                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {/* ==========================================
                ADD / EDIT MODAL
            ========================================== */}

            {showModal && (

                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            handleCloseModal();
                        }
                    }}
                >

                    <div className="w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">

                        {/* MODAL HEADER */}

                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">

                            <div>

                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {editingProductType
                                        ? "Edit Product Type"
                                        : "Add Product Type"}
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    {editingProductType
                                        ? "Update product type information"
                                        : "Create a new product type"}
                                </p>

                            </div>

                            <button
                                onClick={handleCloseModal}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <X size={19} />
                            </button>

                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 p-5"
                        >

                            {/* ERROR */}

                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                                    {error}
                                </div>
                            )}

                            {/* NAME */}

                            <div>

                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Product Type Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Men"
                                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />

                            </div>

                            {/* IMAGE */}

                            <div>

                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Image URL
                                </label>

                                <input
                                    type="url"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    placeholder="https://example.com/men.jpg"
                                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />

                                {formData.image && (
                                    <div className="mt-3 h-24 w-24 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">

                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display =
                                                    "none";
                                            }}
                                        />

                                    </div>
                                )}

                            </div>

                            {/* STATUS */}

                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">

                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="h-4 w-4 accent-black dark:accent-white"
                                />

                                <div>

                                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                                        Active
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        Show this product type on the
                                        website
                                    </p>

                                </div>

                            </label>

                            {/* BUTTONS */}

                            <div className="flex justify-end gap-3 pt-2">

                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={saving}
                                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex min-w-[130px] items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                                >

                                    {saving && (
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />
                                    )}

                                    {saving
                                        ? "Saving..."
                                        : editingProductType
                                            ? "Update"
                                            : "Create"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
};

export default ProductTypes;