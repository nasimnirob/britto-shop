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
  categoryId: "",
  name: "",
  image: "",
  isActive: true,
};

const SubCategories = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [productTypesLoading, setProductTypesLoading] =
    useState(true);
  const [categoriesLoading, setCategoriesLoading] =
    useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [filterProductType, setFilterProductType] =
    useState("");

  const [filterCategory, setFilterCategory] =
    useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [editingSubCategory, setEditingSubCategory] =
    useState(null);

  const [formData, setFormData] =
    useState(initialForm);


  // =========================
  // FETCH PRODUCT TYPES
  // =========================

  const fetchProductTypes = async () => {
    try {

      setProductTypesLoading(true);

      const res =
        await fetch(`${API_URL}/product-types`);

      if (!res.ok) {
        throw new Error(
          "Failed to fetch product types"
        );
      }

      const data =
        await res.json();

      setProductTypes(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Product types fetch error:",
        error
      );

    } finally {

      setProductTypesLoading(false);
    }
  };


  // =========================
  // FETCH CATEGORIES
  // =========================

  const fetchCategories = async (
    productTypeId
  ) => {

    if (!productTypeId) {
      setCategories([]);
      return;
    }

    try {

      setCategoriesLoading(true);

      const res =
        await fetch(
          `${API_URL}/categories?productTypeId=${productTypeId}`
        );

      if (!res.ok) {
        throw new Error(
          "Failed to fetch categories"
        );
      }

      const data =
        await res.json();

      setCategories(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Categories fetch error:",
        error
      );

      setCategories([]);

    } finally {

      setCategoriesLoading(false);
    }
  };


  // =========================
  // FETCH SUB CATEGORIES
  // =========================

  const fetchSubCategories = async () => {

    try {

      setLoading(true);

      const params =
        new URLSearchParams();

      if (filterProductType) {
        params.set(
          "productTypeId",
          filterProductType
        );
      }

      if (filterCategory) {
        params.set(
          "categoryId",
          filterCategory
        );
      }

      const query =
        params.toString()
          ? `?${params.toString()}`
          : "";

      const res =
        await fetch(
          `${API_URL}/sub-categories${query}`
        );

      if (!res.ok) {
        throw new Error(
          "Failed to fetch sub categories"
        );
      }

      const data =
        await res.json();

      setSubCategories(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Sub categories fetch error:",
        error
      );

      setSubCategories([]);

    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProductTypes();
  }, []);


  useEffect(() => {

    fetchCategories(
      filterProductType
    );

    setFilterCategory("");

  }, [filterProductType]);


  useEffect(() => {
    fetchSubCategories();
  }, [
    filterProductType,
    filterCategory,
  ]);


  // =========================
  // SEARCH
  // =========================

  const filteredSubCategories =
    useMemo(() => {

      const searchText =
        search
          .trim()
          .toLowerCase();

      if (!searchText) {
        return subCategories;
      }

      return subCategories.filter(
        (item) =>
          item.name
            ?.toLowerCase()
            .includes(searchText)
      );

    }, [
      subCategories,
      search,
    ]);


  // =========================
  // LOAD CATEGORIES
  // =========================

  const handleProductTypeChange = async (
    productTypeId
  ) => {

    setFormData((prev) => ({
      ...prev,
      productTypeId,
      categoryId: "",
    }));

    await fetchCategories(
      productTypeId
    );
  };


  // =========================
  // ADD
  // =========================

  const handleAdd = () => {

    setEditingSubCategory(null);

    setFormData({
      ...initialForm,
      productTypeId:
        filterProductType || "",
      categoryId:
        filterCategory || "",
    });

    if (filterProductType) {
      fetchCategories(
        filterProductType
      );
    }

    setModalOpen(true);
  };


  // =========================
  // EDIT
  // =========================

  const handleEdit = async (
    subCategory
  ) => {

    setEditingSubCategory(
      subCategory
    );

    setFormData({
      productTypeId:
        subCategory.productTypeId || "",

      categoryId:
        subCategory.categoryId || "",

      name:
        subCategory.name || "",

      image:
        subCategory.image || "",

      isActive:
        subCategory.isActive ?? true,
    });

    await fetchCategories(
      subCategory.productTypeId
    );

    setModalOpen(true);
  };


  // =========================
  // CLOSE
  // =========================

  const closeModal = () => {

    if (saving) return;

    setModalOpen(false);

    setEditingSubCategory(null);

    setFormData(
      initialForm
    );
  };


  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };


  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    const cleanName =
      formData.name.trim();


    if (!formData.productTypeId) {
      alert(
        "Please select a product type."
      );
      return;
    }

    if (!formData.categoryId) {
      alert(
        "Please select a category."
      );
      return;
    }

    if (!cleanName) {
      alert(
        "Sub category name is required."
      );
      return;
    }


    try {

      setSaving(true);

      const payload = {

        productTypeId:
          formData.productTypeId,

        categoryId:
          formData.categoryId,

        name:
          cleanName,

        image:
          formData.image.trim(),

        isActive:
          formData.isActive,
      };


      const url =
        editingSubCategory
          ? `${API_URL}/sub-categories/${editingSubCategory._id}`
          : `${API_URL}/sub-categories`;


      const method =
        editingSubCategory
          ? "PATCH"
          : "POST";


      const res =
        await fetch(url, {

          method,

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(payload),
        });


      const data =
        await res.json();


      if (!res.ok) {
        throw new Error(
          data.message ||
          "Something went wrong"
        );
      }


      closeModal();

      await fetchSubCategories();

    } catch (error) {

      console.error(
        "Sub category save error:",
        error
      );

      alert(error.message);

    } finally {

      setSaving(false);
    }
  };


  // =========================
  // DELETE
  // =========================

  const handleDelete = async (
    subCategory
  ) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${subCategory.name}"?`
      );

    if (!confirmed) return;


    try {

      const res =
        await fetch(
          `${API_URL}/sub-categories/${subCategory._id}`,
          {
            method: "DELETE",
          }
        );


      const data =
        await res.json();


      if (!res.ok) {
        throw new Error(
          data.message ||
          "Failed to delete sub category"
        );
      }


      await fetchSubCategories();

    } catch (error) {

      console.error(
        "Sub category delete error:",
        error
      );

      alert(error.message);
    }
  };


  // =========================
  // TOGGLE STATUS
  // =========================

  const handleToggleActive = async (
    subCategory
  ) => {

    try {

      const res =
        await fetch(
          `${API_URL}/sub-categories/${subCategory._id}`,
          {

            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                isActive:
                  !subCategory.isActive,
              }),
          }
        );


      const data =
        await res.json();


      if (!res.ok) {
        throw new Error(
          data.message ||
          "Failed to update status"
        );
      }


      await fetchSubCategories();

    } catch (error) {

      console.error(
        "Sub category status error:",
        error
      );

      alert(error.message);
    }
  };


  // =========================
  // NAME HELPERS
  // =========================

  const getProductTypeName = (
    productTypeId
  ) => {

    const type =
      productTypes.find(
        (item) =>
          String(item._id) ===
          String(productTypeId)
      );

    return (
      type?.name ||
      "Unknown"
    );
  };


  const getCategoryName = (
    categoryId
  ) => {

    const category =
      categories.find(
        (item) =>
          String(item._id) ===
          String(categoryId)
      );

    return (
      category?.name ||
      "Unknown"
    );
  };


  return (
    <div className="w-full p-4 md:p-6">

      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Sub Categories
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage sub categories and their category relationships.
          </p>

        </div>


        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >

          <Plus size={18} />

          Add Sub Category

        </button>

      </div>


      {/* FILTERS */}

      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">

        {/* SEARCH */}

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search sub category..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />

        </div>


        {/* PRODUCT TYPE */}

        <select
          value={filterProductType}
          onChange={(e) =>
            setFilterProductType(
              e.target.value
            )
          }
          className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >

          <option value="">
            All Product Types
          </option>

          {productTypes.map(
            (type) => (
              <option
                key={type._id}
                value={type._id}
              >
                {type.name}
              </option>
            )
          )}

        </select>


        {/* CATEGORY */}

        <select
          value={filterCategory}
          onChange={(e) =>
            setFilterCategory(
              e.target.value
            )
          }
          disabled={!filterProductType}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >

          <option value="">
            {filterProductType
              ? "All Categories"
              : "Select Product Type First"}
          </option>

          {categories.map(
            (category) => (
              <option
                key={category._id}
                value={category._id}
              >
                {category.name}
              </option>
            )
          )}

        </select>

      </div>


      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[950px] text-left">

            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60">

              <tr>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                  Sub Category
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                  Product Type
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                  Category
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

                  <td
                    colSpan="5"
                    className="px-5 py-12 text-center"
                  >

                    <Loader2
                      size={24}
                      className="mx-auto animate-spin text-gray-400"
                    />

                  </td>

                </tr>

              ) : filteredSubCategories.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    No sub categories found.
                  </td>

                </tr>

              ) : (

                filteredSubCategories.map(
                  (item) => (

                    <tr
                      key={item._id}
                      className="transition hover:bg-gray-50 dark:hover:bg-gray-800/40"
                    >

                      {/* SUB CATEGORY */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">

                            {item.image ? (

                              <img
                                src={item.image}
                                alt={item.name}
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
                              {item.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              {item.slug}
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* PRODUCT TYPE */}

                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">

                        {getProductTypeName(
                          item.productTypeId
                        )}

                      </td>


                      {/* CATEGORY */}

                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">

                        {getCategoryName(
                          item.categoryId
                        )}

                      </td>


                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleActive(
                              item
                            )
                          }
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                            item.isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >

                          <Power size={13} />

                          {item.isActive
                            ? "Active"
                            : "Inactive"}

                        </button>

                      </td>


                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                item
                              )
                            }
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-black dark:hover:bg-gray-800 dark:hover:text-white"
                          >

                            <Pencil
                              size={17}
                            />

                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                item
                              )
                            }
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                          >

                            <Trash2
                              size={17}
                            />

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* MODAL */}

      {modalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl dark:bg-gray-900">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">

              <div>

                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">

                  {editingSubCategory
                    ? "Edit Sub Category"
                    : "Add Sub Category"}

                </h2>

                <p className="mt-0.5 text-xs text-gray-500">

                  Create and manage product sub categories.

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


            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-5"
            >

              <div className="space-y-4">

                {/* PRODUCT TYPE */}

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Product Type
                  </label>

                  <select
                    name="productTypeId"
                    value={
                      formData.productTypeId
                    }
                    onChange={(e) =>
                      handleProductTypeChange(
                        e.target.value
                      )
                    }
                    disabled={
                      productTypesLoading
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >

                    <option value="">
                      {productTypesLoading
                        ? "Loading..."
                        : "Select Product Type"}
                    </option>

                    {productTypes.map(
                      (type) => (

                        <option
                          key={type._id}
                          value={type._id}
                        >
                          {type.name}
                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* CATEGORY */}

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>

                  <select
                    name="categoryId"
                    value={
                      formData.categoryId
                    }
                    onChange={handleChange}
                    disabled={
                      !formData.productTypeId ||
                      categoriesLoading
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >

                    <option value="">

                      {categoriesLoading
                        ? "Loading..."
                        : formData.productTypeId
                        ? "Select Category"
                        : "Select Product Type First"}

                    </option>

                    {categories.map(
                      (category) => (

                        <option
                          key={category._id}
                          value={category._id}
                        >
                          {category.name}
                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* NAME */}

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sub Category Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={
                      formData.name
                    }
                    onChange={handleChange}
                    placeholder="e.g. Half Sleeve T-shirt"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />

                </div>


                {/* IMAGE */}

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Image URL
                  </label>

                  <input
                    type="url"
                    name="image"
                    value={
                      formData.image
                    }
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />

                </div>


                {/* STATUS */}

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">

                  <div>

                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Active Status
                    </p>

                    <p className="text-xs text-gray-500">
                      Show this sub category on the storefront.
                    </p>

                  </div>


                  <input
                    type="checkbox"
                    name="isActive"
                    checked={
                      formData.isActive
                    }
                    onChange={handleChange}
                    className="h-4 w-4"
                  />

                </label>

              </div>


              {/* BUTTONS */}

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
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {editingSubCategory
                    ? "Update Sub Category"
                    : "Create Sub Category"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default SubCategories;