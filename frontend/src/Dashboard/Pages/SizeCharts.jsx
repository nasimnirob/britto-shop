import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { Edit, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import MediaLibrary from "../../Component/Cloudinary/MediaLibrary";
import SizeChartBuilder from "../../Component/SizeChart/SizeChartBuilder";


const API_URL = import.meta.env.VITE_API_URL;

const initialForm = {
    name: "",
    description: "",
    type: "image",        // "image" | "custom"
    image: "",
    unit: "inch",
    headers: ["Size", "Chest", "Length", "Sleeve", "Shoulder"],
    rows: [{ Size: "M", Chest: "", Length: "", Sleeve: "", Shoulder: "" }],
};

const SizeCharts = () => {
    const [sizeCharts, setSizeCharts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingChart, setEditingChart] = useState(null);

    const [formData, setFormData] = useState(initialForm);
    const [saving, setSaving] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingChart, setDeletingChart] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // =========================
    // Fetch Size Charts
    // =========================

    const fetchSizeCharts = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/size-charts`);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to fetch size charts"
                );
            }

            setSizeCharts(data?.data || []);
        } catch (error) {
            console.error("Fetch size charts error:", error);

            toast.error(
                error?.message || "Failed to load size charts"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSizeCharts();
    }, []);

    // =========================
    // Filter
    // =========================

    const filteredCharts = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return sizeCharts;

        return sizeCharts.filter((chart) =>
            chart?.name?.toLowerCase().includes(keyword)
        );
    }, [sizeCharts, search]);

    // =========================
    // Open Add Modal
    // =========================

    const handleAdd = () => {
        setEditingChart(null);
        setFormData(initialForm);
        setModalOpen(true);
    };

    // =========================
    // Open Edit Modal
    // =========================

    const handleEdit = (chart) => {
        setEditingChart(chart);

        setFormData({
            name: chart?.name || "",
            description: chart?.description || "",
            type: chart?.type || "image",
            image: chart?.image || "",
            unit: chart?.unit || "inch",
            headers: chart?.headers?.length
                ? chart.headers
                : ["Size", "Chest", "Length", "Sleeve", "Shoulder"],
            rows: chart?.rows?.length
                ? chart.rows
                : [{ Size: "M", Chest: "", Length: "", Sleeve: "", Shoulder: "" }],
        });

        setModalOpen(true);
    };

    // =========================
    // Close Modal
    // =========================

    const handleCloseModal = () => {
        if (saving) return;

        setModalOpen(false);
        setEditingChart(null);
        setFormData(initialForm);
    };

    // =========================
    // Input Change
    // =========================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================
    // Submit
    // =========================

    const handleSubmit = async (e) => {
        e.preventDefault();

        const name = formData.name.trim();
        const description = formData.description.trim();
        const { type, unit, headers, rows } = formData;
        const image = formData.image?.trim();

        if (!name) {
            toast.error("Size chart name is required");
            return;
        }

        if (type === "image" && !image) {
            toast.error("Please upload a size chart image");
            return;
        }

        if (type === "custom") {
            if (headers.length < 2) {
                toast.error("At least 2 columns are required");
                return;
            }
            if (rows.length < 1) {
                toast.error("At least 1 size row is required");
                return;
            }
        }

        try {
            setSaving(true);

            const isEditing = Boolean(editingChart?._id);

            const url = isEditing
                ? `${API_URL}/size-charts/${editingChart._id}`
                : `${API_URL}/size-charts`;

            const payload =
                type === "image"
                    ? { name, description, type, image }
                    : { name, description, type, headers, rows, unit };

            const response = await fetch(url, {
                method: isEditing ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    `Failed to ${isEditing ? "update" : "create"} size chart`
                );
            }

            toast.success(
                data?.message ||
                `Size chart ${isEditing ? "updated" : "created"} successfully`
            );

            setModalOpen(false);
            setEditingChart(null);
            setFormData(initialForm);

            await fetchSizeCharts();
        } catch (error) {
            console.error("Save size chart error:", error);
            toast.error(error?.message || "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // Open Delete Modal
    // =========================

    const handleDeleteClick = (chart) => {
        setDeletingChart(chart);
        setDeleteModalOpen(true);
    };

    // =========================
    // Close Delete Modal
    // =========================

    const handleCloseDeleteModal = () => {
        if (deleting) return;

        setDeleteModalOpen(false);
        setDeletingChart(null);
    };

    // =========================
    // Delete / Deactivate
    // =========================

    const handleDelete = async () => {
        if (!deletingChart?._id) return;

        try {
            setDeleting(true);

            const response = await fetch(
                `${API_URL}/size-charts/${deletingChart._id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to delete size chart"
                );
            }

            toast.success(
                data?.message ||
                "Size chart deactivated successfully"
            );

            setDeleteModalOpen(false);
            setDeletingChart(null);

            await fetchSizeCharts();
        } catch (error) {
            console.error("Delete size chart error:", error);

            toast.error(
                error?.message || "Failed to delete size chart"
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="w-full min-h-full p-4 md:p-6">
            {/* =====================================
          Header
      ====================================== */}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-[var(--text)]">
                        Size Charts
                    </h1>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage reusable size charts for your products.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleAdd}
                    className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-black
            px-4
            py-2.5
            text-sm
            font-medium
            text-white
            transition
            hover:bg-gray-800
            dark:bg-white
            dark:text-black
            dark:hover:bg-gray-200
          "
                >
                    <Plus size={18} />

                    Add Size Chart
                </button>
            </div>

            {/* =====================================
          Search
      ====================================== */}

            <div className="mt-6">
                <div
                    className="
            flex
            w-full
            max-w-md
            items-center
            gap-2
            rounded-lg
            border
            border-gray-200
            bg-white
            px-3
            dark:border-white/10
            dark:bg-white/5
          "
                >
                    <Search
                        size={18}
                        className="shrink-0 text-gray-400"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search size chart..."
                        className="
              w-full
              bg-transparent
              py-2.5
              text-sm
              text-[var(--text)]
              outline-none
              placeholder:text-gray-400
            "
                    />
                </div>
            </div>

            {/* =====================================
          Content
      ====================================== */}

            <div className="mt-6">
                {loading ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="
                  animate-pulse
                  overflow-hidden
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  dark:border-white/10
                  dark:bg-white/5
                "
                            >
                                <div className="aspect-[4/3] bg-gray-200 dark:bg-white/10" />

                                <div className="space-y-3 p-4">
                                    <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-white/10" />

                                    <div className="h-3 w-full rounded bg-gray-200 dark:bg-white/10" />

                                    <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-white/10" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredCharts.length === 0 ? (
                    <div
                        className="
              flex
              min-h-[300px]
              flex-col
              items-center
              justify-center
              rounded-xl
              border
              border-dashed
              border-gray-300
              px-6
              text-center
              dark:border-white/10
            "
                    >
                        <div className="mb-3 rounded-full bg-gray-100 p-3 dark:bg-white/10">
                            <Search
                                size={22}
                                className="text-gray-500"
                            />
                        </div>

                        <h3 className="text-base font-medium text-[var(--text)]">
                            {search
                                ? "No size chart found"
                                : "No size charts yet"}
                        </h3>

                        <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
                            {search
                                ? "Try searching with a different name."
                                : "Create your first size chart to reuse it across products."}
                        </p>

                        {!search && (
                            <button
                                type="button"
                                onClick={handleAdd}
                                className="
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  bg-black
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-white
                  dark:bg-white
                  dark:text-black
                "
                            >
                                <Plus size={17} />
                                Add Size Chart
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredCharts.map((chart) => (
                            <div
                                key={chart._id}
                                className="
                  overflow-hidden
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  shadow-sm
                  dark:border-white/10
                  dark:bg-white/5
                "
                            >
                                {/* Image */}

                                <div className="group relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-black/20">
                                    {chart.type === "custom" && chart.rows?.length ? (
                                        /* Mini table preview */
                                        <div className="h-full w-full overflow-auto p-2">
                                            <table className="w-full border-collapse text-[9px]">
                                                <thead>
                                                    <tr className="bg-[#393635] text-white">
                                                        {chart.headers.map((h) => (
                                                            <th key={h} className="px-1 py-1 text-center uppercase">
                                                                {h}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {chart.rows.slice(0, 4).map((row, ri) => (
                                                        <tr key={ri} className={ri % 2 ? "bg-[#f0f8ff]" : "bg-white"}>
                                                            {chart.headers.map((h) => (
                                                                <td key={h} className="px-1 py-0.5 text-center text-gray-700">
                                                                    {row[h]}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : chart.image ? (
                                        <img
                                            src={chart.image}
                                            alt={chart.name}
                                            className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-[1.02]"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                                            No Preview
                                        </div>
                                    )}

                                    {/* Type badge */}
                                    <div className="absolute right-3 top-3 flex gap-1">
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200">
                                            {chart.type === "custom" ? "Custom" : "Image"}
                                        </span>
                                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                                            Active
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}

                                <div className="p-4">
                                    <h3
                                        className="
                      truncate
                      text-base
                      font-semibold
                      text-[var(--text)]
                    "
                                        title={chart.name}
                                    >
                                        {chart.name}
                                    </h3>

                                    <p className="mt-1 min-h-[40px] text-sm leading-5 text-gray-500 dark:text-gray-400">
                                        {chart.description ||
                                            "No description added."}
                                    </p>

                                    {/* Actions */}

                                    <div className="mt-4 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(chart)}
                                            className="
                        inline-flex
                        flex-1
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        border
                        border-gray-200
                        px-3
                        py-2
                        text-sm
                        font-medium
                        text-[var(--text)]
                        transition
                        hover:bg-gray-50
                        dark:border-white/10
                        dark:hover:bg-white/10
                      "
                                        >
                                            <Edit size={16} />
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteClick(chart)
                                            }
                                            className="
                        inline-flex
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-red-200
                        px-3
                        py-2
                        text-red-600
                        transition
                        hover:bg-red-50
                        dark:border-red-500/20
                        dark:text-red-400
                        dark:hover:bg-red-500/10
                      "
                                            aria-label={`Delete ${chart.name}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* =====================================
          Add / Edit Modal
      ====================================== */}

            {modalOpen && (
                <div
                    className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/50
            p-4
            backdrop-blur-sm
          "
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            handleCloseModal();
                        }
                    }}
                >
                    <div
                        className="
              max-h-[90vh]
              w-full
              max-w-2xl
              overflow-y-auto
              rounded-2xl
              bg-white
              shadow-2xl
              dark:bg-[#1c1c1d]
            "
                    >
                        {/* Modal Header */}

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-[#1c1c1d]">
                            <div>
                                <h2 className="text-lg font-semibold text-[var(--text)]">
                                    {editingChart
                                        ? "Edit Size Chart"
                                        : "Add Size Chart"}
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                    Upload a reusable size chart for products.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={saving}
                                className="
                  rounded-lg
                  p-2
                  text-gray-500
                  transition
                  hover:bg-gray-100
                  hover:text-gray-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  dark:hover:bg-white/10
                "
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 p-5"
                        >

                            {/* Type Switcher */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                                    Chart Type <span className="ml-1 text-red-500">*</span>
                                </label>

                                <div className="flex gap-2">
                                    {[
                                        { value: "image", label: "Image Upload" },
                                        { value: "custom", label: "Custom Builder" },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            disabled={saving}
                                            onClick={() =>
                                                setFormData((prev) => ({ ...prev, type: opt.value }))
                                            }
                                            className={`
                    flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition
                    ${formData.type === opt.value
                                                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                                                    : "border-gray-200 text-[var(--text)] hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10"
                                                }
                `}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ---------- IMAGE TYPE ---------- */}
                            {/* {formData.type === "image" && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                                        Size Chart Image <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <MediaLibrary
                                        value={formData.image ? [formData.image] : []}
                                        multiple={false}
                                        maxFiles={1}
                                        buttonText="Upload Size Chart"
                                        onChange={(images) => {
                                            console.log("MediaLibrary onChange images:", images);
                                            setFormData((prev) => ({
                                                ...prev,
                                                image: images?.[0] || "",
                                            }));
                                        }}
                                    />
                                </div>
                            )} */}
                            {formData.type === "image" && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                                        Size Chart Image <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <MediaLibrary
                                        value={formData.image ? [formData.image] : []}
                                        multiple={false}
                                        maxFiles={1}
                                        buttonText="Upload Size Chart"
                                        onChange={(images) => {
                                            const first = Array.isArray(images) ? images[0] : images;
                                            const url =
                                                typeof first === "string"
                                                    ? first
                                                    : first?.url || first?.secure_url || "";

                                            setFormData((prev) => ({ ...prev, image: url }));
                                        }}
                                    />

                                    {/* Optional: Preview */}
                                    {formData.image && (
                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            className="mt-3 h-32 w-auto rounded-lg border object-contain"
                                        />
                                    )}
                                </div>
                            )}

                            {/* ---------- CUSTOM TYPE BUILDER ---------- */}
                            {formData.type === "custom" && (
                                <SizeChartBuilder
                                    disabled={saving}
                                    headers={formData.headers}
                                    rows={formData.rows}
                                    unit={formData.unit}
                                    onChange={(updates) =>
                                        setFormData((prev) => ({ ...prev, ...updates }))
                                    }
                                />
                            )}

                            {/* Name */}

                            <div>
                                <label
                                    htmlFor="size-chart-name"
                                    className="mb-2 block text-sm font-medium text-[var(--text)]"
                                >
                                    Size Chart Name
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    id="size-chart-name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Men T-Shirt Size Chart"
                                    disabled={saving}
                                    className="
                    w-full
                    rounded-lg
                    border
                    border-gray-200
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    text-[var(--text)]
                    outline-none
                    transition
                    focus:border-gray-400
                    dark:border-white/10
                    dark:bg-white/5
                    dark:focus:border-white/30
                  "
                                />
                            </div>

                            {/* Description */}

                            <div>
                                <label
                                    htmlFor="size-chart-description"
                                    className="mb-2 block text-sm font-medium text-[var(--text)]"
                                >
                                    Description
                                </label>

                                <textarea
                                    id="size-chart-description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Optional description..."
                                    rows={3}
                                    disabled={saving}
                                    className="
                    w-full
                    resize-none
                    rounded-lg
                    border
                    border-gray-200
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    text-[var(--text)]
                    outline-none
                    transition
                    focus:border-gray-400
                    dark:border-white/10
                    dark:bg-white/5
                    dark:focus:border-white/30
                  "
                                />
                            </div>


                            {/* Footer */}

                            <div className="flex justify-end gap-3 border-t border-gray-200 pt-5 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={saving}
                                    className="
                    rounded-lg
                    border
                    border-gray-200
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-[var(--text)]
                    transition
                    hover:bg-gray-50
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    dark:border-white/10
                    dark:hover:bg-white/10
                  "
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="
                    inline-flex
                    min-w-[120px]
                    items-center
                    justify-center
                    rounded-lg
                    bg-black
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-white
                    transition
                    hover:bg-gray-800
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    dark:bg-white
                    dark:text-black
                    dark:hover:bg-gray-200
                  "
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingChart
                                            ? "Update"
                                            : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =====================================
          Delete Confirmation
      ====================================== */}

            {deleteModalOpen && (
                <div
                    className="
            fixed
            inset-0
            z-[110]
            flex
            items-center
            justify-center
            bg-black/50
            p-4
            backdrop-blur-sm
          "
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            handleCloseDeleteModal();
                        }
                    }}
                >
                    <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-[#1c1c1d]">
                        <h2 className="text-lg font-semibold text-[var(--text)]">
                            Deactivate Size Chart?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                            Are you sure you want to deactivate{" "}
                            <span className="font-medium text-[var(--text)]">
                                "{deletingChart?.name}"
                            </span>
                            ? It will no longer appear when creating a
                            new product.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCloseDeleteModal}
                                disabled={deleting}
                                className="
                  rounded-lg
                  border
                  border-gray-200
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-[var(--text)]
                  dark:border-white/10
                "
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="
                  rounded-lg
                  bg-red-600
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-red-700
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
                            >
                                {deleting
                                    ? "Deactivating..."
                                    : "Deactivate"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SizeCharts;