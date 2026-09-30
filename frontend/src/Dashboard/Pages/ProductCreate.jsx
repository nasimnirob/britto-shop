import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { toast } from "react-hot-toast";
import { ArrowLeft, ImageIcon, Loader2, Save, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MediaLibrary from "../../Component/Cloudinary/MediaLibrary";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
    tags: "",
    weight: "",

    mrp: "",
    sellingPrice: "",
    quantity: "",

    isFeatured: false,
    isNewArrival: false,
    isActive: true,
};

// =========================================================
// VARIATION TYPES
// =========================================================

const variationTypes = [
    {
        value: "none",
        label: "No Variation",
    },
    {
        value: "color",
        label: "Color Only",
    },
    {
        value: "size",
        label: "Size Only",
    },
    {
        value: "color-size",
        label: "Color + Size",
    },
];

// =========================================================
// SKU HELPERS
// =========================================================

const makeSkuPart = (
    value,
    maxLength = 12
) => {
    return String(value || "")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .substring(0, maxLength);
};

const generateSKU = ({
    productName,
    colorName,
    sizeName,
    index,
}) => {
    const productPart =
        makeSkuPart(productName, 18);

    const colorPart =
        makeSkuPart(colorName, 5);

    const sizePart =
        makeSkuPart(sizeName, 5);

    const numberPart =
        String(index).padStart(3, "0");

    return [
        productPart,
        colorPart,
        sizePart,
        numberPart,
    ]
        .filter(Boolean)
        .join("-");
};

// =========================================================
// IMAGE / TEXT HELPERS
// =========================================================

const splitLines = (value) => {
    return String(value || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
};

// =========================================================
// COMPONENT
// =========================================================

const ProductCreate = () => {
    const navigate = useNavigate();

    const [sizeCharts, setSizeCharts] = useState([]);
    const [loadingSizeCharts, setLoadingSizeCharts] = useState(false);

    // =====================================================
    // FORM STATE
    // =====================================================

    const [formData, setFormData] = useState(initialForm);

    // =====================================================
    // CATEGORY DATA
    // =====================================================

    const [productTypes, setProductTypes] = useState([]);

    const [categories, setCategories] = useState([]);

    const [subCategories, setSubCategories] = useState([]);

    // =====================================================
    // VARIATION MASTER DATA
    // =====================================================

    const [colors, setColors] = useState([]);

    const [sizes, setSizes] = useState([]);

    // =====================================================
    // SELECTED VARIATIONS
    // =====================================================

    const [selectedColorIds, setSelectedColorIds] = useState([]);

    const [selectedSizeIds, setSelectedSizeIds] = useState([]);

    const [variationType, setVariationType] = useState("none");

    const [variations, setVariations] = useState([]);

    // =====================================================
    // VARIATION IMAGES
    // =====================================================

    const [colorImages, setColorImages] = useState({});

    const [sizeImages, setSizeImages] = useState({});

    // =====================================================
    // UI STATES
    // =====================================================

    const [variationGenerated, setVariationGenerated] = useState(false);

    const [showSizeImages, setShowSizeImages] = useState(false);

    const [loading, setLoading] = useState(false);

    // =========================================================
    // COMMON FETCH HELPER
    // =========================================================

    const fetchJson = async (
        url,
        errorMessage
    ) => {
        const response = await fetch(url);

        let data = null;

        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (!response.ok) {
            throw new Error(
                data?.message ||
                errorMessage
            );
        }

        return data;
    };

    // =========================================================
    // FETCH PRODUCT TYPES
    // =========================================================

    useEffect(() => {
        let cancelled = false;

        const loadProductTypes = async () => {
            try {
                const data =
                    await fetchJson(
                        `${API_URL}/product-types`,
                        "Failed to fetch product types"
                    );

                if (!cancelled) {
                    setProductTypes(
                        Array.isArray(data)
                            ? data
                            : []
                    );
                }
            } catch (error) {
                if (!cancelled) {
                    console.error(error);

                    toast.error(
                        error.message
                    );
                }
            }
        };

        loadProductTypes();

        return () => {
            cancelled = true;
        };
    }, []);

    // =========================================================
    // FETCH COLORS
    // =========================================================

    useEffect(() => {
        let cancelled = false;

        const loadColors = async () => {
            try {
                const data =
                    await fetchJson(
                        `${API_URL}/colors?isActive=true`,
                        "Failed to fetch colors"
                    );

                if (!cancelled) {
                    setColors(
                        Array.isArray(data)
                            ? data
                            : []
                    );
                }
            } catch (error) {
                if (!cancelled) {
                    console.error(error);

                    toast.error(
                        error.message
                    );
                }
            }
        };

        loadColors();

        return () => {
            cancelled = true;
        };
    }, []);

    // =========================================================
    // FETCH SIZES
    // =========================================================

    useEffect(() => {
        let cancelled = false;

        const loadSizes = async () => {
            try {
                const data =
                    await fetchJson(
                        `${API_URL}/sizes?isActive=true&group=clothing`,
                        "Failed to fetch sizes"
                    );

                if (!cancelled) {
                    setSizes(
                        Array.isArray(data)
                            ? data
                            : []
                    );
                }
            } catch (error) {
                if (!cancelled) {
                    console.error(error);

                    toast.error(
                        error.message
                    );
                }
            }
        };

        loadSizes();

        return () => {
            cancelled = true;
        };
    }, []);

    // =========================================================
    // FETCH CATEGORIES
    // =========================================================

    useEffect(() => {
        if (!formData.productTypeId) {
            setCategories([]);
            setSubCategories([]);

            setFormData((previous) => {
                if (
                    previous.categoryId ===
                    "" &&
                    previous.subCategoryId ===
                    ""
                ) {
                    return previous;
                }

                return {
                    ...previous,
                    categoryId: "",
                    subCategoryId: "",
                };
            });

            return;
        }

        let cancelled = false;

        const loadCategories = async () => {
            try {
                const data =
                    await fetchJson(
                        `${API_URL}/categories?productTypeId=${encodeURIComponent(
                            formData.productTypeId
                        )}`,
                        "Failed to fetch categories"
                    );

                if (!cancelled) {
                    setCategories(
                        Array.isArray(data)
                            ? data
                            : []
                    );
                }
            } catch (error) {
                if (!cancelled) {
                    console.error(error);

                    toast.error(
                        error.message
                    );
                }
            }
        };

        loadCategories();

        return () => {
            cancelled = true;
        };
    }, [formData.productTypeId]);

    // =========================================================
    // FETCH SUB CATEGORIES
    // =========================================================

    useEffect(() => {
        if (
            !formData.productTypeId ||
            !formData.categoryId
        ) {
            setSubCategories([]);

            setFormData((previous) => {
                if (
                    previous.subCategoryId ===
                    ""
                ) {
                    return previous;
                }

                return {
                    ...previous,
                    subCategoryId: "",
                };
            });

            return;
        }

        let cancelled = false;

        const loadSubCategories =
            async () => {
                try {
                    const data =
                        await fetchJson(
                            `${API_URL}/sub-categories?productTypeId=${encodeURIComponent(
                                formData.productTypeId
                            )}&categoryId=${encodeURIComponent(
                                formData.categoryId
                            )}`,
                            "Failed to fetch sub categories"
                        );

                    if (!cancelled) {
                        setSubCategories(
                            Array.isArray(data)
                                ? data
                                : []
                        );
                    }
                } catch (error) {
                    if (!cancelled) {
                        console.error(
                            error
                        );

                        toast.error(
                            error.message
                        );
                    }
                }
            };

        loadSubCategories();

        return () => {
            cancelled = true;
        };
    }, [
        formData.productTypeId,
        formData.categoryId,
    ]);

    // =========================================================
    // FETCH SIZE CHARTS
    // =========================================================

    useEffect(() => {
        let cancelled = false;

        const loadSizeCharts = async () => {
            try {
                setLoadingSizeCharts(true);

                const response = await fetch(`${API_URL}/size-charts`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message || "Failed to fetch size charts"
                    );
                }

                if (!cancelled) {
                    setSizeCharts(
                        Array.isArray(data?.data) ? data.data : []
                    );
                }
            } catch (error) {
                if (!cancelled) {
                    console.error(error);
                    toast.error(error.message);
                }
            } finally {
                if (!cancelled) {
                    setLoadingSizeCharts(false);
                }
            }
        };

        loadSizeCharts();

        return () => {
            cancelled = true;
        };
    }, []);

    // =========================================================
    // SELECT OPTIONS
    // =========================================================

    const colorOptions = useMemo(() => {
        return colors.map((color) => ({
            value: String(color._id),
            label: color.name,
            hexCode:
                color.hexCode || "",
        }));
    }, [colors]);

    const sizeOptions = useMemo(() => {
        return sizes.map((size) => ({
            value: String(size._id),
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
            (chart) => String(chart._id) === String(formData.sizeChartId)
        );
    }, [sizeCharts, formData.sizeChartId]);

    const selectedColorOptions =
        useMemo(() => {
            return selectedColorIds
                .map((id) => {
                    const color =
                        colors.find(
                            (item) =>
                                String(
                                    item._id
                                ) ===
                                String(id)
                        );

                    if (!color) {
                        return null;
                    }

                    return {
                        value: String(
                            color._id
                        ),
                        label: color.name,
                        hexCode:
                            color.hexCode ||
                            "",
                    };
                })
                .filter(Boolean);
        }, [
            selectedColorIds,
            colors,
        ]);

    const selectedSizeOptions =
        useMemo(() => {
            return selectedSizeIds
                .map((id) => {
                    const size =
                        sizes.find(
                            (item) =>
                                String(
                                    item._id
                                ) ===
                                String(id)
                        );

                    if (!size) {
                        return null;
                    }

                    return {
                        value: String(
                            size._id
                        ),
                        label: size.name,
                        group: size.group,
                    };
                })
                .filter(Boolean);
        }, [
            selectedSizeIds,
            sizes,
        ]);

    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleChange = (event) => {
        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setFormData((previous) => ({
            ...previous,

            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    // =========================================================
    // VARIATION TYPE CHANGE
    // =========================================================

    const handleVariationTypeChange = (
        type
    ) => {
        setVariationType(type);

        // Clear previous selections
        setSelectedColorIds([]);
        setSelectedSizeIds([]);

        // Clear generated variations
        setVariations([]);

        // Clear image mappings
        setColorImages({});
        setSizeImages({});

        // Reset variation state
        setVariationGenerated(false);

        // Close image section
        setShowSizeImages(false);
    };

    // =========================================================
    // GENERATE VARIATIONS
    // =========================================================

    const generateVariations = () => {
        const baseMrp =
            Number(formData.mrp || 0);

        const baseSellingPrice =
            Number(
                formData.sellingPrice || 0
            );

        const baseQuantity =
            Number(
                formData.quantity || 0
            );

        // -----------------------------------------------------
        // PRODUCT NAME
        // -----------------------------------------------------

        if (!formData.name.trim()) {
            toast.error(
                "Please enter product name first"
            );

            return;
        }

        // -----------------------------------------------------
        // BASE MRP
        // -----------------------------------------------------

        if (
            !Number.isFinite(
                baseMrp
            ) ||
            baseMrp <= 0
        ) {
            toast.error(
                "Please enter a valid base MRP first"
            );

            return;
        }

        // -----------------------------------------------------
        // BASE SELLING PRICE
        // -----------------------------------------------------

        if (
            !Number.isFinite(
                baseSellingPrice
            ) ||
            baseSellingPrice <= 0
        ) {
            toast.error(
                "Please enter a valid base selling price first"
            );

            return;
        }

        if (
            baseSellingPrice >
            baseMrp
        ) {
            toast.error(
                "Selling price cannot be greater than MRP"
            );

            return;
        }

        // -----------------------------------------------------
        // DEFAULT STOCK
        // -----------------------------------------------------

        if (
            !Number.isInteger(
                baseQuantity
            ) ||
            baseQuantity < 0
        ) {
            toast.error(
                "Default stock must be a valid non-negative integer"
            );

            return;
        }

        // =====================================================
        // NO VARIATION
        // =====================================================

        if (
            variationType ===
            "none"
        ) {
            setVariations([]);

            setVariationGenerated(
                true
            );

            return;
        }

        // =====================================================
        // COLOR ONLY
        // =====================================================

        if (
            variationType ===
            "color"
        ) {
            if (
                selectedColorOptions.length ===
                0
            ) {
                toast.error(
                    "Please select at least one color"
                );

                return;
            }

            const generated =
                selectedColorOptions.map(
                    (
                        color,
                        index
                    ) => ({
                        key: `${color.value}-none`,

                        colorId:
                            color.value,

                        colorName:
                            color.label,

                        sizeId: null,

                        sizeName: "",

                        mrp: baseMrp,

                        sellingPrice:
                            baseSellingPrice,

                        quantity:
                            baseQuantity,

                        sku: generateSKU({
                            productName:
                                formData.name,

                            colorName:
                                color.label,

                            sizeName: "",

                            index:
                                index + 1,
                        }),
                    })
                );

            setVariations(
                generated
            );

            setVariationGenerated(
                true
            );

            return;
        }

        // =====================================================
        // SIZE ONLY
        // =====================================================

        if (
            variationType ===
            "size"
        ) {
            if (
                selectedSizeOptions.length ===
                0
            ) {
                toast.error(
                    "Please select at least one size"
                );

                return;
            }

            const generated =
                selectedSizeOptions.map(
                    (
                        size,
                        index
                    ) => ({
                        key: `none-${size.value}`,

                        colorId: null,

                        colorName: "",

                        sizeId:
                            size.value,

                        sizeName:
                            size.label,

                        mrp: baseMrp,

                        sellingPrice:
                            baseSellingPrice,

                        quantity:
                            baseQuantity,

                        sku: generateSKU({
                            productName:
                                formData.name,

                            colorName: "",

                            sizeName:
                                size.label,

                            index:
                                index + 1,
                        }),
                    })
                );

            setVariations(
                generated
            );

            setVariationGenerated(
                true
            );

            return;
        }

        // =====================================================
        // COLOR + SIZE
        // =====================================================

        if (
            variationType ===
            "color-size"
        ) {
            if (
                selectedColorOptions.length ===
                0
            ) {
                toast.error(
                    "Please select at least one color"
                );

                return;
            }

            if (
                selectedSizeOptions.length ===
                0
            ) {
                toast.error(
                    "Please select at least one size"
                );

                return;
            }

            const generated = [];

            let index = 1;

            selectedColorOptions.forEach(
                (color) => {
                    selectedSizeOptions.forEach(
                        (size) => {
                            generated.push(
                                {
                                    key: `${color.value}-${size.value}`,

                                    colorId:
                                        color.value,

                                    colorName:
                                        color.label,

                                    sizeId:
                                        size.value,

                                    sizeName:
                                        size.label,

                                    mrp:
                                        baseMrp,

                                    sellingPrice:
                                        baseSellingPrice,

                                    quantity:
                                        baseQuantity,

                                    sku: generateSKU(
                                        {
                                            productName:
                                                formData.name,

                                            colorName:
                                                color.label,

                                            sizeName:
                                                size.label,

                                            index,
                                        }
                                    ),
                                }
                            );

                            index += 1;
                        }
                    );
                }
            );

            setVariations(
                generated
            );

            setVariationGenerated(
                true
            );
        }
    };

    // =========================================================
    // UPDATE VARIATION
    // =========================================================

    const updateVariation = (
        index,
        field,
        value
    ) => {
        setVariations((previous) => {
            const updated = [
                ...previous,
            ];

            updated[index] = {
                ...updated[index],

                [field]:
                    field === "mrp" ||
                        field ===
                        "sellingPrice" ||
                        field ===
                        "quantity"
                        ? value === ""
                            ? ""
                            : Number(
                                value
                            )
                        : value,
            };

            return updated;
        });
    };

    // =========================================================
    // COLOR IMAGE CHANGE
    // =========================================================

    const handleColorImageChange = (
        colorId,
        value
    ) => {
        setColorImages(
            (previous) => ({
                ...previous,

                [colorId]:
                    splitLines(
                        value
                    ),
            })
        );
    };

    // =========================================================
    // SIZE / COMBINATION IMAGE CHANGE
    // =========================================================

    const handleSizeImageChange = (
        variationKey,
        value
    ) => {
        setSizeImages(
            (previous) => ({
                ...previous,

                [variationKey]:
                    splitLines(
                        value
                    ),
            })
        );
    };

    // =========================================================
    // BUILD BACKEND VARIANTS
    // =========================================================

    const buildBackendVariants =
        () => {
            // Simple product
            if (
                variationType ===
                "none"
            ) {
                return [];
            }

            const grouped = {};

            variations.forEach(
                (variation) => {
                    const colorKey =
                        variation.colorId ||
                        "no-color";

                    if (
                        !grouped[
                        colorKey
                        ]
                    ) {
                        grouped[
                            colorKey
                        ] = {
                            colorId:
                                variation.colorId ||
                                null,

                            images:
                                variation.colorId
                                    ? (
                                        colorImages[
                                        variation
                                            .colorId
                                        ] ||
                                        []
                                    )
                                    : [],

                            sizes: [],
                        };
                    }

                    grouped[
                        colorKey
                    ].sizes.push(
                        {
                            sizeId:
                                variation.sizeId ||
                                null,

                            images:
                                sizeImages[
                                variation
                                    .key
                                ] ||
                                [],

                            sku: String(
                                variation.sku ||
                                ""
                            )
                                .trim()
                                .toUpperCase(),

                            price: {
                                mrp: Number(
                                    variation.mrp ||
                                    0
                                ),

                                sellingPrice:
                                    Number(
                                        variation.sellingPrice ||
                                        0
                                    ),

                                currency:
                                    "BDT",
                            },

                            stock: Number(
                                variation.quantity ||
                                0
                            ),
                        }
                    );
                }
            );

            return Object.values(
                grouped
            ).map((variant) => ({
                ...variant,

                images: (
                    variant.images ||
                    []
                )
                    .map((image) =>
                        String(
                            image
                        ).trim()
                    )
                    .filter(Boolean),

                sizes: (
                    variant.sizes ||
                    []
                ).map((size) => ({
                    ...size,

                    images: (
                        size.images ||
                        []
                    )
                        .map((image) =>
                            String(
                                image
                            ).trim()
                        )
                        .filter(
                            Boolean
                        ),
                })),
            }));
        };

    // =========================================================
    // TOTAL STOCK
    // =========================================================

    const totalStock = useMemo(() => {
        // Simple product
        if (
            variationType ===
            "none"
        ) {
            return Number(
                formData.quantity ||
                0
            );
        }

        // Variation product
        return variations.reduce(
            (
                total,
                variation
            ) =>
                total +
                Number(
                    variation.quantity ||
                    0
                ),
            0
        );
    }, [
        variationType,
        variations,
        formData.quantity,
    ]);

    // =========================================================
    // VALIDATE VARIATIONS
    // =========================================================

    const validateVariations =
        () => {
            // No variation needs
            // variation validation
            if (
                variationType ===
                "none"
            ) {
                return true;
            }

            if (
                !variationGenerated ||
                variations.length ===
                0
            ) {
                toast.error(
                    "Please generate product variations"
                );

                return false;
            }

            // Detect duplicate SKU
            // inside current product
            const skuSet = new Set();

            for (
                let index = 0;
                index <
                variations.length;
                index += 1
            ) {
                const variation =
                    variations[
                    index
                    ];

                const sku =
                    String(
                        variation.sku ||
                        ""
                    )
                        .trim()
                        .toUpperCase();

                // SKU required
                if (!sku) {
                    toast.error(
                        `SKU is required for variation #${index + 1
                        }`
                    );

                    return false;
                }

                // Duplicate SKU
                if (
                    skuSet.has(sku)
                ) {
                    toast.error(
                        `Duplicate SKU found: ${sku}`
                    );

                    return false;
                }

                skuSet.add(sku);

                // -------------------------------------------------
                // PRICE
                // -------------------------------------------------

                const mrp =
                    Number(
                        variation.mrp
                    );

                const sellingPrice =
                    Number(
                        variation.sellingPrice
                    );

                // -------------------------------------------------
                // STOCK
                // -------------------------------------------------

                const quantity =
                    Number(
                        variation.quantity
                    );

                if (
                    !Number.isFinite(
                        mrp
                    ) ||
                    mrp <= 0
                ) {
                    toast.error(
                        `Invalid MRP for SKU: ${sku}`
                    );

                    return false;
                }

                if (
                    !Number.isFinite(
                        sellingPrice
                    ) ||
                    sellingPrice <=
                    0
                ) {
                    toast.error(
                        `Invalid selling price for SKU: ${sku}`
                    );

                    return false;
                }

                if (
                    sellingPrice >
                    mrp
                ) {
                    toast.error(
                        `Selling price cannot be greater than MRP for SKU: ${sku}`
                    );

                    return false;
                }

                if (
                    !Number.isInteger(
                        quantity
                    ) ||
                    quantity < 0
                ) {
                    toast.error(
                        `Invalid stock for SKU: ${sku}`
                    );

                    return false;
                }

                // -------------------------------------------------
                // COLOR ONLY
                // -------------------------------------------------

                if (
                    variationType ===
                    "color"
                ) {
                    if (
                        !variation.colorId
                    ) {
                        toast.error(
                            `Color is required for variation #${index + 1
                            }`
                        );

                        return false;
                    }

                    if (
                        variation.sizeId
                    ) {
                        toast.error(
                            `Size is not allowed in Color Only variation #${index + 1
                            }`
                        );

                        return false;
                    }
                }

                // -------------------------------------------------
                // SIZE ONLY
                // -------------------------------------------------

                if (
                    variationType ===
                    "size"
                ) {
                    if (
                        !variation.sizeId
                    ) {
                        toast.error(
                            `Size is required for variation #${index + 1
                            }`
                        );

                        return false;
                    }

                    if (
                        variation.colorId
                    ) {
                        toast.error(
                            `Color is not allowed in Size Only variation #${index + 1
                            }`
                        );

                        return false;
                    }
                }

                // -------------------------------------------------
                // COLOR + SIZE
                // -------------------------------------------------

                if (
                    variationType ===
                    "color-size"
                ) {
                    if (
                        !variation.colorId ||
                        !variation.sizeId
                    ) {
                        toast.error(
                            `Both color and size are required for variation #${index + 1
                            }`
                        );

                        return false;
                    }
                }
            }

            return true;
        };

    // =========================================================
    // SUBMIT
    // =========================================================

    const handleSubmit =
        async (event) => {
            event.preventDefault();

            if (loading) {
                return;
            }

            // -----------------------------------------------------
            // BASIC VALIDATION
            // -----------------------------------------------------

            const name =
                formData.name.trim();

            if (!name) {
                toast.error(
                    "Product name is required"
                );

                return;
            }

            if (
                !formData.productTypeId
            ) {
                toast.error(
                    "Please select product type"
                );

                return;
            }

            if (
                !formData.categoryId
            ) {
                toast.error(
                    "Please select category"
                );

                return;
            }

            if (
                !formData.subCategoryId
            ) {
                toast.error(
                    "Please select sub category"
                );

                return;
            }

            // -----------------------------------------------------
            // BASE PRICE
            // -----------------------------------------------------

            const mrp =
                Number(
                    formData.mrp
                );

            const sellingPrice =
                Number(
                    formData.sellingPrice
                );

            if (
                !Number.isFinite(
                    mrp
                ) ||
                mrp <= 0
            ) {
                toast.error(
                    "Product MRP is required"
                );

                return;
            }

            if (
                !Number.isFinite(
                    sellingPrice
                ) ||
                sellingPrice <=
                0
            ) {
                toast.error(
                    "Product selling price is required"
                );

                return;
            }

            if (
                sellingPrice >
                mrp
            ) {
                toast.error(
                    "Selling price cannot be greater than MRP"
                );

                return;
            }

            // -----------------------------------------------------
            // SIMPLE PRODUCT STOCK
            // -----------------------------------------------------

            const quantity =
                Number(
                    formData.quantity
                );

            if (
                variationType ===
                "none" &&
                (
                    !Number.isInteger(
                        quantity
                    ) ||
                    quantity < 0
                )
            ) {
                toast.error(
                    "Stock must be a valid non-negative integer"
                );

                return;
            }

            // -----------------------------------------------------
            // VARIATION VALIDATION
            // -----------------------------------------------------

            if (
                !validateVariations()
            ) {
                return;
            }

            try {
                setLoading(true);

                // -------------------------------------------------
                // IMAGES
                // -------------------------------------------------

                const images = Array.isArray(formData.images)
                    ? formData.images
                        .map((image) => String(image).trim())
                        .filter(Boolean)
                    : [];

                // -------------------------------------------------
                // TAGS
                // -------------------------------------------------

                const tags =
                    String(
                        formData.tags ||
                        ""
                    )
                        .split(",")
                        .map(
                            (item) =>
                                item.trim()
                        )
                        .filter(
                            Boolean
                        );

                // -------------------------------------------------
                // BACKEND VARIANTS
                // -------------------------------------------------

                const variants =
                    buildBackendVariants();

                // -------------------------------------------------
                // DISCOUNT
                // -------------------------------------------------

                const discountPercent =
                    Math.round(
                        (
                            (
                                mrp -
                                sellingPrice
                            ) /
                            mrp
                        ) *
                        100
                    );

                // =================================================
                // IMPORTANT
                //
                // DO NOT SEND slug FROM FRONTEND.
                //
                // Backend owns:
                // - slug generation
                // - slug uniqueness
                // =================================================

                const productPayload = {
                    name,

                    description: formData.description.trim(),

                    brand: formData.brand.trim(),

                    productTypeId: formData.productTypeId,

                    categoryId: formData.categoryId,

                    subCategoryId: formData.subCategoryId,

                    thumbnail: formData.thumbnail.trim(),

                    images,

                    variants,

                    price: {
                        mrp,

                        sellingPrice,

                        discountPercent,

                        currency:
                            "BDT",
                    },

                    material: formData.material.trim(),

                    careInstructions: formData.careInstructions.trim(),

                    sizeChartId: formData.sizeChartId || "",

                    tags,

                    weight: formData.weight.trim(),

                    totalStock,

                    variationType,

                    isFeatured:
                        Boolean(
                            formData.isFeatured
                        ),

                    isNewArrival:
                        Boolean(
                            formData.isNewArrival
                        ),

                    isActive:
                        Boolean(
                            formData.isActive
                        ),
                };

                // -------------------------------------------------
                // CREATE PRODUCT
                // -------------------------------------------------

                const response =
                    await fetch(
                        `${API_URL}/products`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body: JSON.stringify(
                                productPayload
                            ),
                        }
                    );

                let data = null;

                try {
                    data =
                        await response.json();
                } catch {
                    data = null;
                }

                if (
                    !response.ok
                ) {
                    throw new Error(
                        data?.message ||
                        "Failed to create product"
                    );
                }

                // -------------------------------------------------
                // SUCCESS
                // -------------------------------------------------

                toast.success(
                    "Product created successfully"
                );

                console.log(
                    "Created product:",
                    data
                );

                navigate(
                    "/admin/products"
                );
            } catch (error) {
                console.error(
                    "Product create error:",
                    error
                );

                toast.error(
                    error.message ||
                    "Failed to create product"
                );
            } finally {
                setLoading(false);
            }
        };

    // =========================================================
    // REACT SELECT STYLES
    // =========================================================

    const selectClassNames = {
        control: () =>
            "min-h-[46px] bg-white dark:bg-primary-dark border border-gray-300 dark:border-gray-600 shadow-none",

        menu: () =>
            "z-50 bg-white dark:bg-primary-dark border border-gray-200 dark:border-gray-600",

        menuList: () =>
            "bg-white dark:bg-primary-dark",

        option: (state) =>
            `${state.isSelected
                ? "bg-gray-900 text-white"
                : state.isFocused
                    ? "bg-gray-100 dark:bg-gray-700"
                    : "bg-white dark:bg-primary-dark"
            } text-sm`,

        multiValue: () =>
            "bg-gray-200 dark:bg-gray-700",

        multiValueLabel: () =>
            "text-gray-900 dark:text-white",

        input: () =>
            "text-gray-900 dark:text-white",

        placeholder: () =>
            "text-gray-500 dark:text-gray-400",

        singleValue: () =>
            "text-gray-900 dark:text-white",

        clearIndicator: () =>
            "text-gray-500",

        dropdownIndicator: () =>
            "text-gray-500",
    };

    // =========================================================
    // PART 2 JSX STARTS HERE
    // =========================================================

    return (

        <div className="mx-auto w-full max-w-[1600px] p-2 md:p-4">

            {/* =====================================================
            PAGE HEADER
        ===================================================== */}

            <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-primary-dark md:flex-row md:items-center md:justify-between">

                <div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white md:text-2xl">
                        Create Product
                    </h1>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Add a new product to your store
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/admin/products")
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                    <ArrowLeft size={18} />

                    Back to Products
                </button>
            </div>

            {/* =====================================================
            FORM
        ===================================================== */}

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >

                <div className="flex flex-col-reverse gap-6 lg:flex-row w-full ">
                    <div className="lg:w-8/12 space-y-6">
                        {/* =================================================
                BASIC INFORMATION
            ================================================= */}

                        <section className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-primary-dark">

                            <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700 md:px-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Basic Information
                                </h2>

                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Enter the main information about this product.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 p-4 md:grid-cols-2 md:p-6">

                                {/* PRODUCT NAME */}

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Product Name
                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter product name"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-white"
                                    />
                                </div>

                                {/* BRAND */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Brand
                                    </label>

                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        placeholder="e.g. Fabrilife"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-white"
                                    />
                                </div>

                                {/* PRODUCT TYPE */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Product Type
                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <Select
                                        options={productTypes.map(
                                            (item) => ({
                                                value: String(
                                                    item._id
                                                ),
                                                label:
                                                    item.name,
                                            })
                                        )}
                                        value={
                                            productTypes
                                                .map(
                                                    (item) => ({
                                                        value: String(
                                                            item._id
                                                        ),
                                                        label:
                                                            item.name,
                                                    })
                                                )
                                                .find(
                                                    (item) =>
                                                        item.value ===
                                                        String(
                                                            formData.productTypeId
                                                        )
                                                ) || null
                                        }
                                        onChange={(option) => {
                                            setFormData(
                                                (
                                                    previous
                                                ) => ({
                                                    ...previous,

                                                    productTypeId:
                                                        option
                                                            ?.value ||
                                                        "",

                                                    categoryId:
                                                        "",

                                                    subCategoryId:
                                                        "",
                                                })
                                            );
                                        }}
                                        placeholder="Select product type"
                                        isClearable
                                        classNames={
                                            selectClassNames
                                        }
                                    />
                                </div>

                                {/* CATEGORY */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Category
                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <Select
                                        options={categories.map(
                                            (item) => ({
                                                value: String(
                                                    item._id
                                                ),
                                                label:
                                                    item.name,
                                            })
                                        )}
                                        value={
                                            categories
                                                .map(
                                                    (item) => ({
                                                        value: String(
                                                            item._id
                                                        ),
                                                        label:
                                                            item.name,
                                                    })
                                                )
                                                .find(
                                                    (item) =>
                                                        item.value ===
                                                        String(
                                                            formData.categoryId
                                                        )
                                                ) || null
                                        }
                                        onChange={(option) => {
                                            setFormData(
                                                (
                                                    previous
                                                ) => ({
                                                    ...previous,

                                                    categoryId:
                                                        option
                                                            ?.value ||
                                                        "",

                                                    subCategoryId:
                                                        "",
                                                })
                                            );
                                        }}
                                        placeholder="Select category"
                                        isClearable
                                        isDisabled={
                                            !formData.productTypeId
                                        }
                                        classNames={
                                            selectClassNames
                                        }
                                    />
                                </div>

                                {/* SUB CATEGORY */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Sub Category
                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <Select
                                        options={subCategories.map(
                                            (item) => ({
                                                value: String(
                                                    item._id
                                                ),
                                                label:
                                                    item.name,
                                            })
                                        )}
                                        value={
                                            subCategories
                                                .map(
                                                    (item) => ({
                                                        value: String(
                                                            item._id
                                                        ),
                                                        label:
                                                            item.name,
                                                    })
                                                )
                                                .find(
                                                    (item) =>
                                                        item.value ===
                                                        String(
                                                            formData.subCategoryId
                                                        )
                                                ) || null
                                        }
                                        onChange={(option) => {
                                            setFormData(
                                                (
                                                    previous
                                                ) => ({
                                                    ...previous,

                                                    subCategoryId:
                                                        option
                                                            ?.value ||
                                                        "",
                                                })
                                            );
                                        }}
                                        placeholder="Select sub category"
                                        isClearable
                                        isDisabled={
                                            !formData.categoryId
                                        }
                                        classNames={
                                            selectClassNames
                                        }
                                    />
                                </div>

                                {/* DESCRIPTION */}

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            formData.description
                                        }
                                        onChange={handleChange}
                                        rows={5}
                                        placeholder="Write product description..."
                                        className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-white"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* =================================================
                BASE PRICE
            ================================================= */}

                        <section className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-primary-dark">

                            <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700 md:px-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Base Price
                                </h2>

                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    These values are used as the default values when generating variations.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 p-4 md:grid-cols-3 md:p-6">

                                {/* MRP */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        MRP
                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                            ৳
                                        </span>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            name="mrp"
                                            value={
                                                formData.mrp
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="0"
                                            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-9 pr-4 text-sm text-gray-900 outline-none transition focus:border-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-white"
                                        />
                                    </div>
                                </div>

                                {/* SELLING PRICE */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Selling Price
                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                            ৳
                                        </span>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            name="sellingPrice"
                                            value={
                                                formData.sellingPrice
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="0"
                                            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-9 pr-4 text-sm text-gray-900 outline-none transition focus:border-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-white"
                                        />
                                    </div>
                                </div>

                                {/* DEFAULT STOCK */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Default Stock
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        name="quantity"
                                        value={
                                            formData.quantity
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="0"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-white"
                                    />

                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Used as the initial stock when generating variations.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* =================================================
                PRODUCT VARIATIONS
            ================================================= */}

                        <section className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-primary-dark">

                            <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700 md:px-6">

                                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Product Variations
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Choose how this product will be sold.
                                        </p>
                                    </div>

                                    {variationType !==
                                        "none" &&
                                        variations.length >
                                        0 && (
                                            <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm dark:bg-gray-800">
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Total Stock:
                                                </span>

                                                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                                                    {
                                                        totalStock
                                                    }
                                                </span>
                                            </div>
                                        )}
                                </div>
                            </div>

                            <div className="space-y-6 p-4 md:p-6">

                                {/* VARIATION TYPE */}

                                <div>
                                    <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Variation Type
                                    </label>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                                        {variationTypes.map(
                                            (type) => {
                                                const active =
                                                    variationType ===
                                                    type.value;

                                                return (
                                                    <button
                                                        key={
                                                            type.value
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            handleVariationTypeChange(
                                                                type.value
                                                            )
                                                        }
                                                        className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${active
                                                            ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900"
                                                            : "border-gray-300 bg-white text-gray-700 hover:border-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-400"
                                                            }`}
                                                    >
                                                        {
                                                            type.label
                                                        }
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>

                                {/* =========================================
                        COLOR SELECTION
                    ========================================= */}

                                {(variationType ===
                                    "color" ||
                                    variationType ===
                                    "color-size") && (
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                                Colors
                                            </label>

                                            <Select
                                                isMulti
                                                options={
                                                    colorOptions
                                                }
                                                value={
                                                    selectedColorOptions
                                                }
                                                onChange={(
                                                    selected
                                                ) => {
                                                    setSelectedColorIds(
                                                        (
                                                            selected ||
                                                            []
                                                        ).map(
                                                            (
                                                                item
                                                            ) =>
                                                                item.value
                                                        )
                                                    );

                                                    setVariationGenerated(
                                                        false
                                                    );
                                                }}
                                                placeholder="Select colors..."
                                                closeMenuOnSelect={
                                                    false
                                                }
                                                isClearable
                                                classNames={
                                                    selectClassNames
                                                }
                                            />

                                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                Select one or multiple colors.
                                            </p>
                                        </div>
                                    )}

                                {/* =========================================
                        SIZE SELECTION
                    ========================================= */}

                                {(variationType ===
                                    "size" ||
                                    variationType ===
                                    "color-size") && (
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                                Sizes
                                            </label>

                                            <Select
                                                isMulti
                                                options={
                                                    sizeOptions
                                                }
                                                value={
                                                    selectedSizeOptions
                                                }
                                                onChange={(
                                                    selected
                                                ) => {
                                                    setSelectedSizeIds(
                                                        (
                                                            selected ||
                                                            []
                                                        ).map(
                                                            (
                                                                item
                                                            ) =>
                                                                item.value
                                                        )
                                                    );

                                                    setVariationGenerated(
                                                        false
                                                    );
                                                }}
                                                placeholder="Select sizes..."
                                                closeMenuOnSelect={
                                                    false
                                                }
                                                isClearable
                                                classNames={
                                                    selectClassNames
                                                }
                                            />

                                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                Select one or multiple sizes.
                                            </p>
                                        </div>
                                    )}

                                {/* =========================================
                        GENERATE BUTTON
                    ========================================= */}

                                {variationType !==
                                    "none" && (
                                        <div className="flex flex-col gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-900/50 sm:flex-row sm:items-center sm:justify-between">

                                            <div>
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                    Generate Variations
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Each generated combination will have its own SKU, price and stock.
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={
                                                    generateVariations
                                                }
                                                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                                            >
                                                {variationGenerated
                                                    ? "Regenerate Variations"
                                                    : "Generate Variations"}
                                            </button>
                                        </div>
                                    )}

                                {/* =========================================
                        NO VARIATION STOCK
                    ========================================= */}

                                {variationType ===
                                    "none" && (
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">

                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                                <div>
                                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                        Simple Product
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        This product does not have color or size variations.
                                                    </p>
                                                </div>

                                                <div className="w-full sm:w-48">

                                                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                                                        Stock
                                                    </label>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        name="quantity"
                                                        value={
                                                            formData.quantity
                                                        }
                                                        onChange={
                                                            handleChange
                                                        }
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                {/* =========================================
                        VARIATION TABLE
                    ========================================= */}

                                {variations.length >
                                    0 && (
                                        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">

                                            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">

                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                                                    <div>
                                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            Generated Variations
                                                        </h3>

                                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                            {
                                                                variations.length
                                                            }{" "}
                                                            variation
                                                            {variations.length !==
                                                                1
                                                                ? "s"
                                                                : ""}{" "}
                                                            generated
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setVariationGenerated(
                                                                false
                                                            );
                                                        }}
                                                        className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                                    >
                                                        Edit Selection
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="overflow-x-auto">

                                                <table className="w-full min-w-[900px] text-left">

                                                    <thead className="bg-white dark:bg-primary-dark">

                                                        <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">

                                                            {variationType ===
                                                                "color" ||
                                                                variationType ===
                                                                "color-size" ? (
                                                                <th className="px-4 py-3">
                                                                    Color
                                                                </th>
                                                            ) : null}

                                                            {variationType ===
                                                                "size" ||
                                                                variationType ===
                                                                "color-size" ? (
                                                                <th className="px-4 py-3">
                                                                    Size
                                                                </th>
                                                            ) : null}

                                                            <th className="px-4 py-3">
                                                                SKU
                                                            </th>

                                                            <th className="px-4 py-3">
                                                                MRP
                                                            </th>

                                                            <th className="px-4 py-3">
                                                                Selling Price
                                                            </th>

                                                            <th className="px-4 py-3">
                                                                Stock
                                                            </th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>

                                                        {variations.map(
                                                            (
                                                                variation,
                                                                index
                                                            ) => (
                                                                <tr
                                                                    key={
                                                                        variation.key
                                                                    }
                                                                    className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                                                                >

                                                                    {/* COLOR */}

                                                                    {variationType ===
                                                                        "color" ||
                                                                        variationType ===
                                                                        "color-size" ? (
                                                                        <td className="px-4 py-3">

                                                                            <div className="flex items-center gap-2">

                                                                                {(() => {
                                                                                    const color =
                                                                                        colors.find(
                                                                                            (
                                                                                                item
                                                                                            ) =>
                                                                                                String(
                                                                                                    item._id
                                                                                                ) ===
                                                                                                String(
                                                                                                    variation.colorId
                                                                                                )
                                                                                        );

                                                                                    return color?.hexCode ? (
                                                                                        <span
                                                                                            className="h-5 w-5 rounded-full border border-gray-300"
                                                                                            style={{
                                                                                                backgroundColor:
                                                                                                    color.hexCode,
                                                                                            }}
                                                                                        />
                                                                                    ) : null;
                                                                                })()}

                                                                                <span className="text-sm text-gray-800 dark:text-gray-200">
                                                                                    {
                                                                                        variation.colorName
                                                                                    }
                                                                                </span>
                                                                            </div>

                                                                        </td>
                                                                    ) : null}

                                                                    {/* SIZE */}

                                                                    {variationType ===
                                                                        "size" ||
                                                                        variationType ===
                                                                        "color-size" ? (
                                                                        <td className="px-4 py-3">

                                                                            <span className="inline-flex rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                                                                {
                                                                                    variation.sizeName
                                                                                }
                                                                            </span>

                                                                        </td>
                                                                    ) : null}

                                                                    {/* SKU */}

                                                                    <td className="px-4 py-3">

                                                                        <input
                                                                            type="text"
                                                                            value={
                                                                                variation.sku
                                                                            }
                                                                            onChange={(
                                                                                event
                                                                            ) =>
                                                                                updateVariation(
                                                                                    index,
                                                                                    "sku",
                                                                                    event
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            className="w-full min-w-[170px] rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium uppercase text-gray-900 outline-none focus:border-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                                                        />

                                                                    </td>

                                                                    {/* MRP */}

                                                                    <td className="px-4 py-3">

                                                                        <div className="relative min-w-[130px]">

                                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                                                                ৳
                                                                            </span>

                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                step="0.01"
                                                                                value={
                                                                                    variation.mrp
                                                                                }
                                                                                onChange={(
                                                                                    event
                                                                                ) =>
                                                                                    updateVariation(
                                                                                        index,
                                                                                        "mrp",
                                                                                        event
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-7 pr-2 text-sm text-gray-900 outline-none focus:border-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                                                            />

                                                                        </div>

                                                                    </td>

                                                                    {/* SELLING PRICE */}

                                                                    <td className="px-4 py-3">

                                                                        <div className="relative min-w-[140px]">

                                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                                                                ৳
                                                                            </span>

                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                step="0.01"
                                                                                value={
                                                                                    variation.sellingPrice
                                                                                }
                                                                                onChange={(
                                                                                    event
                                                                                ) =>
                                                                                    updateVariation(
                                                                                        index,
                                                                                        "sellingPrice",
                                                                                        event
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-7 pr-2 text-sm text-gray-900 outline-none focus:border-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                                                            />

                                                                        </div>

                                                                    </td>

                                                                    {/* STOCK */}

                                                                    <td className="px-4 py-3">

                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            step="1"
                                                                            value={
                                                                                variation.quantity
                                                                            }
                                                                            onChange={(
                                                                                event
                                                                            ) =>
                                                                                updateVariation(
                                                                                    index,
                                                                                    "quantity",
                                                                                    event
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            className="w-full min-w-[100px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                                                        />

                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}

                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                {/* =========================================
                        COLOR IMAGES
                    ========================================= */}

                                {(variationType ===
                                    "color" ||
                                    variationType ===
                                    "color-size") &&
                                    selectedColorOptions.length >
                                    0 && (
                                        <div className="space-y-4">

                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    Color Images
                                                </h3>

                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Add images for each color. One image URL per line.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                                {selectedColorOptions.map(
                                                    (
                                                        color
                                                    ) => (
                                                        <div
                                                            key={
                                                                color.value
                                                            }
                                                            className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                                                        >

                                                            <div className="mb-3 flex items-center gap-2">

                                                                {color.hexCode && (
                                                                    <span
                                                                        className="h-5 w-5 rounded-full border border-gray-300"
                                                                        style={{
                                                                            backgroundColor:
                                                                                color.hexCode,
                                                                        }}
                                                                    />
                                                                )}

                                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {
                                                                        color.label
                                                                    }
                                                                </span>
                                                            </div>

                                                            <textarea
                                                                rows={4}
                                                                value={(
                                                                    colorImages[
                                                                    color
                                                                        .value
                                                                    ] ||
                                                                    []
                                                                ).join(
                                                                    "\n"
                                                                )}
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    handleColorImageChange(
                                                                        color.value,
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder={`https://example.com/${color.label.toLowerCase()}-1.jpg
https://example.com/${color.label.toLowerCase()}-2.jpg`}
                                                                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                                            />

                                                        </div>
                                                    )
                                                )}

                                            </div>
                                        </div>
                                    )}

                                {/* =========================================
                        SIZE / COMBINATION IMAGES
                    ========================================= */}

                                {(variationType ===
                                    "size" ||
                                    variationType ===
                                    "color-size") &&
                                    variations.length >
                                    0 && (
                                        <div className="rounded-xl border border-gray-200 dark:border-gray-700">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowSizeImages(
                                                        (
                                                            previous
                                                        ) =>
                                                            !previous
                                                    )
                                                }
                                                className="flex w-full items-center justify-between px-4 py-4 text-left"
                                            >
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        Size / Combination Images
                                                    </h3>

                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Optional images for individual size or color-size combinations.
                                                    </p>
                                                </div>

                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    {showSizeImages
                                                        ? "Hide"
                                                        : "Show"}
                                                </span>
                                            </button>

                                            {showSizeImages && (
                                                <div className="border-t border-gray-200 p-4 dark:border-gray-700">

                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                                        {variations.map(
                                                            (
                                                                variation
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        variation.key
                                                                    }
                                                                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                                                                >

                                                                    <div className="mb-3">

                                                                        <div className="flex flex-wrap items-center gap-2">

                                                                            {variation.colorName && (
                                                                                <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                                                                    {
                                                                                        variation.colorName
                                                                                    }
                                                                                </span>
                                                                            )}

                                                                            {variation.sizeName && (
                                                                                <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                                                                    {
                                                                                        variation.sizeName
                                                                                    }
                                                                                </span>
                                                                            )}

                                                                        </div>

                                                                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                                            SKU:{" "}
                                                                            <span className="font-medium">
                                                                                {
                                                                                    variation.sku
                                                                                }
                                                                            </span>
                                                                        </p>

                                                                    </div>

                                                                    <textarea
                                                                        rows={4}
                                                                        value={(
                                                                            sizeImages[
                                                                            variation
                                                                                .key
                                                                            ] ||
                                                                            []
                                                                        ).join(
                                                                            "\n"
                                                                        )}
                                                                        onChange={(
                                                                            event
                                                                        ) =>
                                                                            handleSizeImageChange(
                                                                                variation.key,
                                                                                event
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        placeholder="One image URL per line"
                                                                        className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                                                    />

                                                                </div>
                                                            )
                                                        )}

                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                            </div>
                        </section>

                        {/* =================================================
                            ADDITIONAL INFORMATION
                        ================================================= */}

                        <section className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-primary-dark">

                            <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700 md:px-6">

                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Additional Information
                                </h2>

                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Optional information that can help customers.
                                </p>

                            </div>

                            <div className="grid grid-cols-1 gap-5 p-4 md:grid-cols-2 md:p-6">

                                {/* MATERIAL */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Material
                                    </label>

                                    <input
                                        type="text"
                                        name="material"
                                        value={
                                            formData.material
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. 100% Cotton"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* WEIGHT */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Weight
                                    </label>

                                    <input
                                        type="text"
                                        name="weight"
                                        value={
                                            formData.weight
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. 450g"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* CARE INSTRUCTIONS */}

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Care Instructions
                                    </label>

                                    <textarea
                                        name="careInstructions"
                                        value={
                                            formData.careInstructions
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows={4}
                                        placeholder="Wash separately, do not bleach..."
                                        className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* SIZE CHART */}

                                {/* SIZE CHART SELECT */}

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Size Chart
                                    </label>

                                    <Select
                                        options={sizeChartOptions}
                                        value={
                                            sizeChartOptions.find(
                                                (item) =>
                                                    item.value === String(formData.sizeChartId)
                                            ) || null
                                        }
                                        onChange={(option) => {
                                            setFormData((previous) => ({
                                                ...previous,
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
                                        classNames={selectClassNames}
                                        formatOptionLabel={(option) => (
                                            <div className="flex items-center justify-between gap-3">
                                                <span>{option.label}</span>
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${option.type === "custom"
                                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                                                        : "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300"
                                                        }`}
                                                >
                                                    {option.type === "custom" ? "Custom" : "Image"}
                                                </span>
                                            </div>
                                        )}
                                    />

                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Optional. Select a saved size chart to display on the product page.
                                    </p>

                                    {/* SELECTED CHART PREVIEW */}
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

                                {/* TAGS */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Tags
                                    </label>

                                    <input
                                        type="text"
                                        name="tags"
                                        value={
                                            formData.tags
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="shirt, casual, cotton"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                    />

                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Separate tags using commas.
                                    </p>
                                </div>

                            </div>
                        </section>



                        {/* =================================================
                                                    STATUS
                            ================================================= */}

                        <section className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-primary-dark">

                            <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700 md:px-6">

                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Status
                                </h2>

                            </div>

                            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3 md:p-6">

                                {/* ACTIVE */}

                                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">

                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={
                                            formData.isActive
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="h-4 w-4 rounded border-gray-300"
                                    />

                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            Active
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Product will be visible in the store.
                                        </p>
                                    </div>

                                </label>

                                {/* FEATURED */}

                                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">

                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        checked={
                                            formData.isFeatured
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="h-4 w-4 rounded border-gray-300"
                                    />

                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            Featured Product
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Show this product in featured sections.
                                        </p>
                                    </div>

                                </label>

                                {/* NEW ARRIVAL */}

                                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">

                                    <input
                                        type="checkbox"
                                        name="isNewArrival"
                                        checked={
                                            formData.isNewArrival
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="h-4 w-4 rounded border-gray-300"
                                    />

                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            New Arrival
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Mark this product as a new arrival.
                                        </p>
                                    </div>

                                </label>

                            </div>
                        </section>



                    </div>
                    <div className="lg:w-5/12 space-y-6">
                        {/* =================================================
                PRODUCT IMAGES
            ================================================= */}
                        {/* <h2 className="mb-5 text-lg font-semibold">
                                    Upload Images
                                </h2> */}


                        <section className="flex flex-col items-center justify-center gap-4 rounded-sm border-dashed border-gray-200 dark:border-gray-700">

                            <div className="w-full">

                                <div className="flex flex-col gap-5">

                                    {/* ========================================= */}
                                    {/* MAIN / THUMBNAIL IMAGE */}
                                    {/* ========================================= */}

                                    <div className="flex flex-col gap-2">

                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Main Image
                                        </h3>

                                        <div
                                            className="relative flex lg:max-h-[600px] lg:max-w-[600px] max-h-[500px] max-w-[500px] items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">

                                            {formData.thumbnail ? (

                                                <>
                                                    {/* MAIN IMAGE */}

                                                    <img
                                                        src={formData.thumbnail}
                                                        alt="Product thumbnail"
                                                        className=" h-full w-full object-contain"
                                                    />

                                                    {/* CHANGE IMAGE BUTTON */}

                                                    <div
                                                        className="
                                    absolute
                                    bottom-4
                                    left-1/2
                                    -translate-x-1/2
                                "
                                                    >
                                                        <MediaLibrary
                                                            value={
                                                                formData.thumbnail
                                                                    ? [formData.thumbnail]
                                                                    : []
                                                            }
                                                            multiple={false}
                                                            buttonText="Change Image"
                                                            onChange={(image) => {
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    thumbnail: image,
                                                                }));
                                                            }}
                                                        />
                                                    </div>

                                                    {/* REMOVE IMAGE */}

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                thumbnail: "",
                                                            }));
                                                        }}
                                                        className="
                                    absolute
                                    right-3
                                    top-3
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-black/60
                                    text-white
                                    transition
                                    hover:bg-red-600
                                "
                                                        title="Remove main image"
                                                    >
                                                        ×
                                                    </button>
                                                </>

                                            ) : (

                                                /* ================================= */
                                                /* EMPTY MAIN IMAGE */
                                                /* ================================= */

                                                <div className="flex flex-col items-center justify-center gap-3 text-center w-full h-[500px]">

                                                    <div
                                                        className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800">
                                                        <ImageIcon
                                                            size={28}
                                                            className="text-gray-400"
                                                        />
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            No main image selected
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-400">
                                                            Select an image from your media library
                                                        </p>
                                                    </div>

                                                    <MediaLibrary
                                                        value={[]}
                                                        multiple={false}
                                                        buttonText="Select Main Image"
                                                        onChange={(image) => {
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                thumbnail: image,
                                                            }));
                                                        }}
                                                    />

                                                </div>

                                            )}

                                        </div>

                                    </div>


                                    {/* ========================================= */}
                                    {/* GALLERY IMAGES */}
                                    {/* ========================================= */}

                                    <div className="flex flex-col gap-3">

                                        <div className="flex items-center justify-between">

                                            <div>
                                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Gallery Images
                                                </h3>

                                                <p className="mt-1 text-xs text-gray-400">
                                                    Add additional product images
                                                </p>
                                            </div>

                                            <MediaLibrary
                                                value={formData.images}
                                                multiple={true}
                                                maxFiles={10}
                                                buttonText="Add Images"
                                                onChange={(images) => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        images,
                                                    }));
                                                }}
                                            />

                                        </div>


                                        {/* ================================= */}
                                        {/* GALLERY GRID */}
                                        {/* ================================= */}

                                        {formData.images?.length > 0 ? (

                                            <div
                                                className="
                            grid
                            grid-cols-2
                            gap-4
                            sm:grid-cols-3
                            md:grid-cols-4
                            lg:grid-cols-5
                        "
                                            >

                                                {formData.images.map((image, index) => (

                                                    <div
                                                        key={`${image}-${index}`}
                                                        className="
                                    group
                                    relative
                                    aspect-square
                                    overflow-hidden
                                    rounded-lg
                                    border
                                    border-gray-200
                                    bg-gray-50
                                    dark:border-gray-700
                                    dark:bg-gray-900
                                "
                                                    >

                                                        {/* IMAGE */}

                                                        <img
                                                            src={image}
                                                            alt={`Product gallery ${index + 1}`}
                                                            className="
                                        h-full
                                        w-full
                                        object-cover
                                        transition
                                        duration-300
                                        group-hover:scale-105
                                    "
                                                        />


                                                        {/* IMAGE NUMBER */}

                                                        <div
                                                            className="
                                        absolute
                                        left-2
                                        top-2
                                        flex
                                        h-7
                                        min-w-7
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-black/60
                                        px-2
                                        text-xs
                                        font-medium
                                        text-white
                                    "
                                                        >
                                                            {index + 1}
                                                        </div>


                                                        {/* REMOVE BUTTON */}

                                                        <button
                                                            type="button"
                                                            onClick={() => {

                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    images:
                                                                        prev.images.filter(
                                                                            (_, imageIndex) =>
                                                                                imageIndex !== index
                                                                        ),
                                                                }));

                                                            }}
                                                            className="
                                        absolute
                                        right-2
                                        top-2
                                        flex
                                        h-8
                                        w-8
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-black/60
                                        text-white
                                        opacity-0
                                        transition
                                        group-hover:opacity-100
                                        hover:bg-red-600
                                    "
                                                            title="Remove image"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>

                                                    </div>

                                                ))}

                                            </div>

                                        ) : (

                                            /* ================================= */
                                            /* EMPTY GALLERY */
                                            /* ================================= */

                                            <div
                                                className="
                            flex
                            min-h-[180px]
                            w-full
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-dashed
                            border-gray-300
                            bg-gray-50
                            dark:border-gray-700
                            dark:bg-gray-900
                        "
                                            >

                                                <div className="text-center">

                                                    <ImageIcon
                                                        size={32}
                                                        className="mx-auto text-gray-300"
                                                    />

                                                    <p className="mt-3 text-sm text-gray-500">
                                                        No gallery images added
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-400">
                                                        Add images using the button above
                                                    </p>

                                                </div>

                                            </div>

                                        )}

                                    </div>

                                </div>

                            </div>

                        </section>


                    </div>
                </div>
                {/* =================================================
                SUBMIT BAR
            ================================================= */}

                <div className="sticky bottom-0 z-30 -mx-2  p-3 backdrop-blur-md dark:border-gray-700 dark:bg-primary-dark/95 md:-mx-4 md:p-4">

                    <div className="mx-auto flex max-w-[1600px] flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">

                        <button
                            type="button"
                            disabled={loading}
                            onClick={() =>
                                navigate(
                                    "/admin/products"
                                )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                        >

                            {loading ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />

                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save
                                        size={18}
                                    />

                                    Create Product
                                </>
                            )}

                        </button>

                    </div>
                </div>
            </form>
        </div>
    );

};

export default ProductCreate;