import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import {
    ArrowLeft,
    Plus,
    Trash2,
    X,
    Save,
    Loader2,
    RefreshCw,
    Package,
    ChevronDown,
    ImageIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import MediaLibrary from "../../Component/Cloudinary/MediaLibrary";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

/* =============================================================
   HELPERS
============================================================= */

const makeSkuPart = (value, maxLength = 12) => {
    return String(value || "")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .substring(0, maxLength);
};

const generateSKU = ({ productName, colorName, sizeName, index }) => {
    const productPart = makeSkuPart(productName, 18);
    const colorPart = makeSkuPart(colorName, 5);
    const sizePart = makeSkuPart(sizeName, 5);
    const numberPart = String(index).padStart(3, "0");

    return [productPart, colorPart, sizePart, numberPart]
        .filter(Boolean)
        .join("-");
};

const variationTypes = [
    { value: "none", label: "No Variation" },
    { value: "color", label: "Color Only" },
    { value: "size", label: "Size Only" },
    { value: "color-size", label: "Color + Size" },
];

const initialForm = {
    name: "",
    description: "",
    brand: "",

    productTypeId: "",
    categoryId: "",
    subCategoryId: "",

    thumbnail: "",
    images: [],

    material: "",
    careInstructions: "",
    sizeChartId: "",
    weight: "",

    tags: [],

    isFeatured: false,
    isNewArrival: false,
    isActive: true,

    mrp: "",
    sellingPrice: "",
    quantity: "",
};

/* =============================================================
   COMPONENT
============================================================= */

function ProductEdit() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [productTypes, setProductTypes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);

    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [sizeCharts, setSizeCharts] = useState([]);
    const [loadingSizeCharts, setLoadingSizeCharts] = useState(false);

    const [formData, setFormData] = useState(initialForm);

    /* -------------------------------------------------------------
       VARIATION STATES
    ------------------------------------------------------------- */

    const [variationType, setVariationType] = useState("none");

    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);

    const [colorImages, setColorImages] = useState({});
    const [sizeImages, setSizeImages] = useState({});
    const [showSizeImages, setShowSizeImages] = useState(false);

    const [variations, setVariations] = useState([]);

    const [tagInput, setTagInput] = useState("");

    /* -------------------------------------------------------------
       LOAD PRODUCT
    ------------------------------------------------------------- */

    useEffect(() => {
        if (!id) return;
        loadProduct();
        // eslint-disable-next-line
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);

            const [
                productRes,
                productTypesRes,
                colorsRes,
                sizesRes,
                sizeChartsRes,
            ] = await Promise.all([
                fetch(`${API_URL}/products/${id}`),
                fetch(`${API_URL}/product-types`),
                fetch(`${API_URL}/colors?isActive=true`),
                fetch(`${API_URL}/sizes?isActive=true`),
                fetch(`${API_URL}/size-charts`),
            ]);

            if (!productRes.ok) {
                throw new Error("Failed to load product");
            }

            const product = await productRes.json();

            const productTypesData = productTypesRes.ok
                ? await productTypesRes.json()
                : [];

            const colorsData = colorsRes.ok
                ? await colorsRes.json()
                : [];

            const sizesData = sizesRes.ok
                ? await sizesRes.json()
                : [];

            const sizeChartsData = sizeChartsRes.ok
                ? (await sizeChartsRes.json())?.data || []
                : [];

            setProductTypes(
                Array.isArray(productTypesData) ? productTypesData : []
            );
            setColors(Array.isArray(colorsData) ? colorsData : []);
            setSizes(Array.isArray(sizesData) ? sizesData : []);
            setSizeCharts(
                Array.isArray(sizeChartsData) ? sizeChartsData : []
            );

            /* -------- categories -------- */

            let categoriesData = [];

            if (product.productTypeId) {
                const res = await fetch(
                    `${API_URL}/categories?productTypeId=${product.productTypeId}`
                );

                if (res.ok) categoriesData = await res.json();
            }

            setCategories(categoriesData);

            /* -------- sub categories -------- */

            let subCategoriesData = [];

            if (product.productTypeId && product.categoryId) {
                const res = await fetch(
                    `${API_URL}/sub-categories?productTypeId=${product.productTypeId}&categoryId=${product.categoryId}`
                );

                if (res.ok) subCategoriesData = await res.json();
            }

            setSubCategories(subCategoriesData);

            /* -------- variation type -------- */

            const vType = product.variationType || "none";
            setVariationType(vType);

            /* -------- main form -------- */

            setFormData({
                name: product.name || "",
                description: product.description || "",
                brand: product.brand || "",

                productTypeId: product.productTypeId || "",
                categoryId: product.categoryId || "",
                subCategoryId: product.subCategoryId || "",

                thumbnail: product.thumbnail || "",

                images: Array.isArray(product.images)
                    ? product.images
                    : [],

                material: product.material || "",
                careInstructions: product.careInstructions || "",
                sizeChartId:
                    product.sizeChartId ||
                    product.sizeChart?._id ||
                    "",
                weight: product.weight || "",

                tags: Array.isArray(product.tags) ? product.tags : [],

                isFeatured: Boolean(product.isFeatured),
                isNewArrival: Boolean(product.isNewArrival),
                isActive:
                    product.isActive !== undefined
                        ? Boolean(product.isActive)
                        : true,

                mrp: product.price?.mrp ?? "",
                sellingPrice: product.price?.sellingPrice ?? "",
                quantity:
                    product.totalStock !== undefined
                        ? product.totalStock
                        : "",
            });

            /* ---------------------------------------------------------
               EXISTING VARIANTS
            --------------------------------------------------------- */

            const existingVariants = Array.isArray(product.variants)
                ? product.variants
                : [];

            /* -------- selected colors -------- */

            const colorIds = [
                ...new Set(
                    existingVariants
                        .map((variant) => variant.colorId)
                        .filter(Boolean)
                ),
            ];

            const colorOptions = colorIds
                .map((colorId) => {
                    const color = colorsData.find(
                        (item) => item._id === colorId
                    );

                    if (!color) return null;

                    return {
                        value: color._id,
                        label: color.name,
                        hexCode: color.hexCode || "",
                    };
                })
                .filter(Boolean);

            setSelectedColors(colorOptions);

            /* -------- selected sizes -------- */

            const sizeIds = [
                ...new Set(
                    existingVariants.flatMap((variant) =>
                        Array.isArray(variant.sizes)
                            ? variant.sizes
                                .map((size) => size.sizeId)
                                .filter(Boolean)
                            : []
                    )
                ),
            ];

            const sizeOptions = sizeIds
                .map((sizeId) => {
                    const size = sizesData.find(
                        (item) => item._id === sizeId
                    );

                    if (!size) return null;

                    return {
                        value: size._id,
                        label: size.name,
                        group: size.group,
                    };
                })
                .filter(Boolean);

            setSelectedSizes(sizeOptions);

            /* -------- color images -------- */

            const existingColorImages = {};

            existingVariants.forEach((variant) => {
                if (variant.colorId) {
                    existingColorImages[variant.colorId] =
                        Array.isArray(variant.images)
                            ? variant.images
                            : [];
                }
            });

            setColorImages(existingColorImages);

            /* -------- size images -------- */

            const existingSizeImages = {};

            existingVariants.forEach((variant) => {
                if (!Array.isArray(variant.sizes)) return;

                variant.sizes.forEach((size) => {
                    const key = `${variant.colorId || "none"}-${size.sizeId || "none"
                        }`;

                    if (
                        Array.isArray(size.images) &&
                        size.images.length > 0
                    ) {
                        existingSizeImages[key] = size.images;
                    }
                });
            });

            setSizeImages(existingSizeImages);

            /* ---------------------------------------------------------
               FLATTEN VARIANTS FOR UI TABLE
            --------------------------------------------------------- */

            const rows = [];

            existingVariants.forEach((variant) => {
                if (!Array.isArray(variant.sizes)) return;

                variant.sizes.forEach((size) => {
                    const color = colorsData.find(
                        (item) => item._id === variant.colorId
                    );

                    const sizeData = sizesData.find(
                        (item) => item._id === size.sizeId
                    );

                    rows.push({
                        key: `${variant.colorId || "none"}-${size.sizeId || "none"
                            }`,

                        colorId: variant.colorId || null,
                        colorName: color?.name || "",

                        sizeId: size.sizeId || null,
                        sizeName: sizeData?.name || "",

                        mrp: Number(size.price?.mrp ?? 0),
                        sellingPrice: Number(
                            size.price?.sellingPrice ?? 0
                        ),
                        quantity: Number(size.stock ?? 0),

                        sku: size.sku || "",
                    });
                });
            });

            setVariations(rows);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to load product");
        } finally {
            setLoading(false);
        }
    };

    /* -------------------------------------------------------------
       PRODUCT TYPE
    ------------------------------------------------------------- */

    const handleProductTypeChange = async (event) => {
        const productTypeId = event.target.value;

        setFormData((prev) => ({
            ...prev,
            productTypeId,
            categoryId: "",
            subCategoryId: "",
        }));

        setCategories([]);
        setSubCategories([]);

        if (!productTypeId) return;

        try {
            const res = await fetch(
                `${API_URL}/categories?productTypeId=${productTypeId}`
            );

            if (!res.ok) {
                throw new Error("Failed to load categories");
            }

            setCategories(await res.json());
        } catch (error) {
            toast.error("Failed to load categories");
        }
    };

    /* -------------------------------------------------------------
       CATEGORY
    ------------------------------------------------------------- */

    const handleCategoryChange = async (event) => {
        const categoryId = event.target.value;

        setFormData((prev) => ({
            ...prev,
            categoryId,
            subCategoryId: "",
        }));

        setSubCategories([]);

        if (!categoryId) return;

        try {
            const { productTypeId } = formData;

            const res = await fetch(
                `${API_URL}/sub-categories?productTypeId=${productTypeId}&categoryId=${categoryId}`
            );

            if (!res.ok) {
                throw new Error("Failed to load sub categories");
            }

            setSubCategories(await res.json());
        } catch (error) {
            toast.error("Failed to load sub categories");
        }
    };

    /* -------------------------------------------------------------
       GENERAL INPUT
    ------------------------------------------------------------- */

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    /* -------------------------------------------------------------
       VARIATION TYPE CHANGE
    ------------------------------------------------------------- */

    const handleVariationTypeChange = (type) => {
        setVariationType(type);

        setVariations([]);
        setSelectedColors([]);
        setSelectedSizes([]);
        setColorImages({});
        setSizeImages({});
        setShowSizeImages(false);
    };

    /* -------------------------------------------------------------
       THUMBNAIL
    ------------------------------------------------------------- */

    const handleThumbnailChange = (images) => {
        const first = Array.isArray(images) ? images[0] : images;
        const url =
            typeof first === "string"
                ? first
                : first?.url || first?.secure_url || "";

        setFormData((prev) => ({ ...prev, thumbnail: url }));
    };

    /* -------------------------------------------------------------
       GALLERY IMAGES
    ------------------------------------------------------------- */

    const handleGalleryChange = (images) => {
        const normalized = Array.isArray(images)
            ? images
            : images
                ? [images]
                : [];

        setFormData((prev) => ({
            ...prev,
            images: normalized
                .map((img) =>
                    typeof img === "string"
                        ? img
                        : img?.url || img?.secure_url || ""
                )
                .filter(Boolean),
        }));
    };

    const removeProductImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    /* -------------------------------------------------------------
       SELECT OPTIONS
    ------------------------------------------------------------- */

    const colorOptions = useMemo(() => {
        return colors
            .filter((color) => color.isActive !== false)
            .map((color) => ({
                value: color._id,
                label: color.name,
                hexCode: color.hexCode || "",
            }));
    }, [colors]);

    const sizeOptions = useMemo(() => {
        return sizes
            .filter((size) => size.isActive !== false)
            .map((size) => ({
                value: size._id,
                label: size.name,
                group: size.group,
            }));
    }, [sizes]);

    const sizeChartOptions = useMemo(() => {
        return sizeCharts.map((chart) => ({
            value: String(chart._id),
            label: chart.name,
            type: chart.type || "image",
            chart,
        }));
    }, [sizeCharts]);

    const selectedSizeChart = useMemo(() => {
        return sizeCharts.find(
            (chart) =>
                String(chart._id) === String(formData.sizeChartId)
        );
    }, [sizeCharts, formData.sizeChartId]);

    /* -------------------------------------------------------------
       COLOR IMAGES (MediaLibrary)
    ------------------------------------------------------------- */

    const handleColorImagesChange = (colorId, images) => {
        const normalized = Array.isArray(images)
            ? images
            : images
                ? [images]
                : [];

        setColorImages((prev) => ({
            ...prev,
            [colorId]: normalized
                .map((img) =>
                    typeof img === "string"
                        ? img
                        : img?.url || img?.secure_url || ""
                )
                .filter(Boolean),
        }));
    };

    const removeColorImage = (colorId, index) => {
        setColorImages((prev) => ({
            ...prev,
            [colorId]: (prev[colorId] || []).filter(
                (_, i) => i !== index
            ),
        }));
    };

    /* -------------------------------------------------------------
       SIZE IMAGES (MediaLibrary)
    ------------------------------------------------------------- */

    const handleSizeImagesChange = (variationKey, images) => {
        const normalized = Array.isArray(images)
            ? images
            : images
                ? [images]
                : [];

        setSizeImages((prev) => ({
            ...prev,
            [variationKey]: normalized
                .map((img) =>
                    typeof img === "string"
                        ? img
                        : img?.url || img?.secure_url || ""
                )
                .filter(Boolean),
        }));
    };

    const removeSizeImage = (variationKey, index) => {
        setSizeImages((prev) => ({
            ...prev,
            [variationKey]: (prev[variationKey] || []).filter(
                (_, i) => i !== index
            ),
        }));
    };

    /* -------------------------------------------------------------
       GENERATE VARIATIONS
    ------------------------------------------------------------- */

    const generateVariations = () => {
        const type = variationType;

        if (type === "none") {
            toast.error("No variation type — no need to generate");
            return;
        }

        if (type === "color") {
            if (selectedColors.length === 0) {
                toast.error("Please select at least one color");
                return;
            }

            const existingMap = new Map();
            variations.forEach((item) => {
                existingMap.set(item.key, item);
            });

            const generated = [];

            selectedColors.forEach((color, index) => {
                const key = `${color.value}-none`;
                const existing = existingMap.get(key);

                generated.push({
                    key,
                    colorId: color.value,
                    colorName: color.label,
                    sizeId: null,
                    sizeName: "",
                    mrp: existing?.mrp ?? Number(formData.mrp || 0),
                    sellingPrice:
                        existing?.sellingPrice ??
                        Number(formData.sellingPrice || 0),
                    quantity:
                        existing?.quantity ??
                        Number(formData.quantity || 0),
                    sku:
                        existing?.sku ||
                        generateSKU({
                            productName: formData.name,
                            colorName: color.label,
                            sizeName: "",
                            index: index + 1,
                        }),
                });
            });

            setVariations(generated);
            toast.success(`${generated.length} variations generated`);
            return;
        }

        if (type === "size") {
            if (selectedSizes.length === 0) {
                toast.error("Please select at least one size");
                return;
            }

            const existingMap = new Map();
            variations.forEach((item) => {
                existingMap.set(item.key, item);
            });

            const generated = [];

            selectedSizes.forEach((size, index) => {
                const key = `none-${size.value}`;
                const existing = existingMap.get(key);

                generated.push({
                    key,
                    colorId: null,
                    colorName: "",
                    sizeId: size.value,
                    sizeName: size.label,
                    mrp: existing?.mrp ?? Number(formData.mrp || 0),
                    sellingPrice:
                        existing?.sellingPrice ??
                        Number(formData.sellingPrice || 0),
                    quantity:
                        existing?.quantity ??
                        Number(formData.quantity || 0),
                    sku:
                        existing?.sku ||
                        generateSKU({
                            productName: formData.name,
                            colorName: "",
                            sizeName: size.label,
                            index: index + 1,
                        }),
                });
            });

            setVariations(generated);
            toast.success(`${generated.length} variations generated`);
            return;
        }

        if (type === "color-size") {
            if (selectedColors.length === 0) {
                toast.error("Please select at least one color");
                return;
            }

            if (selectedSizes.length === 0) {
                toast.error("Please select at least one size");
                return;
            }

            const existingMap = new Map();
            variations.forEach((item) => {
                existingMap.set(item.key, item);
            });

            const generated = [];
            let index = 1;

            selectedColors.forEach((color) => {
                selectedSizes.forEach((size) => {
                    const key = `${color.value}-${size.value}`;
                    const existing = existingMap.get(key);

                    generated.push({
                        key,
                        colorId: color.value,
                        colorName: color.label,
                        sizeId: size.value,
                        sizeName: size.label,
                        mrp: existing?.mrp ?? Number(formData.mrp || 0),
                        sellingPrice:
                            existing?.sellingPrice ??
                            Number(formData.sellingPrice || 0),
                        quantity:
                            existing?.quantity ??
                            Number(formData.quantity || 0),
                        sku:
                            existing?.sku ||
                            generateSKU({
                                productName: formData.name,
                                colorName: color.label,
                                sizeName: size.label,
                                index,
                            }),
                    });

                    index++;
                });
            });

            setVariations(generated);
            toast.success(`${generated.length} variations generated`);
        }
    };

    /* -------------------------------------------------------------
       UPDATE VARIATION
    ------------------------------------------------------------- */

    const updateVariation = (key, field, value) => {
        setVariations((prev) =>
            prev.map((item) => {
                if (item.key !== key) return item;

                return {
                    ...item,
                    [field]:
                        field === "mrp" ||
                            field === "sellingPrice" ||
                            field === "quantity"
                            ? Number(value)
                            : value,
                };
            })
        );
    };

    const removeVariation = (key) => {
        setVariations((prev) =>
            prev.filter((item) => item.key !== key)
        );
    };

    const clearVariations = () => {
        setVariations([]);
    };

    /* -------------------------------------------------------------
       TAGS
    ------------------------------------------------------------- */

    const addTag = () => {
        const tag = tagInput.trim();
        if (!tag) return;

        const exists = formData.tags.some(
            (item) => item.toLowerCase() === tag.toLowerCase()
        );

        if (exists) {
            setTagInput("");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            tags: [...prev.tags, tag],
        }));

        setTagInput("");
    };

    const removeTag = (index) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index),
        }));
    };

    /* -------------------------------------------------------------
       TOTAL STOCK
    ------------------------------------------------------------- */

    const totalStock = useMemo(() => {
        if (variationType === "none") {
            return Number(formData.quantity || 0);
        }

        return variations.reduce(
            (total, item) => total + Number(item.quantity || 0),
            0
        );
    }, [variationType, formData.quantity, variations]);

    /* -------------------------------------------------------------
       VALIDATION
    ------------------------------------------------------------- */

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error("Product name is required");
            return false;
        }

        if (!formData.productTypeId) {
            toast.error("Product Type is required");
            return false;
        }

        if (!formData.categoryId) {
            toast.error("Category is required");
            return false;
        }

        if (!formData.subCategoryId) {
            toast.error("Sub Category is required");
            return false;
        }

        if (!formData.thumbnail.trim()) {
            toast.error("Thumbnail is required");
            return false;
        }

        if (!formData.mrp || Number(formData.mrp) <= 0) {
            toast.error("Product MRP is required");
            return false;
        }

        if (
            !formData.sellingPrice ||
            Number(formData.sellingPrice) <= 0
        ) {
            toast.error("Product selling price is required");
            return false;
        }

        if (
            Number(formData.sellingPrice) > Number(formData.mrp)
        ) {
            toast.error(
                "Selling price cannot be greater than MRP"
            );
            return false;
        }

        if (variationType === "none") {
            if (
                formData.quantity === "" ||
                Number(formData.quantity) < 0
            ) {
                toast.error("Product stock is required");
                return false;
            }
        }

        if (variationType !== "none") {
            if (variations.length === 0) {
                toast.error("Generate at least one variation");
                return false;
            }

            const skuSet = new Set();

            for (const variation of variations) {
                if (!variation.sku || !variation.sku.trim()) {
                    toast.error(
                        `SKU missing for ${variation.colorName || "—"} / ${variation.sizeName || "—"
                        }`
                    );
                    return false;
                }

                if (
                    Number(variation.mrp) < 0 ||
                    Number(variation.sellingPrice) < 0 ||
                    Number(variation.quantity) < 0
                ) {
                    toast.error(
                        "Price and quantity cannot be negative"
                    );
                    return false;
                }

                if (
                    Number(variation.sellingPrice) >
                    Number(variation.mrp)
                ) {
                    toast.error(
                        `${variation.colorName || "—"
                        } / ${variation.sizeName || "—"
                        }: Selling price cannot be greater than MRP`
                    );
                    return false;
                }

                const sku = variation.sku.trim().toUpperCase();

                if (skuSet.has(sku)) {
                    toast.error(`Duplicate SKU: ${sku}`);
                    return false;
                }

                skuSet.add(sku);
            }
        }

        return true;
    };

    /* -------------------------------------------------------------
       BUILD BACKEND VARIANTS
    ------------------------------------------------------------- */

    const buildBackendVariants = () => {
        const grouped = {};

        variations.forEach((variation) => {
            const colorKey = variation.colorId || "no-color";

            if (!grouped[colorKey]) {
                grouped[colorKey] = {
                    colorId: variation.colorId || null,
                    images: variation.colorId
                        ? colorImages[variation.colorId] || []
                        : [],
                    sizes: [],
                };
            }

            grouped[colorKey].sizes.push({
                sizeId: variation.sizeId || null,
                images: sizeImages[variation.key] || [],
                sku: String(variation.sku || "")
                    .trim()
                    .toUpperCase(),
                price: {
                    mrp: Number(variation.mrp || 0),
                    sellingPrice: Number(
                        variation.sellingPrice || 0
                    ),
                    currency: "BDT",
                },
                stock: Number(variation.quantity || 0),
            });
        });

        return Object.values(grouped).map((variant) => ({
            ...variant,

            images: (variant.images || [])
                .map((image) => String(image).trim())
                .filter(Boolean),

            sizes: variant.sizes.map((size) => ({
                ...size,

                images: (size.images || [])
                    .map((image) => String(image).trim())
                    .filter(Boolean),
            })),
        }));
    };

    /* -------------------------------------------------------------
       SUBMIT
    ------------------------------------------------------------- */

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        try {
            setSaving(true);

            const variants =
                variationType === "none"
                    ? []
                    : buildBackendVariants();

            const payload = {
                name: formData.name.trim(),

                description: formData.description.trim(),

                brand: formData.brand.trim(),

                productTypeId: formData.productTypeId,
                categoryId: formData.categoryId,
                subCategoryId: formData.subCategoryId,

                thumbnail: formData.thumbnail.trim(),

                images: formData.images
                    .map((image) => image.trim())
                    .filter(Boolean),

                variants,

                price: {
                    mrp: Number(formData.mrp),
                    sellingPrice: Number(formData.sellingPrice),

                    discountPercent:
                        Number(formData.mrp) > 0
                            ? Math.round(
                                ((Number(formData.mrp) -
                                    Number(formData.sellingPrice)) /
                                    Number(formData.mrp)) *
                                100
                            )
                            : 0,

                    currency: "BDT",
                },

                material: formData.material.trim(),
                careInstructions: formData.careInstructions.trim(),
                sizeChartId: formData.sizeChartId || "",
                weight: formData.weight.trim(),

                tags: formData.tags
                    .map((tag) => tag.trim())
                    .filter(Boolean),

                totalStock,

                variationType,

                isFeatured: formData.isFeatured,
                isNewArrival: formData.isNewArrival,
                isActive: formData.isActive,
            };

            const res = await fetch(`${API_URL}/products/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message || "Failed to update product"
                );
            }

            toast.success("Product updated successfully");
            navigate("/admin/products");
        } catch (error) {
            console.error(error);
            toast.error(
                error.message || "Failed to update product"
            );
        } finally {
            setSaving(false);
        }
    };

    /* -------------------------------------------------------------
       SELECT STYLES
    ------------------------------------------------------------- */

    const selectStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: "42px",
            borderRadius: "8px",
            borderColor: state.isFocused ? "#9ca3af" : "#e5e7eb",
            boxShadow: "none",
            "&:hover": { borderColor: "#9ca3af" },
        }),

        multiValue: (provided) => ({
            ...provided,
            borderRadius: "5px",
            backgroundColor: "#f3f4f6",
        }),

        multiValueLabel: (provided) => ({
            ...provided,
            color: "#111827",
            fontSize: "13px",
        }),

        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? "#111827"
                : state.isFocused
                    ? "#f3f4f6"
                    : "white",
            color: state.isSelected ? "white" : "#111827",
            cursor: "pointer",
        }),
    };

    /* -------------------------------------------------------------
       LOADING
    ------------------------------------------------------------- */

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-500">
                    <Loader2 size={30} className="animate-spin" />
                    <p>Loading product...</p>
                </div>
            </div>
        );
    }

    /* -------------------------------------------------------------
       UI
    ------------------------------------------------------------- */

    return (
        <div className="w-full min-h-full bg-gray-50 dark:bg-[#111827] p-4 md:p-6">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/products")}
                        className={iconButtonClass}
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div>
                        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                            Edit Product
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Update product information, variations and
                            inventory
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className={infoBoxClass}>
                        Variations: <strong>{variations.length}</strong>
                    </div>
                    <div className={infoBoxClass}>
                        Total Stock: <strong>{totalStock}</strong>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* ================= BASIC INFO ================= */}

                <section className={sectionClass}>
                    <SectionTitle>Basic Information</SectionTitle>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className={labelClass}>
                                Product Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Brand</label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Fabrilife"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Weight</label>
                            <input
                                type="text"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="180-190g"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClass}>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={5}
                                className={`${inputClass} h-auto py-3`}
                            />
                        </div>
                    </div>
                </section>

                {/* ================= CLASSIFICATION ================= */}

                <section className={sectionClass}>
                    <SectionTitle>Product Classification</SectionTitle>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <label className={labelClass}>
                                Product Type *
                            </label>
                            <select
                                value={formData.productTypeId}
                                onChange={handleProductTypeChange}
                                className={inputClass}
                            >
                                <option value="">Select Product Type</option>
                                {productTypes
                                    .filter((item) => item.isActive !== false)
                                    .map((item) => (
                                        <option key={item._id} value={item._id}>
                                            {item.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Category *</label>
                            <select
                                value={formData.categoryId}
                                onChange={handleCategoryChange}
                                disabled={!formData.productTypeId}
                                className={`${inputClass} disabled:opacity-50`}
                            >
                                <option value="">Select Category</option>
                                {categories
                                    .filter((item) => item.isActive !== false)
                                    .map((item) => (
                                        <option key={item._id} value={item._id}>
                                            {item.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>
                                Sub Category *
                            </label>
                            <select
                                value={formData.subCategoryId}
                                onChange={(event) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        subCategoryId: event.target.value,
                                    }))
                                }
                                disabled={!formData.categoryId}
                                className={`${inputClass} disabled:opacity-50`}
                            >
                                <option value="">Select Sub Category</option>
                                {subCategories
                                    .filter((item) => item.isActive !== false)
                                    .map((item) => (
                                        <option key={item._id} value={item._id}>
                                            {item.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* ================= IMAGES ================= */}

                <section className={sectionClass}>
                    <SectionTitle>Product Images</SectionTitle>

                    <div className="space-y-6">
                        {/* THUMBNAIL */}
                        <div>
                            <label className={labelClass}>Thumbnail *</label>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                {formData.thumbnail && (
                                    <img
                                        src={formData.thumbnail}
                                        alt="Thumbnail"
                                        className="h-24 w-24 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                                    />
                                )}

                                <div className="flex-1">
                                    <MediaLibrary
                                        value={
                                            formData.thumbnail
                                                ? [formData.thumbnail]
                                                : []
                                        }
                                        multiple={false}
                                        maxFiles={1}
                                        buttonText={
                                            formData.thumbnail
                                                ? "Change Thumbnail"
                                                : "Upload Thumbnail"
                                        }
                                        onChange={handleThumbnailChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* GALLERY */}
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <label className={labelClass}>
                                    Gallery Images
                                </label>
                                <span className="text-xs text-gray-500">
                                    {formData.images.length} image
                                    {formData.images.length !== 1 ? "s" : ""}
                                </span>
                            </div>

                            <MediaLibrary
                                value={formData.images}
                                multiple={true}
                                maxFiles={10}
                                buttonText="Add Gallery Images"
                                onChange={handleGalleryChange}
                            />

                            {formData.images.length > 0 && (
                                <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                                    {formData.images.map((img, index) => (
                                        <div
                                            key={`${img}-${index}`}
                                            className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                                        >
                                            <img
                                                src={img}
                                                alt={`Gallery ${index + 1}`}
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeProductImage(index)
                                                }
                                                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ================= VARIATIONS ================= */}

                <section className={sectionClass}>
                    <SectionTitle>Product Variations</SectionTitle>

                    <p className="text-sm text-gray-500 mb-4">
                        Product-এর Color / Size অনুযায়ী variation তৈরি করুন।
                    </p>

                    {/* VARIATION TYPE */}

                    <div>
                        <label className="mb-3 block text-sm font-medium">
                            Variation Type *
                        </label>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {variationTypes.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() =>
                                        handleVariationTypeChange(type.value)
                                    }
                                    className={`rounded-sm border px-4 py-3 text-left transition ${variationType === type.value
                                        ? "border-black bg-black text-white"
                                        : "border-gray-200 hover:border-gray-400 dark:border-gray-700"
                                        }`}
                                >
                                    <div className="font-medium">{type.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* BASE PRICE + STOCK */}

                    <div className="mt-6 grid gap-5 md:grid-cols-3">
                        <div>
                            <label className={labelClass}>Base MRP *</label>
                            <input
                                type="number"
                                min="0"
                                name="mrp"
                                value={formData.mrp}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Base Selling Price *
                            </label>
                            <input
                                type="number"
                                min="0"
                                name="sellingPrice"
                                value={formData.sellingPrice}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        {variationType === "none" && (
                            <div>
                                <label className={labelClass}>Stock *</label>
                                <input
                                    type="number"
                                    min="0"
                                    name="quantity"
                                    value={formData.quantity || ""}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="100"
                                />
                            </div>
                        )}
                    </div>

                    {/* SELECT COLOR / SIZE */}

                    {variationType !== "none" && (
                        <div className="mt-6 space-y-5">
                            {(variationType === "color" ||
                                variationType === "color-size") && (
                                    <div>
                                        <label className={labelClass}>
                                            Select Color *
                                        </label>
                                        <Select
                                            isMulti
                                            options={colorOptions}
                                            value={selectedColors}
                                            onChange={setSelectedColors}
                                            styles={selectStyles}
                                            closeMenuOnSelect={false}
                                            placeholder="Select colors..."
                                        />
                                    </div>
                                )}

                            {(variationType === "size" ||
                                variationType === "color-size") && (
                                    <div>
                                        <label className={labelClass}>
                                            Select Size *
                                        </label>
                                        <Select
                                            isMulti
                                            options={sizeOptions}
                                            value={selectedSizes}
                                            onChange={setSelectedSizes}
                                            styles={selectStyles}
                                            closeMenuOnSelect={false}
                                            placeholder="Select sizes..."
                                        />
                                    </div>
                                )}

                            <div>
                                <label className={labelClass}>
                                    Default Stock (for new variations)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    name="quantity"
                                    value={formData.quantity || ""}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="100"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    এই quantity দিয়ে generated variations শুরু
                                    হবে। পরে table থেকে আলাদা করতে পারবে।
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={generateVariations}
                                className={primaryButtonClass}
                            >
                                <RefreshCw size={16} />
                                Generate Variations
                            </button>
                        </div>
                    )}

                    {/* GENERATED VARIATIONS TABLE */}

                    {variationType !== "none" && (
                        <div className="mt-6">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold">
                                        Generated Variations
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Total: {variations.length}
                                    </p>
                                </div>

                                {variations.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={clearVariations}
                                        className={dangerButtonClass}
                                    >
                                        <Trash2 size={16} />
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {variations.length === 0 ? (
                                <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl py-10 text-center">
                                    <Package
                                        size={28}
                                        className="mx-auto text-gray-400 mb-2"
                                    />
                                    <p className="text-gray-500 text-sm">
                                        No variations generated yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-sm border dark:border-gray-600">
                                    <table className="w-full min-w-[900px] text-sm">
                                        <thead className="bg-gray-50 dark:bg-[#232323]">
                                            <tr>
                                                <th className={thClass}>Color</th>
                                                <th className={thClass}>Size</th>
                                                <th className={thClass}>SKU</th>
                                                <th className={thClass}>MRP</th>
                                                <th className={thClass}>
                                                    Selling Price
                                                </th>
                                                <th className={thClass}>Stock</th>
                                                <th className={thClass}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {variations.map((variation) => (
                                                <tr
                                                    key={variation.key}
                                                    className="border-t"
                                                >
                                                    <td className={tdClass}>
                                                        {variation.colorName || "—"}
                                                    </td>
                                                    <td className={tdClass}>
                                                        {variation.sizeName || "—"}
                                                    </td>
                                                    <td className={tdClass}>
                                                        <input
                                                            value={variation.sku}
                                                            onChange={(event) =>
                                                                updateVariation(
                                                                    variation.key,
                                                                    "sku",
                                                                    event.target.value
                                                                )
                                                            }
                                                            className="w-40 rounded border px-3 py-2 uppercase bg-white dark:bg-primary-dark dark:border-gray-600"
                                                        />
                                                    </td>
                                                    <td className={tdClass}>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={variation.mrp}
                                                            onChange={(event) =>
                                                                updateVariation(
                                                                    variation.key,
                                                                    "mrp",
                                                                    event.target.value
                                                                )
                                                            }
                                                            className={tableInputClass}
                                                        />
                                                    </td>
                                                    <td className={tdClass}>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={variation.sellingPrice}
                                                            onChange={(event) =>
                                                                updateVariation(
                                                                    variation.key,
                                                                    "sellingPrice",
                                                                    event.target.value
                                                                )
                                                            }
                                                            className={tableInputClass}
                                                        />
                                                    </td>
                                                    <td className={tdClass}>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={variation.quantity}
                                                            onChange={(event) =>
                                                                updateVariation(
                                                                    variation.key,
                                                                    "quantity",
                                                                    event.target.value
                                                                )
                                                            }
                                                            className="w-24 rounded border px-3 py-2 bg-white dark:bg-primary-dark dark:border-gray-600"
                                                        />
                                                    </td>
                                                    <td className={tdClass}>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeVariation(variation.key)
                                                            }
                                                            className="w-9 h-9 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* COLOR IMAGES */}

                            {(variationType === "color" ||
                                variationType === "color-size") && (
                                    <div className="mt-6 space-y-4">
                                        <div>
                                            <h3 className="font-semibold">
                                                Color Images
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Upload images for each color.
                                            </p>
                                        </div>

                                        {selectedColors.map((color) => {
                                            const images =
                                                colorImages[color.value] || [];

                                            return (
                                                <div
                                                    key={color.value}
                                                    className="rounded-lg border p-4 dark:border-gray-600"
                                                >
                                                    <div className="mb-3 flex items-center gap-2">
                                                        {color.hexCode && (
                                                            <span
                                                                className="h-5 w-5 rounded-full border"
                                                                style={{
                                                                    backgroundColor:
                                                                        color.hexCode,
                                                                }}
                                                            />
                                                        )}
                                                        <span className="font-medium">
                                                            {color.label}
                                                        </span>
                                                        <span className="ml-auto text-xs text-gray-500">
                                                            {images.length} image
                                                            {images.length !== 1
                                                                ? "s"
                                                                : ""}
                                                        </span>
                                                    </div>

                                                    <MediaLibrary
                                                        value={images}
                                                        multiple={true}
                                                        maxFiles={10}
                                                        buttonText="Upload Color Images"
                                                        onChange={(imgs) =>
                                                            handleColorImagesChange(
                                                                color.value,
                                                                imgs
                                                            )
                                                        }
                                                    />

                                                    {images.length > 0 && (
                                                        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                                                            {images.map((img, i) => (
                                                                <div
                                                                    key={`${img}-${i}`}
                                                                    className="group relative aspect-square overflow-hidden rounded-md border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                                                                >
                                                                    <img
                                                                        src={img}
                                                                        alt={`${color.label} ${i + 1}`}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            removeColorImage(
                                                                                color.value,
                                                                                i
                                                                            )
                                                                        }
                                                                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                            {/* SIZE IMAGES */}

                            {(variationType === "size" ||
                                variationType === "color-size") && (
                                    <div className="mt-6 space-y-4">
                                        <div
                                            onClick={() =>
                                                setShowSizeImages((prev) => !prev)
                                            }
                                            className="flex cursor-pointer items-center justify-between rounded-lg border p-4 dark:border-gray-600"
                                        >
                                            <div>
                                                <h3 className="font-semibold">
                                                    Size / Combination Images
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Optional images for individual
                                                    size or color-size combinations.
                                                </p>
                                            </div>

                                            <span
                                                className={`transition-transform duration-200 ${showSizeImages
                                                    ? "rotate-180"
                                                    : ""
                                                    }`}
                                            >
                                                <ChevronDown />
                                            </span>
                                        </div>

                                        {showSizeImages && (
                                            <div className="space-y-4">
                                                {variations.map((variation) => {
                                                    const images =
                                                        sizeImages[variation.key] || [];

                                                    return (
                                                        <div
                                                            key={variation.key}
                                                            className="rounded-lg border p-4 dark:border-gray-600"
                                                        >
                                                            <div className="mb-3 flex items-center justify-between gap-2">
                                                                <div>
                                                                    <span className="font-medium">
                                                                        {variation.colorName
                                                                            ? `${variation.colorName} - `
                                                                            : ""}
                                                                        {variation.sizeName ||
                                                                            "No Size"}
                                                                    </span>
                                                                    <p className="mt-1 text-xs text-gray-500">
                                                                        SKU: {variation.sku}
                                                                    </p>
                                                                </div>
                                                                <span className="text-xs text-gray-500">
                                                                    {images.length} image
                                                                    {images.length !== 1
                                                                        ? "s"
                                                                        : ""}
                                                                </span>
                                                            </div>

                                                            <MediaLibrary
                                                                value={images}
                                                                multiple={true}
                                                                maxFiles={10}
                                                                buttonText="Upload Combination Images"
                                                                onChange={(imgs) =>
                                                                    handleSizeImagesChange(
                                                                        variation.key,
                                                                        imgs
                                                                    )
                                                                }
                                                            />

                                                            {images.length > 0 && (
                                                                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                                                                    {images.map((img, i) => (
                                                                        <div
                                                                            key={`${img}-${i}`}
                                                                            className="group relative aspect-square overflow-hidden rounded-md border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                                                                        >
                                                                            <img
                                                                                src={img}
                                                                                alt={`${variation.sku} ${i + 1}`}
                                                                                className="h-full w-full object-cover"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    removeSizeImage(
                                                                                        variation.key,
                                                                                        i
                                                                                    )
                                                                                }
                                                                                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
                                                                            >
                                                                                ×
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                        </div>
                    )}
                </section>

                {/* ================= ADDITIONAL INFO ================= */}

                <section className={sectionClass}>
                    <SectionTitle>Additional Information</SectionTitle>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClass}>Material</label>
                            <input
                                type="text"
                                name="material"
                                value={formData.material}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="100% Cotton"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Size Chart</label>
                            <Select
                                options={sizeChartOptions}
                                value={
                                    sizeChartOptions.find(
                                        (item) =>
                                            item.value ===
                                            String(formData.sizeChartId)
                                    ) || null
                                }
                                onChange={(option) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        sizeChartId: option?.value || "",
                                    }));
                                }}
                                placeholder={
                                    loadingSizeCharts
                                        ? "Loading size charts..."
                                        : "Select size chart (optional)"
                                }
                                isClearable
                                isDisabled={loadingSizeCharts}
                                isLoading={loadingSizeCharts}
                                styles={selectStyles}
                                formatOptionLabel={(option) => (
                                    <div className="flex items-center justify-between gap-3">
                                        <span>{option.label}</span>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${option.type === "custom"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {option.type === "custom"
                                                ? "Custom"
                                                : "Image"}
                                        </span>
                                    </div>
                                )}
                            />

                            {selectedSizeChart && (
                                <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50">
                                    {selectedSizeChart.type === "custom" &&
                                        selectedSizeChart.rows?.length ? (
                                        <>
                                            <div className="overflow-x-auto">
                                                <table className="w-full border-collapse text-[10px]">
                                                    <thead>
                                                        <tr className="bg-[#393635] text-white">
                                                            {selectedSizeChart.headers.map(
                                                                (h) => (
                                                                    <th
                                                                        key={h}
                                                                        className="px-2 py-1 text-center uppercase"
                                                                    >
                                                                        {h}
                                                                    </th>
                                                                )
                                                            )}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedSizeChart.rows
                                                            .slice(0, 5)
                                                            .map((row, ri) => (
                                                                <tr
                                                                    key={ri}
                                                                    className={
                                                                        ri % 2
                                                                            ? "bg-[#f0f8ff]"
                                                                            : "bg-white"
                                                                    }
                                                                >
                                                                    {selectedSizeChart.headers.map(
                                                                        (h) => (
                                                                            <td
                                                                                key={h}
                                                                                className="border border-white/60 px-2 py-1 text-center text-gray-700"
                                                                            >
                                                                                {row[h]}
                                                                            </td>
                                                                        )
                                                                    )}
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <p className="mt-2 text-[10px] text-gray-500">
                                                Unit: {selectedSizeChart.unit} · Total{" "}
                                                {selectedSizeChart.rows.length} sizes
                                            </p>
                                        </>
                                    ) : selectedSizeChart.image ? (
                                        <img
                                            src={selectedSizeChart.image}
                                            alt={selectedSizeChart.name}
                                            className="max-h-40 w-auto rounded-md border object-contain"
                                        />
                                    ) : (
                                        <p className="text-xs text-gray-500">
                                            No preview available
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClass}>
                                Care Instructions
                            </label>
                            <textarea
                                name="careInstructions"
                                value={formData.careInstructions}
                                onChange={handleChange}
                                rows={4}
                                className={`${inputClass} h-auto py-3`}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClass}>Tags</label>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(event) =>
                                        setTagInput(event.target.value)
                                    }
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            addTag();
                                        }
                                    }}
                                    className={inputClass}
                                    placeholder="Type tag and press Enter"
                                />

                                <button
                                    type="button"
                                    onClick={addTag}
                                    className={secondaryButtonClass}
                                >
                                    <Plus size={16} />
                                    Add
                                </button>
                            </div>

                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {formData.tags.map((tag, index) => (
                                        <div
                                            key={`${tag}-${index}`}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(index)}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ================= STATUS ================= */}

                <section className={sectionClass}>
                    <SectionTitle>Product Status</SectionTitle>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatusCheckbox
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            title="Active"
                            description="Product is visible on storefront"
                        />
                        <StatusCheckbox
                            name="isFeatured"
                            checked={formData.isFeatured}
                            onChange={handleChange}
                            title="Featured"
                            description="Show as featured product"
                        />
                        <StatusCheckbox
                            name="isNewArrival"
                            checked={formData.isNewArrival}
                            onChange={handleChange}
                            title="New Arrival"
                            description="Mark as new arrival"
                        />
                    </div>
                </section>

                {/* ================= SUBMIT ================= */}

                <div className="sticky bottom-0 z-30 -mx-4 md:-mx-6 px-4 md:px-6 py-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => navigate("/admin/products")}
                        className={cancelButtonClass}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className={primaryButtonClass}
                    >
                        {saving ? (
                            <>
                                <Loader2 size={17} className="animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save size={17} />
                                Update Product
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

/* =============================================================
   SMALL COMPONENTS
============================================================= */

function SectionTitle({ children }) {
    return (
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">
            {children}
        </h2>
    );
}

function StatusCheckbox({
    name,
    checked,
    onChange,
    title,
    description,
}) {
    return (
        <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                className="mt-1 accent-black"
            />
            <div>
                <p className="font-medium text-gray-900 dark:text-white">
                    {title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    {description}
                </p>
            </div>
        </label>
    );
}

/* =============================================================
   STYLES
============================================================= */

const sectionClass =
    "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5";

const inputClass =
    "w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-gray-400 transition";

const tableInputClass =
    "h-9 w-28 px-2 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-950 text-gray-900 dark:text-white outline-none";

const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";

const primaryButtonClass =
    "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:opacity-90 disabled:opacity-50";

const secondaryButtonClass =
    "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm font-medium hover:bg-gray-50";

const dangerButtonClass =
    "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-red-200 bg-white text-red-600 text-sm font-medium hover:bg-red-50";

const cancelButtonClass =
    "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50";

const iconButtonClass =
    "h-10 w-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800";

const infoBoxClass =
    "px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-500";

const thClass =
    "px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap";

const tdClass =
    "px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap";

export default ProductEdit;