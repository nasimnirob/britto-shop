import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const emptyForm = {
  name: "",
  hexCode: "#000000",
  isActive: true,
  sortOrder: "",
};

const ProductColors = () => {
  const [colors, setColors] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState(null);

  const [form, setForm] = useState(emptyForm);

  // =========================
  // Fetch Colors
  // =========================

  const fetchColors = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/colors`);

      if (!response.ok) {
        throw new Error("Failed to fetch colors");
      }

      const data = await response.json();

      setColors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load colors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  // =========================
  // Search
  // =========================

  const filteredColors = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return colors;
    }

    return colors.filter(
      (color) =>
        color.name?.toLowerCase().includes(searchValue) ||
        color.slug?.toLowerCase().includes(searchValue) ||
        color.hexCode?.toLowerCase().includes(searchValue)
    );
  }, [colors, search]);

  // =========================
  // Open Create Modal
  // =========================

  const handleCreate = () => {
    setEditingColor(null);

    setForm({
      ...emptyForm,
      sortOrder: colors.length + 1,
    });

    setIsModalOpen(true);
  };

  // =========================
  // Open Edit Modal
  // =========================

  const handleEdit = (color) => {
    setEditingColor(color);

    setForm({
      name: color.name || "",
      hexCode: color.hexCode || "#000000",
      isActive: color.isActive ?? true,
      sortOrder: color.sortOrder ?? "",
    });

    setIsModalOpen(true);
  };

  // =========================
  // Close Modal
  // =========================

  const handleCloseModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingColor(null);
    setForm(emptyForm);
  };

  // =========================
  // Input Change
  // =========================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================
  // Submit
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = form.name.trim();

    if (!name) {
      toast.error("Color name is required");
      return;
    }

    if (!form.hexCode) {
      toast.error("Color code is required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name,
        hexCode: form.hexCode,
        isActive: form.isActive,
        sortOrder:
          form.sortOrder === ""
            ? undefined
            : Number(form.sortOrder),
      };

      const url = editingColor
        ? `${API_URL}/colors/${editingColor._id}`
        : `${API_URL}/colors`;

      const method = editingColor ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      toast.success(
        editingColor
          ? "Color updated successfully"
          : "Color created successfully"
      );

      handleCloseModal();
      fetchColors();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Delete
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this color?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response = await fetch(`${API_URL}/colors/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete color");
      }

      toast.success("Color deleted successfully");

      setColors((prev) => prev.filter((color) => color._id !== id));
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to delete color");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full p-4 md:p-6">
      {/* =========================
          Header
      ========================= */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Colors
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage product colors from here.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          <Plus size={18} />
          Add Color
        </button>
      </div>

      {/* =========================
          Search
      ========================= */}

      <div className="mb-5">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search color..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* =========================
          Table
      ========================= */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  #
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Color
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Hex Code
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Sort Order
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    Loading colors...
                  </td>
                </tr>
              ) : filteredColors.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    No colors found.
                  </td>
                </tr>
              ) : (
                filteredColors.map((color, index) => (
                  <tr
                    key={color._id}
                    className="transition hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  >
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>

                    {/* Color */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-9 w-9 rounded-full border border-gray-300 shadow-sm"
                          style={{
                            backgroundColor:
                              color.hexCode || "#000000",
                          }}
                        />

                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {color.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            {color.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Hex */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-5 w-5 rounded border border-gray-300"
                          style={{
                            backgroundColor:
                              color.hexCode || "#000000",
                          }}
                        />

                        <span className="font-mono text-sm text-gray-600 dark:text-gray-300">
                          {color.hexCode || "-"}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {color.isActive ? (
                        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Sort */}
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {color.sortOrder ?? "-"}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(color)}
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(color._id)
                          }
                          disabled={deletingId === color._id}
                          className="rounded-lg border border-red-200 p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          {deletingId === color._id ? (
                            <span className="block h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && (
          <div className="border-t border-gray-200 px-5 py-3 text-sm text-gray-500 dark:border-gray-800">
            Showing {filteredColors.length} of {colors.length} colors
          </div>
        )}
      </div>

      {/* =========================
          Modal
      ========================= */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl dark:bg-gray-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingColor ? "Edit Color" : "Add Color"}
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  {editingColor
                    ? "Update color information."
                    : "Create a new product color."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-5 p-5">
                {/* Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Color Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Black"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Hex */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hex Code
                  </label>

                  <div className="flex gap-3">
                    <input
                      type="color"
                      name="hexCode"
                      value={form.hexCode || "#000000"}
                      onChange={handleChange}
                      className="h-11 w-14 cursor-pointer rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800"
                    />

                    <input
                      type="text"
                      name="hexCode"
                      value={form.hexCode}
                      onChange={handleChange}
                      placeholder="#000000"
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 font-mono text-sm text-gray-900 outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
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
                    value={form.sortOrder}
                    onChange={handleChange}
                    placeholder="1"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Active */}
                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Active
                    </p>

                    <p className="text-xs text-gray-500">
                      Available for product variants
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 cursor-pointer"
                  />
                </label>

                {/* Preview */}
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Preview
                  </p>

                  <div className="flex items-center gap-3">
                    <span
                      className="h-10 w-10 rounded-full border border-gray-300 shadow-sm"
                      style={{
                        backgroundColor:
                          form.hexCode || "#000000",
                      }}
                    />

                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {form.name || "Color Name"}
                      </p>

                      <p className="font-mono text-xs text-gray-500">
                        {form.hexCode || "#000000"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-gray-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  {saving
                    ? "Saving..."
                    : editingColor
                      ? "Update Color"
                      : "Create Color"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductColors;