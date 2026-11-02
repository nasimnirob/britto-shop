const express = require('express');
const cloudinary = require("cloudinary").v2;
const cors = require('cors');
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@brittodb.o3wjzwp.mongodb.net/?appName=brittodb`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// collections — connect once, reuse everywhere (client.close() removed on purpose)
let productsCollection;
let productTypesCollection;
let categoriesCollection;
let subCategoriesCollection;
let colorsCollection;
let sizesCollection;
let sizeChartsCollection;
let bundleProductsCollection;

async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // TODO: replace 'brittoshop' with your actual database name if different
        const db = client.db("brittoshop");
        productsCollection = db.collection("products");
        productTypesCollection = db.collection("productTypes");
        categoriesCollection = db.collection("categories");
        subCategoriesCollection = db.collection("subCategories");
        colorsCollection = db.collection("colors");
        sizesCollection = db.collection("sizes");
        sizeChartsCollection = db.collection("sizeCharts");
        bundleProductsCollection = db.collection("bundleProducts");
    } catch (err) {
        console.error("MongoDB connection failed:", err);
    }
}
run();


const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const slugToRegex = (value) => new RegExp(`^${escapeRegex(value).replace(/-/g, '[- ]')}$`, 'i');
const toSlug = (str, maxLength = 75) => {
    let slug = String(str || "")
        .toLowerCase()
        .trim()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");

    if (slug.length > maxLength) {
        slug = slug.substring(0, maxLength);
        const lastDash = slug.lastIndexOf("-");
        if (lastDash > 0) slug = slug.substring(0, lastDash);
        slug = slug.replace(/-+$/g, "");
    }

    return slug || "product";
};
const generateUniqueProductSlug = async (name, excludeId = null) => {
    const baseSlug = toSlug(name);

    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const query = { slug };

        if (excludeId) {
            query._id = {
                $ne: new ObjectId(excludeId),
            };
        }

        const existingProduct =
            await productsCollection.findOne(query);

        if (!existingProduct) {
            return slug;
        }

        counter += 1;
        slug = `${baseSlug}-${counter}`;
    }
};



const getObjectId = (value) => {
    if (!value || !ObjectId.isValid(value)) {
        return null;
    }

    return new ObjectId(value);
};

const calculateDiscountPercent = (mrp, sellingPrice) => {
    if (!mrp || mrp <= 0) return 0;

    const discount = ((mrp - sellingPrice) / mrp) * 100;

    return Math.max(0, Math.round(discount));
};

const validateProductHierarchy = async ({
    productTypeId,
    categoryId,
    subCategoryId
}) => {

    const productTypeObjectId = getObjectId(productTypeId);
    const categoryObjectId = getObjectId(categoryId);
    const subCategoryObjectId = getObjectId(subCategoryId);

    if (!productTypeObjectId) {
        return {
            valid: false,
            message: "Invalid productTypeId"
        };
    }

    if (!categoryObjectId) {
        return {
            valid: false,
            message: "Invalid categoryId"
        };
    }

    if (!subCategoryObjectId) {
        return {
            valid: false,
            message: "Invalid subCategoryId"
        };
    }

    const productType = await productTypesCollection.findOne({
        _id: productTypeObjectId,
        isActive: { $ne: false }
    });

    if (!productType) {
        return {
            valid: false,
            message: "Product type not found or inactive"
        };
    }

    const category = await categoriesCollection.findOne({
        _id: categoryObjectId,
        isActive: { $ne: false }
    });

    if (!category) {
        return {
            valid: false,
            message: "Category not found or inactive"
        };
    }

    if (
        !category.productTypeId.equals(productTypeObjectId)
    ) {
        return {
            valid: false,
            message: "Category does not belong to selected product type"
        };
    }

    const subCategory = await subCategoriesCollection.findOne({
        _id: subCategoryObjectId,
        isActive: { $ne: false }
    });

    if (!subCategory) {
        return {
            valid: false,
            message: "Sub category not found or inactive"
        };
    }

    if (
        !subCategory.categoryId.equals(categoryObjectId)
    ) {
        return {
            valid: false,
            message: "Sub category does not belong to selected category"
        };
    }

    if (
        !subCategory.productTypeId.equals(productTypeObjectId)
    ) {
        return {
            valid: false,
            message: "Sub category does not belong to selected product type"
        };
    }

    return {
        valid: true,
        productTypeObjectId,
        categoryObjectId,
        subCategoryObjectId
    };
};


const validateProductVariants = async (variants = []) => {

    if (!Array.isArray(variants)) {
        return {
            valid: false,
            message: "Variants must be an array"
        };
    }

    const usedColorIds = new Set();
    const usedSku = new Set();

    for (const variant of variants) {

        if (!variant.colorId) {
            return {
                valid: false,
                message: "Each variant must have a colorId"
            };
        }

        const colorId = getObjectId(variant.colorId);

        if (!colorId) {
            return {
                valid: false,
                message: "Invalid colorId"
            };
        }

        const colorKey = colorId.toString();

        if (usedColorIds.has(colorKey)) {
            return {
                valid: false,
                message: "Duplicate color variant is not allowed"
            };
        }

        usedColorIds.add(colorKey);

        const color = await colorsCollection.findOne({
            _id: colorId,
            isActive: true
        });

        if (!color) {
            return {
                valid: false,
                message: `Color not found or inactive: ${colorKey}`
            };
        }

        if (!Array.isArray(variant.sizes)) {
            return {
                valid: false,
                message: "Variant sizes must be an array"
            };
        }

        const usedSizeIds = new Set();

        for (const sizeItem of variant.sizes) {

            if (!sizeItem.sizeId) {
                return {
                    valid: false,
                    message: "Each size must have a sizeId"
                };
            }

            const sizeId = getObjectId(sizeItem.sizeId);

            if (!sizeId) {
                return {
                    valid: false,
                    message: "Invalid sizeId"
                };
            }

            const sizeKey = sizeId.toString();

            if (usedSizeIds.has(sizeKey)) {
                return {
                    valid: false,
                    message: "Duplicate size inside the same color is not allowed"
                };
            }

            usedSizeIds.add(sizeKey);

            const size = await sizesCollection.findOne({
                _id: sizeId,
                isActive: true
            });

            if (!size) {
                return {
                    valid: false,
                    message: `Size not found or inactive: ${sizeKey}`
                };
            }

            const sku = String(sizeItem.sku || "").trim();

            if (!sku) {
                return {
                    valid: false,
                    message: "SKU is required for every size"
                };
            }

            const skuKey = sku.toUpperCase();

            if (usedSku.has(skuKey)) {
                return {
                    valid: false,
                    message: `Duplicate SKU in product: ${sku}`
                };
            }

            usedSku.add(skuKey);

            const stock = Number(sizeItem.stock);

            if (!Number.isInteger(stock) || stock < 0) {
                return {
                    valid: false,
                    message: `Invalid stock for SKU: ${sku}`
                };
            }
        }
    }

    return {
        valid: true
    };
};


////////////////////////////// get all cloudinary media //////////////////////////////////////

app.get("/media", async (req, res) => {
    try {
        const limit = Math.min(
            Math.max(Number(req.query.limit) || 40, 1),
            100
        );

        const nextCursor = req.query.next_cursor || undefined;

        const result = await cloudinary.api.resources({
            resource_type: "image",
            type: "upload",
            max_results: limit,
            next_cursor: nextCursor,
            direction: "desc",
        });

        const resources = result.resources.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            display_name: item.display_name,
            format: item.format,
            width: item.width,
            height: item.height,
            bytes: item.bytes,
            created_at: item.created_at,
            secure_url: item.secure_url,
        }));

        res.json({
            success: true,
            resources,
            next_cursor: result.next_cursor || null,
        });
    } catch (error) {
        console.error("Media library error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load media library",
        });
    }
});


/////////////////////////////////////////// products /////////////////////////////////////////

app.get('/products', async (req, res) => {

    try {

        const {
            productTypeId,
            categoryId,
            subCategoryId,
            search,
            isFeatured,
            isNewArrival,
            isActive,
            page = 1,
            limit = 20
        } = req.query;

        const query = {};

        // Product Type filter
        if (productTypeId) {

            if (!ObjectId.isValid(productTypeId)) {
                return res.status(400).send({
                    message: "Invalid productTypeId"
                });
            }

            query.productTypeId = new ObjectId(productTypeId);
        }

        // Category filter
        if (categoryId) {

            if (!ObjectId.isValid(categoryId)) {
                return res.status(400).send({
                    message: "Invalid categoryId"
                });
            }

            query.categoryId = new ObjectId(categoryId);
        }

        // Sub Category filter
        if (subCategoryId) {

            if (!ObjectId.isValid(subCategoryId)) {
                return res.status(400).send({
                    message: "Invalid subCategoryId"
                });
            }

            query.subCategoryId = new ObjectId(subCategoryId);
        }

        if (search) {
            query.name = {
                $regex: search.trim(),
                $options: "i"
            };
        }

        if (isFeatured !== undefined) {
            query.isFeatured = isFeatured === "true";
        }

        if (isNewArrival !== undefined) {
            query.isNewArrival = isNewArrival === "true";
        }

        if (isActive !== undefined) {
            query.isActive = isActive === "true";
        }

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Math.max(1, Number(limit)));

        const skip = (pageNum - 1) * limitNum;

        const total = await productsCollection.countDocuments(query);

        const products = await productsCollection
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .toArray();

        res.send({
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
            products
        });

    } catch (err) {

        console.error(err);

        res.status(500).send({
            message: "Failed to fetch products",
            error: err.message
        });
    }
});

app.get('/products/:id', async (req, res) => {

    try {

        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "Invalid product id"
            });
        }

        const product = await productsCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!product) {
            return res.status(404).send({
                message: "Product not found"
            });
        }

        res.send(product);

    } catch (err) {

        console.error(err);

        res.status(500).send({
            message: "Failed to fetch product",
            error: err.message
        });
    }
});

app.post("/products", async (req, res) => {
    try {
        const product = req.body;

        // =====================================================
        // BASIC VALIDATION
        // =====================================================

        if (!product.name?.trim()) {
            return res.status(400).send({
                message: "Product name is required",
            });
        }

        if (!product.productTypeId) {
            return res.status(400).send({
                message: "Product type is required",
            });
        }

        if (!product.categoryId) {
            return res.status(400).send({
                message: "Category is required",
            });
        }

        if (!product.subCategoryId) {
            return res.status(400).send({
                message: "Sub category is required",
            });
        }

        const variationType =
            product.variationType || "none";

        const allowedVariationTypes = [
            "none",
            "color",
            "size",
            "color-size",
        ];

        if (!allowedVariationTypes.includes(variationType)) {
            return res.status(400).send({
                message: "Invalid variation type",
            });
        }

        const isSimpleProduct =
            variationType === "none";

        if (!Array.isArray(product.variants)) {
            return res.status(400).send({
                message: "Product variants must be an array",
            });
        }

        if (
            !isSimpleProduct &&
            product.variants.length === 0
        ) {
            return res.status(400).send({
                message:
                    "At least one variation is required",
            });
        }

        // =====================================================
        // VALIDATE + NORMALIZE VARIANTS
        // =====================================================

        const normalizedVariants = [];

        const skuSet = new Set();

        if (!isSimpleProduct) {
            for (const variant of product.variants) {
                // =========================
                // COLOR ID
                // =========================
                let colorId = null;

                if (
                    variant.colorId !== null &&
                    variant.colorId !== undefined &&
                    variant.colorId !== ""
                ) {
                    if (!ObjectId.isValid(variant.colorId)) {
                        return res.status(400).send({
                            message: "Invalid variation color id",
                        });
                    }

                    colorId = new ObjectId(variant.colorId);
                }

                // =========================
                // COLOR VALIDATION
                // =========================
                if (variationType === "color" && !colorId) {
                    return res.status(400).send({
                        message: "Color is required for color variation",
                    });
                }

                if (variationType === "size" && colorId) {
                    return res.status(400).send({
                        message: "Color is not allowed for size-only variation",
                    });
                }

                if (variationType === "color-size" && !colorId) {
                    return res.status(400).send({
                        message: "Color is required for color-size variation",
                    });
                }

                // =========================
                // SIZES / VARIATIONS
                // =========================
                if (
                    !Array.isArray(variant.sizes) ||
                    variant.sizes.length === 0
                ) {
                    return res.status(400).send({
                        message:
                            "Each variation must contain at least one size/variation",
                    });
                }

                const normalizedSizes = [];

                for (const sizeItem of variant.sizes) {
                    // =========================
                    // SIZE ID
                    // =========================
                    let sizeId = null;

                    if (
                        sizeItem.sizeId !== null &&
                        sizeItem.sizeId !== undefined &&
                        sizeItem.sizeId !== ""
                    ) {
                        if (!ObjectId.isValid(sizeItem.sizeId)) {
                            return res.status(400).send({
                                message: "Invalid variation size id",
                            });
                        }

                        sizeId = new ObjectId(sizeItem.sizeId);
                    }

                    // =========================
                    // SIZE VALIDATION
                    // =========================
                    if (
                        (variationType === "size" ||
                            variationType === "color-size") &&
                        !sizeId
                    ) {
                        return res.status(400).send({
                            message: "Size is required for this variation type",
                        });
                    }

                    if (variationType === "color" && sizeId) {
                        return res.status(400).send({
                            message: "Size is not allowed for color-only variation",
                        });
                    }

                    // =========================
                    // SKU
                    // =========================
                    const sku = String(sizeItem.sku || "").trim();

                    if (!sku) {
                        return res.status(400).send({
                            message: "SKU is required for every variation",
                        });
                    }

                    if (skuSet.has(sku)) {
                        return res.status(400).send({
                            message: `Duplicate SKU found: ${sku}`,
                        });
                    }

                    skuSet.add(sku);

                    // =========================
                    // PRICE
                    // =========================
                    const mrp = Number(sizeItem.price?.mrp);
                    const sellingPrice = Number(
                        sizeItem.price?.sellingPrice
                    );

                    if (
                        !Number.isFinite(mrp) ||
                        !Number.isFinite(sellingPrice)
                    ) {
                        return res.status(400).send({
                            message: `Invalid price for SKU: ${sku}`,
                        });
                    }

                    if (mrp < 0 || sellingPrice < 0) {
                        return res.status(400).send({
                            message: `Price cannot be negative for SKU: ${sku}`,
                        });
                    }

                    if (sellingPrice > mrp) {
                        return res.status(400).send({
                            message: `Selling price cannot be greater than MRP for SKU: ${sku}`,
                        });
                    }

                    // =========================
                    // STOCK
                    // =========================
                    const stock = Number(sizeItem.stock);

                    if (!Number.isInteger(stock) || stock < 0) {
                        return res.status(400).send({
                            message: `Invalid stock for SKU: ${sku}`,
                        });
                    }

                    // =========================
                    // SIZE LEVEL IMAGES
                    // =========================
                    const images = Array.isArray(sizeItem.images)
                        ? sizeItem.images
                            .map((image) => String(image).trim())
                            .filter(Boolean)
                        : [];

                    normalizedSizes.push({
                        sizeId,
                        images,
                        sku,
                        price: {
                            mrp,
                            sellingPrice,
                        },
                        stock,
                    });
                }

                // =========================
                // COLOR LEVEL IMAGES
                // =========================
                const images = Array.isArray(variant.images)
                    ? variant.images
                        .map((image) => String(image).trim())
                        .filter(Boolean)
                    : [];

                normalizedVariants.push({
                    colorId,
                    images,
                    sizes: normalizedSizes,
                });
            }
        }

        // =====================================================
        // PRODUCT PRICE
        // =====================================================

        const productMRP = Number(
            product.price?.mrp
        );

        const productSellingPrice = Number(
            product.price?.sellingPrice
        );

        if (
            !Number.isFinite(productMRP) ||
            productMRP <= 0
        ) {
            return res.status(400).send({
                message: "Invalid product MRP",
            });
        }

        if (
            !Number.isFinite(
                productSellingPrice
            ) ||
            productSellingPrice <= 0
        ) {
            return res.status(400).send({
                message:
                    "Invalid product selling price",
            });
        }

        if (
            productSellingPrice >
            productMRP
        ) {
            return res.status(400).send({
                message:
                    "Product selling price cannot be greater than MRP",
            });
        }

        // =====================================================
        // TOTAL STOCK
        // =====================================================

        let totalStock = 0;

        if (isSimpleProduct) {

            totalStock = Number(
                product.totalStock
            );

            if (
                !Number.isFinite(totalStock) ||
                totalStock < 0
            ) {
                return res.status(400).send({
                    message:
                        "Invalid product stock",
                });
            }

        } else {

            totalStock =
                normalizedVariants.reduce(
                    (total, variant) => {
                        return (
                            total +
                            variant.sizes.reduce(
                                (
                                    variantTotal,
                                    size
                                ) =>
                                    variantTotal +
                                    Number(
                                        size.stock
                                    ),
                                0
                            )
                        );
                    },
                    0
                );
        }

        // =====================================================
        // FINAL PRODUCT
        // =====================================================

        const now = new Date();

        // =====================================================
        // SIZE CHART SNAPSHOT
        // =====================================================

        let sizeChartSnapshot = null;

        if (
            product.sizeChartId &&
            ObjectId.isValid(product.sizeChartId)
        ) {
            const chart = await sizeChartsCollection.findOne({
                _id: new ObjectId(product.sizeChartId),
                isActive: true,
            });

            if (chart) {
                sizeChartSnapshot = {
                    _id: chart._id,
                    name: chart.name,
                    type: chart.type || "image",
                    image: chart.image || "",
                    headers: chart.headers || [],
                    rows: chart.rows || [],
                    unit: chart.unit || "inch",
                    description: chart.description || "",
                };
            }
        }

        const slug = await generateUniqueProductSlug(
            product.name
        );

        const finalProduct = {
            ...product,

            name: product.name.trim(),

            slug,

            sizeChartId: sizeChartSnapshot?._id || null,
            sizeChart: sizeChartSnapshot,

            variationType,

            variants:
                normalizedVariants,

            totalStock,

            price: {
                mrp: productMRP,

                sellingPrice:
                    productSellingPrice,

                discountPercent:
                    Math.round(
                        (
                            (
                                productMRP -
                                productSellingPrice
                            ) /
                            productMRP
                        ) * 100
                    ),

                currency: "BDT",
            },

            isActive:
                product.isActive ?? true,

            createdAt: now,

            updatedAt: now,
        };

        delete finalProduct._id;

        const result =
            await productsCollection.insertOne(
                finalProduct
            );

        res.status(201).send({
            success: true,

            message:
                "Product created successfully",

            product: {
                _id: result.insertedId,
                ...finalProduct,
            },
        });

    } catch (err) {
        console.error(
            "Create product error:",
            err
        );

        res.status(500).send({
            message:
                "Failed to create product",

            error: err.message,
        });
    }
});

app.patch("/products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "Invalid product id",
            });
        }

        const existingProduct =
            await productsCollection.findOne({
                _id: new ObjectId(id),
            });

        if (!existingProduct) {
            return res.status(404).send({
                message: "Product not found",
            });
        }

        const product = req.body;

        // =====================================================
        // BASIC VALIDATION
        // =====================================================

        if (!product.name?.trim()) {
            return res.status(400).send({
                message: "Product name is required",
            });
        }

        if (!product.productTypeId) {
            return res.status(400).send({
                message:
                    "Product type is required",
            });
        }

        if (!product.categoryId) {
            return res.status(400).send({
                message:
                    "Category is required",
            });
        }

        if (!product.subCategoryId) {
            return res.status(400).send({
                message:
                    "Sub category is required",
            });
        }

        const variationType = product.variationType || "none";

        const allowedVariationTypes = [
            "none",
            "color",
            "size",
            "color-size",
        ];

        if (!allowedVariationTypes.includes(variationType)) {
            return res.status(400).send({
                message: "Invalid variation type",
            });
        }

        const isSimpleProduct = variationType === "none";

        if (!Array.isArray(product.variants)) {
            return res.status(400).send({
                message:
                    "Product variants must be an array",
            });
        }

        if (
            !isSimpleProduct &&
            product.variants.length === 0
        ) {
            return res.status(400).send({
                message:
                    "At least one variation is required",
            });
        }

        // =====================================================
        // NORMALIZE VARIANTS
        // =====================================================

        const normalizedVariants = [];

        const skuSet = new Set();

        if (!isSimpleProduct) {
            for (const variant of product.variants) {
                // =========================
                // COLOR ID
                // =========================
                let colorId = null;

                if (
                    variant.colorId !== null &&
                    variant.colorId !== undefined &&
                    variant.colorId !== ""
                ) {
                    if (!ObjectId.isValid(variant.colorId)) {
                        return res.status(400).send({
                            message: "Invalid variation color id",
                        });
                    }

                    colorId = new ObjectId(variant.colorId);
                }

                // =========================
                // COLOR VALIDATION
                // =========================
                if (variationType === "color" && !colorId) {
                    return res.status(400).send({
                        message: "Color is required for color variation",
                    });
                }

                if (variationType === "size" && colorId) {
                    return res.status(400).send({
                        message: "Color is not allowed for size-only variation",
                    });
                }

                if (variationType === "color-size" && !colorId) {
                    return res.status(400).send({
                        message: "Color is required for color-size variation",
                    });
                }

                // =========================
                // SIZES
                // =========================
                if (
                    !Array.isArray(variant.sizes) ||
                    variant.sizes.length === 0
                ) {
                    return res.status(400).send({
                        message:
                            "Each variation must contain at least one size/variation",
                    });
                }

                const normalizedSizes = [];

                for (const sizeItem of variant.sizes) {
                    // =========================
                    // SIZE ID
                    // =========================
                    let sizeId = null;

                    if (
                        sizeItem.sizeId !== null &&
                        sizeItem.sizeId !== undefined &&
                        sizeItem.sizeId !== ""
                    ) {
                        if (!ObjectId.isValid(sizeItem.sizeId)) {
                            return res.status(400).send({
                                message: "Invalid variation size id",
                            });
                        }

                        sizeId = new ObjectId(sizeItem.sizeId);
                    }

                    // =========================
                    // SIZE VALIDATION
                    // =========================
                    if (
                        (variationType === "size" ||
                            variationType === "color-size") &&
                        !sizeId
                    ) {
                        return res.status(400).send({
                            message: "Size is required for this variation type",
                        });
                    }

                    if (variationType === "color" && sizeId) {
                        return res.status(400).send({
                            message: "Size is not allowed for color-only variation",
                        });
                    }

                    // =========================
                    // SKU
                    // =========================
                    const sku = String(sizeItem.sku || "").trim();

                    if (!sku) {
                        return res.status(400).send({
                            message: "SKU is required for every variation",
                        });
                    }

                    if (skuSet.has(sku)) {
                        return res.status(400).send({
                            message: `Duplicate SKU found: ${sku}`,
                        });
                    }

                    skuSet.add(sku);

                    // =========================
                    // PRICE
                    // =========================
                    const mrp = Number(sizeItem.price?.mrp);
                    const sellingPrice = Number(
                        sizeItem.price?.sellingPrice
                    );

                    if (
                        !Number.isFinite(mrp) ||
                        !Number.isFinite(sellingPrice)
                    ) {
                        return res.status(400).send({
                            message: `Invalid price for SKU: ${sku}`,
                        });
                    }

                    if (mrp < 0 || sellingPrice < 0) {
                        return res.status(400).send({
                            message: `Price cannot be negative for SKU: ${sku}`,
                        });
                    }

                    if (sellingPrice > mrp) {
                        return res.status(400).send({
                            message: `Selling price cannot be greater than MRP for SKU: ${sku}`,
                        });
                    }

                    // =========================
                    // STOCK
                    // =========================
                    const stock = Number(sizeItem.stock);

                    if (!Number.isInteger(stock) || stock < 0) {
                        return res.status(400).send({
                            message: `Invalid stock for SKU: ${sku}`,
                        });
                    }

                    // =========================
                    // SIZE LEVEL IMAGES
                    // =========================
                    const images = Array.isArray(sizeItem.images)
                        ? sizeItem.images
                            .map((image) => String(image).trim())
                            .filter(Boolean)
                        : [];

                    normalizedSizes.push({
                        sizeId,
                        images,
                        sku,
                        price: {
                            mrp,
                            sellingPrice,
                        },
                        stock,
                    });
                }

                // =========================
                // COLOR LEVEL IMAGES
                // =========================
                const images = Array.isArray(variant.images)
                    ? variant.images
                        .map((image) => String(image).trim())
                        .filter(Boolean)
                    : [];

                normalizedVariants.push({
                    colorId,
                    images,
                    sizes: normalizedSizes,
                });
            }
        }

        // =====================================================
        // PRODUCT PRICE
        // =====================================================

        const productMRP = Number(
            product.price?.mrp
        );

        const productSellingPrice =
            Number(
                product.price?.sellingPrice
            );

        if (
            !Number.isFinite(
                productMRP
            ) ||
            productMRP <= 0
        ) {
            return res.status(400).send({
                message:
                    "Invalid product MRP",
            });
        }

        if (
            !Number.isFinite(
                productSellingPrice
            ) ||
            productSellingPrice <= 0
        ) {
            return res.status(400).send({
                message:
                    "Invalid product selling price",
            });
        }

        if (
            productSellingPrice >
            productMRP
        ) {
            return res.status(400).send({
                message:
                    "Product selling price cannot be greater than MRP",
            });
        }

        // =====================================================
        // TOTAL STOCK
        // =====================================================

        let totalStock = 0;

        if (isSimpleProduct) {
            totalStock = Number(
                product.totalStock
            );

            if (
                !Number.isFinite(totalStock) ||
                totalStock < 0
            ) {
                return res.status(400).send({
                    message:
                        "Invalid product stock",
                });
            }
        } else {
            totalStock =
                normalizedVariants.reduce(
                    (total, variant) =>
                        total +
                        variant.sizes.reduce(
                            (sum, size) =>
                                sum + Number(size.stock),
                            0
                        ),
                    0
                );
        }

        // =====================================================
        // UPDATE
        // =====================================================

        const existingSlug =
            existingProduct.slug;

        let slug = existingSlug;

        if (
            product.name.trim() !==
            existingProduct.name.trim()
        ) {
            slug =
                await generateUniqueProductSlug(
                    product.name,
                    id
                );
        }

        // =====================================================
        // SIZE CHART SNAPSHOT (UPDATE)
        // =====================================================

        let sizeChartSnapshot = null;
        let sizeChartId = null;

        const hasSizeChartField = Object.prototype.hasOwnProperty.call(
            product,
            "sizeChartId"
        );

        if (hasSizeChartField) {

            if (
                product.sizeChartId &&
                ObjectId.isValid(product.sizeChartId)
            ) {
                const chart = await sizeChartsCollection.findOne({
                    _id: new ObjectId(product.sizeChartId),
                    isActive: true,
                });

                if (chart) {
                    sizeChartSnapshot = {
                        _id: chart._id,
                        name: chart.name,
                        type: chart.type || "image",
                        image: chart.image || "",
                        headers: chart.headers || [],
                        rows: chart.rows || [],
                        unit: chart.unit || "inch",
                        description: chart.description || "",
                    };
                    sizeChartId = chart._id;
                }
            }
        } else {
            sizeChartSnapshot = existingProduct.sizeChart || null;
            sizeChartId = existingProduct.sizeChartId || null;
        }

        const updatedDoc = {
            ...product,

            name: product.name.trim(),
            slug,

            sizeChartId,
            sizeChart: sizeChartSnapshot,

            variationType,
            variants: normalizedVariants,
            totalStock,

            price: {
                mrp: productMRP,
                sellingPrice: productSellingPrice,
                discountPercent: Math.round(
                    ((productMRP - productSellingPrice) / productMRP) * 100
                ),
                currency: "BDT",
            },

            updatedAt: new Date(),
        };

        delete updatedDoc._id;
        delete updatedDoc.createdAt;

        await productsCollection.updateOne(
            {
                _id:
                    new ObjectId(id),
            },
            {
                $set:
                    updatedDoc,
            }
        );

        const updatedProduct =
            await productsCollection.findOne(
                {
                    _id:
                        new ObjectId(id),
                }
            );

        res.send({
            success: true,

            message:
                "Product updated successfully",

            product:
                updatedProduct,
        });

    } catch (err) {
        console.error(
            "Update product error:",
            err
        );

        res.status(500).send({
            message:
                "Failed to update product",

            error: err.message,
        });
    }
});

app.delete('/products/:id', async (req, res) => {

    try {

        const { id } = req.params;

        if (!ObjectId.isValid(id)) {

            return res.status(400).send({
                message: "Invalid product id"
            });
        }

        const result =
            await productsCollection.updateOne(

                {
                    _id: new ObjectId(id)
                },

                {
                    $set: {
                        isActive: false,
                        updatedAt: new Date()
                    }
                }
            );


        if (result.matchedCount === 0) {

            return res.status(404).send({
                message: "Product not found"
            });
        }


        res.send({
            message: "Product deactivated successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).send({

            message: "Failed to delete product",

            error: err.message
        });
    }
});



/////////////////////// bundle product //////////////////////////

// const generateBundleSlug = async (name, excludeId = null) => {
//     const baseSlug = toSlug(name);

//     let slug = baseSlug;
//     let counter = 1;

//     while (true) {
//         const query = { slug };

//         if (excludeId) {
//             query._id = { $ne: new ObjectId(excludeId) };
//         }

//         const exists = await bundleProductsCollection.findOne(query);

//         if (!exists) {
//             return slug;
//         }

//         slug = `${baseSlug}-${counter++}`;
//     }
// };

// const validateBundleProducts = async (products) => {
//     if (!Array.isArray(products) || products.length === 0) {
//         throw new Error("At least one product is required");
//     }

//     const seen = new Set();
//     const productIds = [];

//     for (const item of products) {
//         if (!item?.productId) {
//             throw new Error("Each bundle item must have productId");
//         }

//         const productId = String(item.productId);

//         if (!ObjectId.isValid(productId)) {
//             throw new Error(`Invalid productId: ${productId}`);
//         }

//         if (seen.has(productId)) {
//             throw new Error("Duplicate products are not allowed");
//         }

//         seen.add(productId);
//         productIds.push(new ObjectId(productId));

//         const quantity = Number(item.quantity);

//         if (!Number.isInteger(quantity) || quantity <= 0) {
//             throw new Error(
//                 `Invalid quantity for product ${productId}`
//             );
//         }
//     }

//     const sourceProducts = await productsCollection
//         .find({
//             _id: { $in: productIds },
//             isActive: true,
//         })
//         .toArray();

//     if (sourceProducts.length !== productIds.length) {
//         throw new Error(
//             "One or more selected products were not found or are inactive"
//         );
//     }

//     return sourceProducts;
// };

// app.post("/bundle-products", async (req, res) => {
//     try {
//         const {
//             name,
//             thumbnail,
//             images = [],
//             description = "",
//             products,
//             price,
//         } = req.body;

//         if (!name?.trim()) {
//             return res.status(400).json({
//                 message: "Bundle name is required",
//             });
//         }

//         if (!thumbnail?.trim()) {
//             return res.status(400).json({
//                 message: "Bundle thumbnail is required",
//             });
//         }

//         const sellingPrice = Number(price?.sellingPrice);

//         if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) {
//             return res.status(400).json({
//                 message: "Valid bundle selling price is required",
//             });
//         }

//         const sourceProducts = await validateBundleProducts(products);

//         const sourceMap = new Map(
//             sourceProducts.map((product) => [
//                 String(product._id),
//                 product,
//             ])
//         );

//         let originalValue = 0;

//         for (const item of products) {
//             const product = sourceMap.get(String(item.productId));

//             originalValue +=
//                 Number(product.price?.sellingPrice || 0) *
//                 Number(item.quantity);
//         }

//         if (sellingPrice >= originalValue) {
//             return res.status(400).json({
//                 message:
//                     "Bundle selling price must be lower than the current product value",
//                 originalValue,
//             });
//         }

//         const slug = await generateBundleSlug(name);

//         const bundleProducts = products.map((item) => ({
//             productId: new ObjectId(item.productId),
//             quantity: Number(item.quantity),
//         }));

//         const bundle = {
//             name: name.trim(),
//             slug,

//             thumbnail: thumbnail.trim(),

//             images: Array.isArray(images)
//                 ? images
//                     .map((image) => String(image).trim())
//                     .filter(Boolean)
//                 : [],

//             description: description?.trim() || "",

//             products: bundleProducts,

//             price: {
//                 sellingPrice,
//                 currency: "BDT",
//             },

//             isActive: true,

//             createdAt: new Date(),
//             updatedAt: new Date(),
//         };

//         const result =
//             await bundleProductsCollection.insertOne(bundle);

//         res.status(201).json({
//             message: "Bundle product created successfully",
//             bundleId: result.insertedId,
//         });
//     } catch (error) {
//         console.error("Create bundle error:", error);

//         res.status(500).json({
//             message: error.message || "Failed to create bundle",
//         });
//     }
// });

// app.get("/bundle-products", async (req, res) => {
//     try {
//         const {
//             search = "",
//             isActive = "true",
//             page = 1,
//             limit = 10,
//         } = req.query;

//         const currentPage = Math.max(Number(page) || 1, 1);
//         const perPage = Math.min(Math.max(Number(limit) || 10, 1), 100);

//         // ----------------------------------------------------------
//         // 1. Build bundle filter
//         // ----------------------------------------------------------
//         const bundleFilter = {};

//         if (isActive === "true") {
//             bundleFilter.isActive = true;
//         } else if (isActive === "false") {
//             bundleFilter.isActive = false;
//         }

//         if (search.trim()) {
//             const searchRegex = new RegExp(search.trim(), "i");

//             bundleFilter.$or = [
//                 { name: searchRegex },
//                 { slug: searchRegex },
//             ];
//         }

//         // ----------------------------------------------------------
//         // 2. Get total count
//         // ----------------------------------------------------------
//         const total = await bundleProductsCollection.countDocuments(
//             bundleFilter
//         );

//         const totalPages = Math.ceil(total / perPage);

//         // ----------------------------------------------------------
//         // 3. Get bundle documents
//         // ----------------------------------------------------------
//         const bundles = await bundleProductsCollection
//             .find(bundleFilter)
//             .sort({ createdAt: -1 })
//             .skip((currentPage - 1) * perPage)
//             .limit(perPage)
//             .toArray();

//         // ----------------------------------------------------------
//         // 4. Collect all source product IDs
//         // ----------------------------------------------------------
//         const productIds = [];

//         for (const bundle of bundles) {
//             for (const item of bundle.products || []) {
//                 if (item.productId) {
//                     productIds.push(item.productId);
//                 }
//             }
//         }

//         // Remove duplicate IDs
//         const uniqueProductIds = [
//             ...new Map(
//                 productIds.map((id) => [String(id), id])
//             ).values(),
//         ];

//         // ----------------------------------------------------------
//         // 5. Get current/live products
//         // ----------------------------------------------------------
//         const sourceProducts =
//             uniqueProductIds.length > 0
//                 ? await productsCollection
//                     .find({
//                         _id: { $in: uniqueProductIds },
//                     })
//                     .toArray()
//                 : [];

//         // ----------------------------------------------------------
//         // 6. Create quick product lookup
//         // ----------------------------------------------------------
//         const productMap = new Map(
//             sourceProducts.map((product) => [
//                 String(product._id),
//                 product,
//             ])
//         );

//         // ----------------------------------------------------------
//         // 7. Build response
//         // ----------------------------------------------------------
//         const formattedBundles = bundles.map((bundle) => {
//             let originalValue = 0;
//             let totalStock = Infinity;

//             const products = (bundle.products || []).map((item) => {
//                 const product = productMap.get(
//                     String(item.productId)
//                 );

//                 // Source product deleted/not found
//                 if (!product) {
//                     return {
//                         productId: item.productId,
//                         quantity: item.quantity,
//                         product: null,
//                     };
//                 }

//                 // ------------------------------------------------------
//                 // Current product selling price
//                 // ------------------------------------------------------
//                 const sellingPrice =
//                     Number(product?.price?.sellingPrice) || 0;

//                 // Add current source product value
//                 originalValue +=
//                     sellingPrice * Number(item.quantity || 1);

//                 // ------------------------------------------------------
//                 // Calculate available bundle stock
//                 //
//                 // Example:
//                 // Product A = 10 stock, quantity = 1
//                 // Product B = 6 stock, quantity = 2
//                 //
//                 // Bundle stock:
//                 // A = 10 / 1 = 10
//                 // B = 6 / 2 = 3
//                 //
//                 // Final bundle stock = 3
//                 // ------------------------------------------------------
//                 const sourceStock =
//                     Number(product?.totalStock) || 0;

//                 const requiredQuantity =
//                     Number(item.quantity) || 1;

//                 const possibleBundles = Math.floor(
//                     sourceStock / requiredQuantity
//                 );

//                 totalStock = Math.min(
//                     totalStock,
//                     possibleBundles
//                 );

//                 return {
//                     productId: item.productId,
//                     quantity: requiredQuantity,

//                     product: {
//                         _id: product._id,
//                         name: product.name,
//                         slug: product.slug,
//                         thumbnail: product.thumbnail,

//                         price: {
//                             sellingPrice,
//                         },

//                         totalStock: sourceStock,

//                         isActive:
//                             product.isActive !== false,
//                     },
//                 };
//             });

//             // --------------------------------------------------------
//             // Bundle selling price
//             // --------------------------------------------------------
//             const bundleSellingPrice =
//                 Number(bundle?.price?.sellingPrice) || 0;

//             // --------------------------------------------------------
//             // Calculate savings
//             // --------------------------------------------------------
//             const savings = Math.max(
//                 originalValue - bundleSellingPrice,
//                 0
//             );

//             // --------------------------------------------------------
//             // Calculate discount percentage
//             // --------------------------------------------------------
//             const discountPercent =
//                 originalValue > 0
//                     ? Math.round(
//                         (savings / originalValue) * 100
//                     )
//                     : 0;

//             // If bundle has no products
//             if (totalStock === Infinity) {
//                 totalStock = 0;
//             }

//             return {
//                 ...bundle,

//                 // Keep original stored fields if needed
//                 products,

//                 // Live calculated pricing
//                 pricing: {
//                     originalValue,
//                     sellingPrice: bundleSellingPrice,
//                     savings,
//                     discountPercent,
//                     currency:
//                         bundle?.price?.currency || "BDT",
//                 },

//                 // Live calculated stock
//                 totalStock,
//             };
//         });

//         // ----------------------------------------------------------
//         // 8. Response
//         // ----------------------------------------------------------
//         res.status(200).json({
//             success: true,

//             bundles: formattedBundles,

//             pagination: {
//                 total,
//                 page: currentPage,
//                 limit: perPage,
//                 totalPages,
//             },

//             // Keep these too because frontend may directly use them
//             total,
//             page: currentPage,
//             limit: perPage,
//             totalPages,
//         });
//     } catch (error) {
//         console.error(
//             "GET /bundle-products error:",
//             error
//         );

//         res.status(500).json({
//             success: false,
//             message: "Failed to fetch bundle products",
//             error: error.message,
//         });
//     }
// });

// app.get("/bundle-products/:id", async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (!ObjectId.isValid(id)) {
//             return res.status(400).send({
//                 success: false,
//                 message: "Invalid bundle id",
//             });
//         }

//         const bundle = await bundleProductsCollection.findOne({
//             _id: new ObjectId(id),
//         });

//         if (!bundle) {
//             return res.status(404).send({
//                 success: false,
//                 message: "Bundle product not found",
//             });
//         }

//         const productIds = bundle.products.map(
//             (item) => item.productId
//         );

//         const products = await productsCollection
//             .find({
//                 _id: { $in: productIds },
//             })
//             .project({
//                 name: 1,
//                 slug: 1,
//                 thumbnail: 1,
//                 images: 1,
//                 description: 1,

//                 variationType: 1,
//                 variants: 1,

//                 price: 1,
//                 totalStock: 1,

//                 isActive: 1,

//                 sizeChartId: 1,
//                 sizeChart: 1,
//             })
//             .toArray();

//         const productMap = new Map(
//             products.map((product) => [
//                 String(product._id),
//                 product,
//             ])
//         );

//         const bundleProducts = bundle.products.map((item) => {
//             const product = productMap.get(
//                 String(item.productId)
//             );

//             return {
//                 productId: item.productId,
//                 quantity: item.quantity,

//                 product: product || null,
//             };
//         });

//         /*
//         |--------------------------------------------------------------------------
//         | Base original value
//         |--------------------------------------------------------------------------
//         */

//         const originalValue = bundleProducts.reduce(
//             (total, item) => {
//                 const sellingPrice =
//                     Number(
//                         item.product?.price?.sellingPrice
//                     ) || 0;

//                 return (
//                     total +
//                     sellingPrice * Number(item.quantity || 1)
//                 );
//             },
//             0
//         );

//         const bundleSellingPrice =
//             Number(bundle.price?.sellingPrice) || 0;

//         const savings = Math.max(
//             0,
//             originalValue - bundleSellingPrice
//         );

//         const discountPercent =
//             originalValue > 0
//                 ? Math.round(
//                     (savings / originalValue) * 100
//                 )
//                 : 0;

//         res.send({
//             success: true,

//             bundle: {
//                 ...bundle,

//                 products: bundleProducts,

//                 pricing: {
//                     originalValue,
//                     sellingPrice: bundleSellingPrice,
//                     savings,
//                     discountPercent,
//                     currency: "BDT",
//                 },
//             },
//         });

//     } catch (err) {
//         console.error(
//             "Bundle details error:",
//             err
//         );

//         res.status(500).send({
//             success: false,
//             message: "Failed to fetch bundle product",
//             error: err.message,
//         });
//     }
// });

// app.patch("/bundle-products/:id",
//     async (req, res) => {
//         try {
//             const { id } = req.params;

//             if (!ObjectId.isValid(id)) {
//                 return res.status(400).json({
//                     message:
//                         "Invalid bundle ID",
//                 });
//             }

//             const existingBundle =
//                 await bundleProductsCollection.findOne({
//                     _id: new ObjectId(id),
//                 });

//             if (!existingBundle) {
//                 return res.status(404).json({
//                     message:
//                         "Bundle product not found",
//                 });
//             }

//             const {
//                 name,
//                 thumbnail,
//                 images,
//                 description,
//                 products,
//                 price,
//                 isActive,
//             } = req.body;

//             // ------------------------------------------------------
//             // Name
//             // ------------------------------------------------------

//             if (
//                 !name ||
//                 typeof name !== "string" ||
//                 !name.trim()
//             ) {
//                 return res.status(400).json({
//                     message:
//                         "Bundle name is required",
//                 });
//             }

//             // ------------------------------------------------------
//             // Thumbnail
//             // ------------------------------------------------------

//             if (
//                 !thumbnail ||
//                 typeof thumbnail !== "string"
//             ) {
//                 return res.status(400).json({
//                     message:
//                         "Bundle thumbnail is required",
//                 });
//             }

//             // ------------------------------------------------------
//             // Price
//             // ------------------------------------------------------

//             const mrp = Number(
//                 price?.mrp
//             );

//             const sellingPrice = Number(
//                 price?.sellingPrice
//             );

//             if (
//                 !Number.isFinite(mrp) ||
//                 mrp < 0
//             ) {
//                 return res.status(400).json({
//                     message:
//                         "Invalid MRP",
//                 });
//             }

//             if (
//                 !Number.isFinite(sellingPrice) ||
//                 sellingPrice <= 0
//             ) {
//                 return res.status(400).json({
//                     message:
//                         "Invalid selling price",
//                 });
//             }

//             if (mrp > 0 && sellingPrice > mrp) {
//                 return res.status(400).json({
//                     message:
//                         "Selling price cannot be greater than MRP",
//                 });
//             }

//             // ------------------------------------------------------
//             // Products
//             // ------------------------------------------------------

//             const normalizedProducts =
//                 await validateBundleProducts(
//                     products
//                 );

//             // ------------------------------------------------------
//             // Slug
//             // ------------------------------------------------------

//             let slug =
//                 existingBundle.slug;

//             if (
//                 existingBundle.name.trim() !==
//                 name.trim()
//             ) {
//                 slug =
//                     await generateBundleSlug(
//                         name,
//                         id
//                     );
//             }

//             // ------------------------------------------------------
//             // Discount
//             // ------------------------------------------------------

//             const discountPercent =
//                 calculateDiscountPercent(
//                     mrp,
//                     sellingPrice
//                 );

//             // ------------------------------------------------------
//             // Stock
//             // ------------------------------------------------------

//             const totalStock =
//                 Math.min(
//                     ...normalizedProducts.map(
//                         (item) =>
//                             Math.floor(
//                                 item.stock /
//                                 item.quantity
//                             )
//                     )
//                 );

//             // ------------------------------------------------------
//             // Update
//             // ------------------------------------------------------

//             const updateData = {
//                 name: name.trim(),

//                 slug,

//                 thumbnail:
//                     thumbnail.trim(),

//                 images: Array.isArray(images)
//                     ? images
//                         .map((image) =>
//                             String(image).trim()
//                         )
//                         .filter(Boolean)
//                     : [],

//                 description:
//                     typeof description === "string"
//                         ? description.trim()
//                         : "",

//                 products:
//                     normalizedProducts.map(
//                         ({
//                             productId,
//                             quantity,
//                         }) => ({
//                             productId,
//                             quantity,
//                         })
//                     ),

//                 price: {
//                     mrp,
//                     sellingPrice,
//                     discountPercent,
//                     currency: "BDT",
//                 },

//                 totalStock,

//                 isActive:
//                     typeof isActive === "boolean"
//                         ? isActive
//                         : existingBundle.isActive,

//                 updatedAt: new Date(),
//             };

//             await bundleProductsCollection.updateOne(
//                 {
//                     _id: new ObjectId(id),
//                 },
//                 {
//                     $set: updateData,
//                 }
//             );

//             const updatedBundle =
//                 await bundleProductsCollection.findOne({
//                     _id: new ObjectId(id),
//                 });

//             res.json({
//                 message:
//                     "Bundle product updated successfully",

//                 bundle: updatedBundle,
//             });
//         } catch (error) {
//             console.error(
//                 "Update bundle error:",
//                 error
//             );

//             res.status(500).json({
//                 message:
//                     error.message ||
//                     "Failed to update bundle product",
//             });
//         }
//     }
// );

// app.delete("/bundle-products/:id",
//     async (req, res) => {
//         try {
//             const { id } = req.params;

//             if (!ObjectId.isValid(id)) {
//                 return res.status(400).json({
//                     message:
//                         "Invalid bundle ID",
//                 });
//             }

//             const result =
//                 await bundleProductsCollection.updateOne(
//                     {
//                         _id: new ObjectId(id),
//                     },
//                     {
//                         $set: {
//                             isActive: false,
//                             updatedAt: new Date(),
//                         },
//                     }
//                 );

//             if (
//                 result.matchedCount === 0
//             ) {
//                 return res.status(404).json({
//                     message:
//                         "Bundle product not found",
//                 });
//             }

//             res.json({
//                 message:
//                     "Bundle product deactivated successfully",
//             });
//         } catch (error) {
//             console.error(
//                 "Delete bundle error:",
//                 error
//             );

//             res.status(500).json({
//                 message:
//                     "Failed to deactivate bundle product",
//             });
//         }
//     }
// );

// ═══════════════════════════════════════════════════════════════
// BUNDLE PRODUCTS
// ═══════════════════════════════════════════════════════════════

const generateBundleSlug = async (name, excludeId = null) => {
    const baseSlug = toSlug(name);

    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const query = { slug };

        if (excludeId) {
            query._id = { $ne: new ObjectId(excludeId) };
        }

        const exists = await bundleProductsCollection.findOne(query);

        if (!exists) {
            return slug;
        }

        slug = `${baseSlug}-${counter++}`;
    }
};

const validateBundleProducts = async (products) => {
    if (!Array.isArray(products) || products.length === 0) {
        throw new Error("At least one product is required");
    }

    const seen = new Set();
    const productIds = [];

    for (const item of products) {
        if (!item?.productId) {
            throw new Error("Each bundle item must have productId");
        }

        const productId = String(item.productId);

        if (!ObjectId.isValid(productId)) {
            throw new Error(`Invalid productId: ${productId}`);
        }

        if (seen.has(productId)) {
            throw new Error("Duplicate products are not allowed");
        }

        seen.add(productId);
        productIds.push(new ObjectId(productId));

        const quantity = Number(item.quantity);

        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new Error(`Invalid quantity for product ${productId}`);
        }
    }

    const sourceProducts = await productsCollection
        .find({
            _id: { $in: productIds },
            isActive: true,
        })
        .toArray();

    if (sourceProducts.length !== productIds.length) {
        throw new Error(
            "One or more selected products were not found or are inactive"
        );
    }

    return sourceProducts;
};

app.post("/bundle-products", async (req, res) => {
    try {
        const {
            name,
            thumbnail,
            images = [],
            description = "",
            products,
            price,
            productTypeId,
            categoryId,
            subCategoryId,
        } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({
                message: "Bundle name is required",
            });
        }

        // ✅ NEW: Validate category hierarchy (optional but recommended)
        let productTypeObjectId = null;
        let categoryObjectId = null;
        let subCategoryObjectId = null;

        if (productTypeId || categoryId || subCategoryId) {
            if (!productTypeId || !categoryId || !subCategoryId) {
                return res.status(400).json({
                    message: "productTypeId, categoryId and subCategoryId are all required if category is provided",
                });
            }

            const validation = await validateProductHierarchy({
                productTypeId,
                categoryId,
                subCategoryId,
            });

            if (!validation.valid) {
                return res.status(400).json({
                    message: validation.message,
                });
            }

            productTypeObjectId = validation.productTypeObjectId;
            categoryObjectId = validation.categoryObjectId;
            subCategoryObjectId = validation.subCategoryObjectId;
        }

        if (!thumbnail?.trim()) {
            return res.status(400).json({
                message: "Bundle thumbnail is required",
            });
        }

        const sellingPrice = Number(price?.sellingPrice);

        if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) {
            return res.status(400).json({
                message: "Valid bundle selling price is required",
            });
        }

        const sourceProducts = await validateBundleProducts(products);

        const sourceMap = new Map(
            sourceProducts.map((product) => [
                String(product._id),
                product,
            ])
        );

        let originalValue = 0;

        for (const item of products) {
            const product = sourceMap.get(String(item.productId));

            originalValue +=
                Number(product.price?.sellingPrice || 0) *
                Number(item.quantity);
        }

        if (sellingPrice >= originalValue) {
            return res.status(400).json({
                message:
                    "Bundle selling price must be lower than the current product value",
                originalValue,
            });
        }

        const slug = await generateBundleSlug(name);

        // ✅ Custom name সহ bundle products
        const bundleProducts = products.map((item) => ({
            productId: new ObjectId(item.productId),
            quantity: Number(item.quantity),

            // Custom name (admin চাইলে দেবে, না দিলে null)
            customName: item.customName?.trim() || null,
        }));

        const bundle = {
            name: name.trim(),
            slug,

            thumbnail: thumbnail.trim(),

            images: Array.isArray(images)
                ? images
                    .map((image) => String(image).trim())
                    .filter(Boolean)
                : [],

            description: description?.trim() || "",

            // ✅ NEW: Category references
            productTypeId: productTypeObjectId,
            categoryId: categoryObjectId,
            subCategoryId: subCategoryObjectId,

            products: bundleProducts,

            price: {
                sellingPrice,
                currency: "BDT",
            },

            isActive: true,

            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await bundleProductsCollection.insertOne(bundle);

        res.status(201).json({
            message: "Bundle product created successfully",
            bundleId: result.insertedId,
        });
    } catch (error) {
        console.error("Create bundle error:", error);

        res.status(500).json({
            message: error.message || "Failed to create bundle",
        });
    }
});

app.get("/bundle-products", async (req, res) => {
    try {
        const {
            search = "",
            isActive = "true",
            page = 1,
            limit = 10,
            productTypeId,
            categoryId,
            subCategoryId,
        } = req.query;

        const currentPage = Math.max(Number(page) || 1, 1);
        const perPage = Math.min(Math.max(Number(limit) || 10, 1), 100);

        const bundleFilter = {};

        if (isActive === "true") {
            bundleFilter.isActive = true;
        } else if (isActive === "false") {
            bundleFilter.isActive = false;
        }

        if (search.trim()) {
            const escaped = search
                .trim()
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const searchRegex = new RegExp(escaped, "i");

            bundleFilter.$or = [
                { name: searchRegex },
                { slug: searchRegex },
            ];
        }

        // NEW: Category filters
        if (productTypeId && ObjectId.isValid(productTypeId)) {
            bundleFilter.productTypeId = new ObjectId(productTypeId);
        }

        if (categoryId && ObjectId.isValid(categoryId)) {
            bundleFilter.categoryId = new ObjectId(categoryId);
        }

        if (subCategoryId && ObjectId.isValid(subCategoryId)) {
            bundleFilter.subCategoryId = new ObjectId(subCategoryId);
        }

        const total = await bundleProductsCollection.countDocuments(
            bundleFilter
        );

        const totalPages = Math.ceil(total / perPage);

        const bundles = await bundleProductsCollection
            .find(bundleFilter)
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * perPage)
            .limit(perPage)
            .toArray();

        // Collect product ids
        const productIds = [];

        for (const bundle of bundles) {
            for (const item of bundle.products || []) {
                if (item.productId) {
                    productIds.push(item.productId);
                }
            }
        }

        const uniqueProductIds = [
            ...new Map(
                productIds.map((id) => [String(id), id])
            ).values(),
        ];

        const sourceProducts =
            uniqueProductIds.length > 0
                ? await productsCollection
                    .find({
                        _id: { $in: uniqueProductIds },
                    })
                    .toArray()
                : [];

        const productMap = new Map(
            sourceProducts.map((product) => [
                String(product._id),
                product,
            ])
        );

        const formattedBundles = bundles.map((bundle) => {
            let originalValue = 0;
            let totalStock = Infinity;

            const products = (bundle.products || []).map((item) => {
                const product = productMap.get(String(item.productId));

                if (!product) {
                    return {
                        productId: item.productId,
                        quantity: item.quantity,

                        // ✅ Custom name pass through
                        customName: item.customName || null,
                        displayName:
                            item.customName || "Product unavailable",

                        product: null,
                    };
                }

                const sellingPrice =
                    Number(product?.price?.sellingPrice) || 0;

                originalValue +=
                    sellingPrice * Number(item.quantity || 1);

                const sourceStock = Number(product?.totalStock) || 0;
                const requiredQuantity = Number(item.quantity) || 1;

                const possibleBundles = Math.floor(
                    sourceStock / requiredQuantity
                );

                totalStock = Math.min(totalStock, possibleBundles);

                return {
                    productId: item.productId,
                    quantity: requiredQuantity,

                    // ✅ Custom name + display name
                    customName: item.customName || null,
                    displayName: item.customName || product.name,

                    product: {
                        _id: product._id,
                        name: product.name,
                        slug: product.slug,
                        thumbnail: product.thumbnail,

                        price: {
                            sellingPrice,
                        },

                        totalStock: sourceStock,

                        isActive: product.isActive !== false,
                    },
                };
            });

            const bundleSellingPrice =
                Number(bundle?.price?.sellingPrice) || 0;

            const savings = Math.max(
                originalValue - bundleSellingPrice,
                0
            );

            const discountPercent =
                originalValue > 0
                    ? Math.round((savings / originalValue) * 100)
                    : 0;

            if (totalStock === Infinity) {
                totalStock = 0;
            }

            return {
                ...bundle,
                products,

                pricing: {
                    originalValue,
                    sellingPrice: bundleSellingPrice,
                    savings,
                    discountPercent,
                    currency: bundle?.price?.currency || "BDT",
                },

                totalStock,
            };
        });

        res.status(200).json({
            success: true,
            bundles: formattedBundles,
            pagination: {
                total,
                page: currentPage,
                limit: perPage,
                totalPages,
            },
            total,
            page: currentPage,
            limit: perPage,
            totalPages,
        });
    } catch (error) {
        console.error("GET /bundle-products error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch bundle products",
            error: error.message,
        });
    }
});

app.get("/bundle-products/slug/:slug", async (req, res) => {
    try {
        const { slug } = req.params;

        if (!slug?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Slug is required",
            });
        }

        // ✅ Direct slug দিয়ে bundle খুঁজি (1st DB hit)
        const bundle = await bundleProductsCollection.findOne({
            slug: slug.trim().toLowerCase(),
        });

        if (!bundle) {
            return res.status(404).json({
                success: false,
                message: "Bundle not found",
            });
        }

        const productIds = bundle.products.map((item) => item.productId);

        // ✅ Parallel fetch: products, colors, sizes একসাথে
        const [products, allColors, allSizes] = await Promise.all([
            productsCollection
                .find({ _id: { $in: productIds } })
                .project({
                    name: 1,
                    slug: 1,
                    thumbnail: 1,
                    images: 1,
                    description: 1,
                    variationType: 1,
                    variants: 1,
                    price: 1,
                    totalStock: 1,
                    isActive: 1,
                    sizeChartId: 1,
                    sizeChart: 1,
                })
                .toArray(),

            // Colors + Sizes parallel এ আনছি (cache-able collection)
            colorsCollection.find({}).toArray(),
            sizesCollection.find({}).toArray(),
        ]);

        // ✅ Color/Size map বানাই
        const colorMap = new Map(
            allColors.map((c) => [String(c._id), c])
        );
        const sizeMap = new Map(
            allSizes.map((s) => [String(s._id), s])
        );

        const productMap = new Map(
            products.map((p) => [String(p._id), p])
        );

        // ✅ Enrich bundle products
        const bundleProducts = bundle.products.map((item) => {
            const product = productMap.get(String(item.productId));

            let enrichedProduct = null;

            if (product) {
                enrichedProduct = {
                    ...product,
                    variants: (product.variants || []).map((variant) => ({
                        ...variant,
                        color: variant.colorId
                            ? colorMap.get(String(variant.colorId)) || null
                            : null,
                        sizes: (variant.sizes || []).map((size) => ({
                            ...size,
                            size: size.sizeId
                                ? sizeMap.get(String(size.sizeId)) || null
                                : null,
                        })),
                    })),
                };
            }

            return {
                productId: item.productId,
                quantity: item.quantity,
                customName: item.customName || null,
                displayName:
                    item.customName ||
                    product?.name ||
                    "Product unavailable",
                product: enrichedProduct,
            };
        });

        // Pricing
        const originalValue = bundleProducts.reduce((total, item) => {
            const sellingPrice =
                Number(item.product?.price?.sellingPrice) || 0;
            return total + sellingPrice * Number(item.quantity || 1);
        }, 0);

        const bundleSellingPrice =
            Number(bundle.price?.sellingPrice) || 0;

        const savings = Math.max(0, originalValue - bundleSellingPrice);

        const discountPercent =
            originalValue > 0
                ? Math.round((savings / originalValue) * 100)
                : 0;

        // ✅ Category info (optional, very light)
        const [productType, category, subCategory] = await Promise.all([
            bundle.productTypeId
                ? productTypesCollection.findOne({
                    _id: bundle.productTypeId,
                })
                : null,
            bundle.categoryId
                ? categoriesCollection.findOne({
                    _id: bundle.categoryId,
                })
                : null,
            bundle.subCategoryId
                ? subCategoriesCollection.findOne({
                    _id: bundle.subCategoryId,
                })
                : null,
        ]);

        res.json({
            success: true,
            bundle: {
                ...bundle,
                products: bundleProducts,
                productType: productType || null,
                category: category || null,
                subCategory: subCategory || null,
                pricing: {
                    originalValue,
                    sellingPrice: bundleSellingPrice,
                    savings,
                    discountPercent,
                    currency: "BDT",
                },
            },
        });
    } catch (err) {
        console.error("Bundle by slug error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bundle",
            error: err.message,
        });
    }
});

app.get("/bundle-products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                success: false,
                message: "Invalid bundle id",
            });
        }

        const bundle = await bundleProductsCollection.findOne({
            _id: new ObjectId(id),
        });

        if (!bundle) {
            return res.status(404).send({
                success: false,
                message: "Bundle product not found",
            });
        }

        // NEW: Fetch category info
        let productType = null;
        let category = null;
        let subCategory = null;

        if (bundle.productTypeId) {
            productType = await productTypesCollection.findOne({
                _id: bundle.productTypeId,
            });
        }

        if (bundle.categoryId) {
            category = await categoriesCollection.findOne({
                _id: bundle.categoryId,
            });
        }

        if (bundle.subCategoryId) {
            subCategory = await subCategoriesCollection.findOne({
                _id: bundle.subCategoryId,
            });
        }

        const productIds = bundle.products.map((item) => item.productId);

        // ✅ Full product fetch (variants + size chart সহ)
        const products = await productsCollection
            .find({ _id: { $in: productIds } })
            .project({
                name: 1,
                slug: 1,
                thumbnail: 1,
                images: 1,
                description: 1,

                variationType: 1,
                variants: 1,

                price: 1,
                totalStock: 1,

                isActive: 1,

                sizeChartId: 1,
                sizeChart: 1,
            })
            .toArray();

        // ✅ Collect all color & size ids from variants (for enrichment)
        const allColorIds = [];
        const allSizeIds = [];

        for (const product of products) {
            for (const variant of product.variants || []) {
                if (variant.colorId) allColorIds.push(variant.colorId);

                for (const size of variant.sizes || []) {
                    if (size.sizeId) allSizeIds.push(size.sizeId);
                }
            }
        }

        const uniqueColorIds = [
            ...new Map(
                allColorIds.map((i) => [String(i), i])
            ).values(),
        ];

        const uniqueSizeIds = [
            ...new Map(
                allSizeIds.map((i) => [String(i), i])
            ).values(),
        ];

        // ✅ Fetch colors & sizes
        const colors = uniqueColorIds.length
            ? await colorsCollection
                .find({ _id: { $in: uniqueColorIds } })
                .toArray()
            : [];

        const sizes = uniqueSizeIds.length
            ? await sizesCollection
                .find({ _id: { $in: uniqueSizeIds } })
                .toArray()
            : [];

        const colorMap = new Map(
            colors.map((c) => [String(c._id), c])
        );
        const sizeMap = new Map(
            sizes.map((s) => [String(s._id), s])
        );

        const productMap = new Map(
            products.map((product) => [String(product._id), product])
        );

        // ✅ Enrich bundle products
        const bundleProducts = bundle.products.map((item) => {
            const product = productMap.get(String(item.productId));

            let enrichedProduct = null;

            if (product) {
                enrichedProduct = {
                    ...product,

                    // ✅ Enrich variants with color & size names
                    variants: (product.variants || []).map((variant) => ({
                        ...variant,

                        color: variant.colorId
                            ? colorMap.get(String(variant.colorId)) || null
                            : null,

                        sizes: (variant.sizes || []).map((size) => ({
                            ...size,

                            size: size.sizeId
                                ? sizeMap.get(String(size.sizeId)) || null
                                : null,
                        })),
                    })),
                };
            }

            return {
                productId: item.productId,
                quantity: item.quantity,

                // ✅ Custom name pass-through
                customName: item.customName || null,
                displayName:
                    item.customName ||
                    product?.name ||
                    "Product unavailable",

                product: enrichedProduct,
            };
        });

        // Pricing
        const originalValue = bundleProducts.reduce((total, item) => {
            const sellingPrice =
                Number(item.product?.price?.sellingPrice) || 0;

            return total + sellingPrice * Number(item.quantity || 1);
        }, 0);

        const bundleSellingPrice =
            Number(bundle.price?.sellingPrice) || 0;

        const savings = Math.max(0, originalValue - bundleSellingPrice);

        const discountPercent =
            originalValue > 0
                ? Math.round((savings / originalValue) * 100)
                : 0;

        res.send({
            success: true,

            bundle: {
                ...bundle,

                products: bundleProducts,

                // ✅ NEW: Category info
                productType,
                category,
                subCategory,

                pricing: {
                    originalValue,
                    sellingPrice: bundleSellingPrice,
                    savings,
                    discountPercent,
                    currency: "BDT",
                },
            },
        });
    } catch (err) {
        console.error("Bundle details error:", err);

        res.status(500).send({
            success: false,
            message: "Failed to fetch bundle product",
            error: err.message,
        });
    }
});

app.patch("/bundle-products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid bundle ID",
            });
        }

        const existingBundle = await bundleProductsCollection.findOne({
            _id: new ObjectId(id),
        });

        if (!existingBundle) {
            return res.status(404).json({
                message: "Bundle product not found",
            });
        }

        const {
            name,
            thumbnail,
            images,
            description,
            products,
            price,
            isActive,
            productTypeId,
            categoryId,
            subCategoryId,
        } = req.body;

        // ───── Name ─────
        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Bundle name is required",
            });
        }

        // ───── Thumbnail ─────
        if (!thumbnail || typeof thumbnail !== "string") {
            return res.status(400).json({
                message: "Bundle thumbnail is required",
            });
        }

        // ───── Price ─────
        const mrp = Number(price?.mrp);
        const sellingPrice = Number(price?.sellingPrice);

        if (!Number.isFinite(mrp) || mrp < 0) {
            return res.status(400).json({
                message: "Invalid MRP",
            });
        }

        if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) {
            return res.status(400).json({
                message: "Invalid selling price",
            });
        }

        if (mrp > 0 && sellingPrice > mrp) {
            return res.status(400).json({
                message: "Selling price cannot be greater than MRP",
            });
        }

        // ───── Validate products ─────
        await validateBundleProducts(products);

        // ───── Slug ─────
        let slug = existingBundle.slug;

        if (existingBundle.name.trim() !== name.trim()) {
            slug = await generateBundleSlug(name, id);
        }

        // ───── Discount ─────
        const discountPercent = calculateDiscountPercent(
            mrp,
            sellingPrice
        );

        // ───── Save products with customName ─────
        const savedProducts = products.map((item) => ({
            productId: new ObjectId(item.productId),
            quantity: Number(item.quantity),
            customName: item.customName?.trim() || null,
        }));

        // ───── Update ─────
        const updateData = {
            name: name.trim(),
            slug,

            thumbnail: thumbnail.trim(),

            images: Array.isArray(images)
                ? images
                    .map((image) => String(image).trim())
                    .filter(Boolean)
                : [],

            description:
                typeof description === "string"
                    ? description.trim()
                    : "",

            ...(productTypeId !== undefined && {
                productTypeId: productTypeId
                    ? new ObjectId(productTypeId)
                    : null,
            }),
            ...(categoryId !== undefined && {
                categoryId: categoryId ? new ObjectId(categoryId) : null,
            }),
            ...(subCategoryId !== undefined && {
                subCategoryId: subCategoryId
                    ? new ObjectId(subCategoryId)
                    : null,
            }),

            products: savedProducts,

            price: {
                mrp,
                sellingPrice,
                discountPercent,
                currency: "BDT",
            },

            isActive:
                typeof isActive === "boolean"
                    ? isActive
                    : existingBundle.isActive,

            updatedAt: new Date(),
        };

        await bundleProductsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        const updatedBundle = await bundleProductsCollection.findOne({
            _id: new ObjectId(id),
        });

        res.json({
            message: "Bundle product updated successfully",
            bundle: updatedBundle,
        });
    } catch (error) {
        console.error("Update bundle error:", error);

        res.status(500).json({
            message:
                error.message || "Failed to update bundle product",
        });
    }
});

app.delete("/bundle-products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid bundle ID",
            });
        }

        const result = await bundleProductsCollection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    isActive: false,
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Bundle product not found",
            });
        }

        res.json({
            message: "Bundle product deactivated successfully",
        });
    } catch (error) {
        console.error("Delete bundle error:", error);

        res.status(500).json({
            message: "Failed to deactivate bundle product",
        });
    }
});


///////////////////////////////////////// colors //////////////////////////////////////////////

app.get('/colors', async (req, res) => {
    try {
        const { isActive } = req.query;

        const query = {};

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const colors = await colorsCollection
            .find(query)
            .sort({ sortOrder: 1, createdAt: -1 })
            .toArray();

        res.send(colors);

    } catch (err) {
        console.error(err);

        res.status(500).send({
            message: 'Failed to fetch colors',
            error: err.message
        });
    }
});

app.get('/colors/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message: 'Invalid color id'
            });
        }

        const color = await colorsCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!color) {
            return res.status(404).send({
                message: 'Color not found'
            });
        }

        res.send(color);

    } catch (err) {
        console.error(err);

        res.status(500).send({
            message: 'Failed to fetch color',
            error: err.message
        });
    }
});

app.post('/colors', async (req, res) => {
    try {
        const {
            name,
            hexCode,
            isActive = true,
            sortOrder
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).send({
                message: 'Color name is required'
            });
        }

        const cleanName = name.trim();

        const slug = toSlug(cleanName);

        //////////////////// duplicate check //////////////////////////

        const existingColor = await colorsCollection.findOne({
            slug
        });

        if (existingColor) {
            return res.status(409).send({
                message: 'This color already exists'
            });
        }

        ////////////////// generate sort order //////////////////////

        let finalSortOrder = sortOrder;

        if (finalSortOrder === undefined) {
            const lastColor = await colorsCollection
                .find()
                .sort({ sortOrder: -1 })
                .limit(1)
                .next();

            finalSortOrder = lastColor
                ? lastColor.sortOrder + 1
                : 1;
        }

        const now = new Date();

        const color = {
            name: cleanName,
            slug,
            hexCode: hexCode || '',

            isActive: Boolean(isActive),
            sortOrder: Number(finalSortOrder),

            createdAt: now,
            updatedAt: now
        };

        const result = await colorsCollection.insertOne(color);

        res.status(201).send({
            message: 'Color created successfully',
            color: {
                _id: result.insertedId,
                ...color
            }
        });

    } catch (err) {
        console.error(err);

        res.status(500).send({
            message: 'Failed to create color',
            error: err.message
        });
    }
});

app.patch('/colors/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message: 'Invalid color id'
            });
        }

        const existingColor = await colorsCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!existingColor) {
            return res.status(404).send({
                message: 'Color not found'
            });
        }

        const {
            name,
            hexCode,
            isActive,
            sortOrder
        } = req.body;

        const updatedDoc = {};

        if (name !== undefined) {
            const cleanName = name.trim();

            if (!cleanName) {
                return res.status(400).send({
                    message: 'Color name cannot be empty'
                });
            }

            const newSlug = toSlug(cleanName);

            //////////////////// duplicate check ///////////////////////

            const duplicate = await colorsCollection.findOne({
                slug: newSlug,
                _id: {
                    $ne: new ObjectId(id)
                }
            });

            if (duplicate) {
                return res.status(409).send({
                    message: 'This color already exists'
                });
            }

            updatedDoc.name = cleanName;
            updatedDoc.slug = newSlug;
        }

        if (hexCode !== undefined) {
            updatedDoc.hexCode = hexCode;
        }

        if (isActive !== undefined) {
            updatedDoc.isActive = Boolean(isActive);
        }

        if (sortOrder !== undefined) {
            updatedDoc.sortOrder = Number(sortOrder);
        }

        updatedDoc.updatedAt = new Date();

        const result = await colorsCollection.updateOne(
            {
                _id: new ObjectId(id)
            },
            {
                $set: updatedDoc
            }
        );

        const updatedColor = await colorsCollection.findOne({
            _id: new ObjectId(id)
        });

        res.send({
            message: 'Color updated successfully',
            color: updatedColor
        });

    } catch (err) {
        console.error(err);

        res.status(500).send({
            message: 'Failed to update color',
            error: err.message
        });
    }
});

app.delete('/colors/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message: 'Invalid color id'
            });
        }

        const result = await colorsCollection.deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).send({
                message: 'Color not found'
            });
        }

        res.send({
            message: 'Color deleted successfully'
        });

    } catch (err) {
        console.error(err);

        res.status(500).send({
            message: 'Failed to delete color',
            error: err.message
        });
    }
});


//////////////////////////////////////// SIZES ///////////////////////////////////////////////

app.get('/sizes', async (req, res) => {
    try {
        const { group, isActive } = req.query;

        const query = {};

        if (group) {
            query.group = group;
        }

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const sizes = await sizesCollection
            .find(query)
            .sort({ sortOrder: 1, createdAt: -1 })
            .toArray();

        res.send(sizes);

    } catch (err) {
        console.error(err);

        res.status(500).send({
            message: 'Failed to fetch sizes',
            error: err.message
        });
    }
});

app.get('/sizes/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message: 'Invalid size id'
            });
        }

        const size = await sizesCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!size) {
            return res.status(404).send({
                message: 'Size not found'
            });
        }

        res.send(size);

    } catch (err) {
        console.error(err);

        res.status(500).send({
            message: 'Failed to fetch size',
            error: err.message
        });
    }
});

app.post('/sizes', async (req, res) => {
    try {
        const {
            name,
            group = 'clothing',
            isActive = true,
            sortOrder
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).send({
                message: 'Size name is required'
            });
        }

        const cleanName = name.trim();

        const slug = toSlug(cleanName);

        // duplicate check inside same group
        const existingSize = await sizesCollection.findOne({
            slug,
            group
        });

        if (existingSize) {
            return res.status(409).send({
                message: 'This size already exists in this group'
            });
        }

        let finalSortOrder = sortOrder;

        if (finalSortOrder === undefined) {
            const lastSize = await sizesCollection
                .find({
                    group
                })
                .sort({ sortOrder: -1 })
                .limit(1)
                .next();

            finalSortOrder = lastSize
                ? lastSize.sortOrder + 1
                : 1;
        }

        const now = new Date();

        const size = {
            name: cleanName,
            slug,

            group,

            isActive: Boolean(isActive),
            sortOrder: Number(finalSortOrder),

            createdAt: now,
            updatedAt: now
        };

        const result = await sizesCollection.insertOne(size);

        res.status(201).send({
            message: 'Size created successfully',
            size: {
                _id: result.insertedId,
                ...size
            }
        });

    } catch (err) {
        console.error(err);

        res.status(500).send({
            message: 'Failed to create size',
            error: err.message
        });
    }
});

app.patch('/sizes/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message: 'Invalid size id'
            });
        }

        const existingSize = await sizesCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!existingSize) {
            return res.status(404).send({
                message: 'Size not found'
            });
        }

        const {
            name,
            group,
            isActive,
            sortOrder
        } = req.body;

        const updatedDoc = {};

        let newSlug = existingSize.slug;
        let newGroup = existingSize.group;

        if (name !== undefined) {
            const cleanName = name.trim();

            if (!cleanName) {
                return res.status(400).send({
                    message: 'Size name cannot be empty'
                });
            }

            newSlug = toSlug(cleanName);

            updatedDoc.name = cleanName;
            updatedDoc.slug = newSlug;
        }

        if (group !== undefined) {
            newGroup = group;
            updatedDoc.group = group;
        }

        if (name !== undefined || group !== undefined) {
            const duplicate = await sizesCollection.findOne({
                slug: newSlug,
                group: newGroup,
                _id: {
                    $ne: new ObjectId(id)
                }
            });

            if (duplicate) {
                return res.status(409).send({
                    message: 'This size already exists in this group'
                });
            }
        }

        if (isActive !== undefined) {
            updatedDoc.isActive = Boolean(isActive);
        }

        if (sortOrder !== undefined) {
            updatedDoc.sortOrder = Number(sortOrder);
        }

        updatedDoc.updatedAt = new Date();

        await sizesCollection.updateOne(
            {
                _id: new ObjectId(id)
            },
            {
                $set: updatedDoc
            }
        );

        const updatedSize = await sizesCollection.findOne({
            _id: new ObjectId(id)
        });

        res.send({
            message: 'Size updated successfully',
            size: updatedSize
        });

    } catch (err) {
        console.error(err);

        res.status(500).send({
            message: 'Failed to update size',
            error: err.message
        });
    }
});

app.delete('/sizes/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message: 'Invalid size id'
            });
        }

        const result = await sizesCollection.deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).send({
                message: 'Size not found'
            });
        }

        res.send({
            message: 'Size deleted successfully'
        });

    } catch (err) {
        console.error(err);

        res.status(500).send({
            message: 'Failed to delete size',
            error: err.message
        });
    }
});


////////////////////////////////////////// SiZe Charts //////////////////////////////////////////

app.get("/size-charts", async (req, res) => {
    try {
        const sizeCharts = await sizeChartsCollection
            .find({ isActive: true })
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({
            success: true,
            data: sizeCharts,
        });
    } catch (error) {
        console.error("Get size charts error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch size charts",
        });
    }
});

app.get("/size-charts/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid size chart ID",
            });
        }

        const sizeChart = await sizeChartsCollection.findOne({
            _id: new ObjectId(id),
            isActive: true,
        });

        if (!sizeChart) {
            return res.status(404).json({
                success: false,
                message: "Size chart not found",
            });
        }

        res.status(200).json({
            success: true,
            data: sizeChart,
        });
    } catch (error) {
        console.error("Get size chart error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch size chart",
        });
    }
});

app.post("/size-charts", async (req, res) => {
    try {
        const {
            name,
            type = "image",          // "image" | "custom"
            image = "",
            description = "",
            headers = [],
            rows = [],
            unit = "inch",
        } = req.body;

        // ---------- Common Validation ----------
        if (!name?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Size chart name is required",
            });
        }

        if (!["image", "custom"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid size chart type",
            });
        }

        // ---------- Type-specific Validation ----------
        if (type === "image") {
            if (!image?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Size chart image is required",
                });
            }
        }

        if (type === "custom") {
            if (!Array.isArray(headers) || headers.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "At least 2 columns are required",
                });
            }

            if (!Array.isArray(rows) || rows.length < 1) {
                return res.status(400).json({
                    success: false,
                    message: "At least 1 size row is required",
                });
            }

            // Ensure every row has every header key
            const invalidRow = rows.find((row) =>
                headers.some((h) => row[h] === undefined)
            );

            if (invalidRow) {
                return res.status(400).json({
                    success: false,
                    message: "Some rows are missing column values",
                });
            }
        }

        const normalizedName = name.trim();

        // ---------- Duplicate Name Check ----------
        const existingChart = await sizeChartsCollection.findOne({
            name: {
                $regex: `^${normalizedName.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                )}$`,
                $options: "i",
            },
            isActive: true,
        });

        if (existingChart) {
            return res.status(409).json({
                success: false,
                message: "A size chart with this name already exists",
            });
        }

        const now = new Date();

        const sizeChart = {
            name: normalizedName,
            type,
            image: type === "image" ? image.trim() : "",
            description: description?.trim() || "",
            headers: type === "custom" ? headers : [],
            rows: type === "custom" ? rows : [],
            unit: type === "custom" ? unit : "inch",
            isActive: true,
            createdAt: now,
            updatedAt: now,
        };

        const result = await sizeChartsCollection.insertOne(sizeChart);

        res.status(201).json({
            success: true,
            message: "Size chart created successfully",
            data: { _id: result.insertedId, ...sizeChart },
        });
    } catch (error) {
        console.error("Create size chart error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create size chart",
        });
    }
});

app.patch("/size-charts/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            type = "image",
            image = "",
            description = "",
            headers = [],
            rows = [],
            unit = "inch",
        } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid size chart ID",
            });
        }

        if (!name?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Size chart name is required",
            });
        }

        if (type === "image" && !image?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Size chart image is required",
            });
        }

        if (type === "custom") {
            if (!Array.isArray(headers) || headers.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "At least 2 columns are required",
                });
            }
            if (!Array.isArray(rows) || rows.length < 1) {
                return res.status(400).json({
                    success: false,
                    message: "At least 1 size row is required",
                });
            }
        }

        const sizeChartId = new ObjectId(id);
        const normalizedName = name.trim();

        const duplicateChart = await sizeChartsCollection.findOne({
            _id: { $ne: sizeChartId },
            name: {
                $regex: `^${normalizedName.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                )}$`,
                $options: "i",
            },
            isActive: true,
        });

        if (duplicateChart) {
            return res.status(409).json({
                success: false,
                message: "Another size chart with this name already exists",
            });
        }

        const updateData = {
            name: normalizedName,
            type,
            image: type === "image" ? image.trim() : "",
            description: description?.trim() || "",
            headers: type === "custom" ? headers : [],
            rows: type === "custom" ? rows : [],
            unit: type === "custom" ? unit : "inch",
            updatedAt: new Date(),
        };

        const result = await sizeChartsCollection.updateOne(
            { _id: sizeChartId, isActive: true },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Size chart not found",
            });
        }

        const updatedChart = await sizeChartsCollection.findOne({
            _id: sizeChartId,
        });

        res.status(200).json({
            success: true,
            message: "Size chart updated successfully",
            data: updatedChart,
        });
    } catch (error) {
        console.error("Update size chart error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update size chart",
        });
    }
});

app.delete("/size-charts/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid size chart ID",
            });
        }

        const result = await sizeChartsCollection.updateOne(
            {
                _id: new ObjectId(id),
                isActive: true,
            },
            {
                $set: {
                    isActive: false,
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Size chart not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Size chart deactivated successfully",
        });
    } catch (error) {
        console.error("Delete size chart error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete size chart",
        });
    }
});


///////////////////////////////////////////// PRODUCT TYPES ///////////////////////////////////////////////

app.get('/product-types', async (req, res) => {
    try {
        const types = await productTypesCollection
            .find()
            .sort({ sortOrder: 1, createdAt: -1 })
            .toArray();

        res.send(types);
    } catch (err) {
        console.error("Fetch product types error:", err);

        res.status(500).send({
            message: "Failed to fetch product types",
        });
    }
});

app.post('/product-types', async (req, res) => {
    try {
        const { name, image, isActive = true } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).send({
                message: "Product type name is required",
            });
        }

        const cleanName = name.trim();
        const slug = toSlug(cleanName);

        ///////////////////// Duplicate check ////////////////////////
        const existingProductType = await productTypesCollection.findOne({
            slug,
        });

        if (existingProductType) {
            return res.status(409).send({
                message: "Product type already exists",
            });
        }

        const lastProductType = await productTypesCollection
            .find()
            .sort({ sortOrder: -1 })
            .limit(1)
            .next();

        const sortOrder = lastProductType
            ? lastProductType.sortOrder + 1
            : 1;

        const now = new Date();

        const productType = {
            name: cleanName,
            slug,
            image: image?.trim() || "",

            isActive: Boolean(isActive),
            sortOrder,

            createdAt: now,
            updatedAt: now,
        };

        const result = await productTypesCollection.insertOne(productType);

        res.status(201).send({
            success: true,
            message: "Product type created successfully",
            data: {
                _id: result.insertedId,
                ...productType,
            },
        });

    } catch (err) {
        console.error("Create product type error:", err);

        res.status(500).send({
            message: "Failed to create product type",
        });
    }
});

app.patch('/product-types/:id', async (req, res) => {
    try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "Invalid product type id",
            });
        }

        const { name, image, isActive, sortOrder } = req.body;

        const updateData = {
            updatedAt: new Date(),
        };

        ////////////////////// Name //////////////////////
        if (name !== undefined) {
            const cleanName = name.trim();

            if (!cleanName) {
                return res.status(400).send({
                    message: "Product type name cannot be empty",
                });
            }

            const slug = toSlug(cleanName);

            const duplicate = await productTypesCollection.findOne({
                slug,
                _id: { $ne: new ObjectId(id) },
            });

            if (duplicate) {
                return res.status(409).send({
                    message: "Another product type with this name already exists",
                });
            }

            updateData.name = cleanName;
            updateData.slug = slug;
        }

        ///////////////////////// Image /////////////////////////
        if (image !== undefined) {
            updateData.image = image.trim();
        }

        ///////////////////// Active / inactive /////////////////////
        if (isActive !== undefined) {
            updateData.isActive = Boolean(isActive);
        }

        // Sort order
        if (sortOrder !== undefined) {
            const parsedSortOrder = Number(sortOrder);

            if (
                !Number.isInteger(parsedSortOrder) ||
                parsedSortOrder < 1
            ) {
                return res.status(400).send({
                    message: "sortOrder must be a positive integer",
                });
            }

            updateData.sortOrder = parsedSortOrder;
        }

        const result = await productTypesCollection.updateOne(
            {
                _id: new ObjectId(id),
            },
            {
                $set: updateData,
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({
                message: "Product type not found",
            });
        }

        const updatedProductType =
            await productTypesCollection.findOne({
                _id: new ObjectId(id),
            });

        res.send({
            success: true,
            message: "Product type updated successfully",
            data: updatedProductType,
        });

    } catch (err) {
        console.error("Update product type error:", err);

        res.status(500).send({
            message: "Failed to update product type",
        });
    }
});

app.delete('/product-types/:id', async (req, res) => {
    try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "Invalid product type id",
            });
        }

        const productType = await productTypesCollection.findOne({
            _id: new ObjectId(id),
        });

        if (!productType) {
            return res.status(404).send({
                message: "Product type not found",
            });
        }

        await productTypesCollection.deleteOne({
            _id: new ObjectId(id),
        });

        res.send({
            success: true,
            message: "Product type deleted successfully",
        });

    } catch (err) {
        console.error("Delete product type error:", err);

        res.status(500).send({
            message: "Failed to delete product type",
        });
    }
});


///////////////////////////////////////////////////// categories ////////////////////////////////////////////////////////

app.get('/categories', async (req, res) => {
    try {
        const { productTypeId } = req.query;

        const query = {};

        // Filter by Product Type
        if (productTypeId) {
            if (!ObjectId.isValid(productTypeId)) {
                return res.status(400).send({
                    message: 'Invalid product type id',
                });
            }

            query.productTypeId = new ObjectId(productTypeId);
        }

        const categories = await categoriesCollection
            .find(query)
            .sort({ sortOrder: 1, createdAt: -1 })
            .toArray();

        res.send(categories);
    } catch (err) {
        console.error('Fetch categories error:', err);

        res.status(500).send({
            message: 'Failed to fetch categories',
        });
    }
});

app.get('/categories/:id', async (req, res) => {
    try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message: 'Invalid category id',
            });
        }

        const category = await categoriesCollection.findOne({
            _id: new ObjectId(id),
        });

        if (!category) {
            return res.status(404).send({
                message: 'Category not found',
            });
        }

        res.send(category);
    } catch (err) {
        console.error('Fetch category error:', err);

        res.status(500).send({
            message: 'Failed to fetch category',
        });
    }
});

app.post('/categories', async (req, res) => {
    try {
        const {
            productTypeId,
            name,
            image,
            isActive = true,
        } = req.body;


        ///////////////////// VALIDATION ///////////////////////////

        if (!productTypeId) {
            return res.status(400).send({
                message: 'Product type is required',
            });
        }

        if (!ObjectId.isValid(productTypeId)) {
            return res.status(400).send({
                message: 'Invalid product type id',
            });
        }

        if (!name || !name.trim()) {
            return res.status(400).send({
                message: 'Category name is required',
            });
        }

        const cleanName = name.trim();

        const productTypeObjectId =
            new ObjectId(productTypeId);

        ///////////////////////// CHECK PRODUCT TYPE /////////////////////////

        const productType =
            await productTypesCollection.findOne({
                _id: productTypeObjectId,
            });

        if (!productType) {
            return res.status(404).send({
                message: 'Product type not found',
            });
        }

        ///////////////////////// CREATE SLUG ////////////////////////////

        const slug = toSlug(cleanName);

        //////////////////////// CHECK DUPLICATE ////////////////////////

        const existingCategory =
            await categoriesCollection.findOne({
                productTypeId: productTypeObjectId,
                slug,
            });

        if (existingCategory) {
            return res.status(409).send({
                message:
                    'Category already exists under this product type',
            });
        }

        /////////////////////// SORT ORDER ///////////////////////////

        const lastCategory =
            await categoriesCollection
                .find({
                    productTypeId: productTypeObjectId,
                })
                .sort({ sortOrder: -1 })
                .limit(1)
                .next();

        const sortOrder = lastCategory
            ? lastCategory.sortOrder + 1
            : 1;

        /////////////////////// CREATE DOCUMENT ////////////////////////

        const now = new Date();

        const category = {
            productTypeId: productTypeObjectId,

            name: cleanName,

            slug,

            image: image?.trim() || '',

            isActive: Boolean(isActive),

            sortOrder,

            createdAt: now,

            updatedAt: now,
        };

        const result =
            await categoriesCollection.insertOne(category);

        res.status(201).send({
            success: true,

            message: 'Category created successfully',

            data: {
                _id: result.insertedId,
                ...category,
            },
        });
    } catch (err) {
        console.error('Create category error:', err);

        res.status(500).send({
            message: 'Failed to create category',
        });
    }
});

app.patch('/categories/:id', async (req, res) => {
    try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message: 'Invalid category id',
            });
        }

        const categoryId = new ObjectId(id);

        const existingCategory =
            await categoriesCollection.findOne({
                _id: categoryId,
            });

        if (!existingCategory) {
            return res.status(404).send({
                message: 'Category not found',
            });
        }

        const {
            productTypeId,
            name,
            image,
            isActive,
            sortOrder,
        } = req.body;

        const updateData = {
            updatedAt: new Date(),
        };


        ////////////////// PRODUCT TYPE //////////////////////////////

        if (productTypeId !== undefined) {
            if (!ObjectId.isValid(productTypeId)) {
                return res.status(400).send({
                    message: 'Invalid product type id',
                });
            }

            const newProductTypeId =
                new ObjectId(productTypeId);

            const productType =
                await productTypesCollection.findOne({
                    _id: newProductTypeId,
                });

            if (!productType) {
                return res.status(404).send({
                    message: 'Product type not found',
                });
            }

            updateData.productTypeId =
                newProductTypeId;
        }


        //////////////////////// NAME /////////////////////////////

        if (name !== undefined) {
            const cleanName = name.trim();

            if (!cleanName) {
                return res.status(400).send({
                    message: 'Category name cannot be empty',
                });
            }

            const slug = toSlug(cleanName);

            const finalProductTypeId =
                updateData.productTypeId ||
                existingCategory.productTypeId;

            // Check duplicate
            const duplicate =
                await categoriesCollection.findOne({
                    productTypeId: finalProductTypeId,
                    slug,
                    _id: { $ne: categoryId },
                });

            if (duplicate) {
                return res.status(409).send({
                    message:
                        'Another category with this name already exists under this product type',
                });
            }

            updateData.name = cleanName;
            updateData.slug = slug;
        }


        /////////////////////////// IMAGE //////////////////////////

        if (image !== undefined) {
            updateData.image =
                typeof image === 'string'
                    ? image.trim()
                    : '';
        }


        ////////////////////// ACTIVE STATUS //////////////////////////

        if (isActive !== undefined) {
            updateData.isActive = Boolean(isActive);
        }


        ///////////////////// SORT ORDER //////////////////////////////

        if (sortOrder !== undefined) {
            const parsedSortOrder =
                Number(sortOrder);

            if (
                !Number.isInteger(parsedSortOrder) ||
                parsedSortOrder < 1
            ) {
                return res.status(400).send({
                    message:
                        'sortOrder must be a positive integer',
                });
            }

            updateData.sortOrder =
                parsedSortOrder;
        }


        //////////////////////// UPDATE //////////////////////////


        await categoriesCollection.updateOne(
            {
                _id: categoryId,
            },
            {
                $set: updateData,
            }
        );

        const updatedCategory =
            await categoriesCollection.findOne({
                _id: categoryId,
            });

        res.send({
            success: true,

            message: 'Category updated successfully',

            data: updatedCategory,
        });
    } catch (err) {
        console.error('Update category error:', err);

        res.status(500).send({
            message: 'Failed to update category',
        });
    }
});

app.delete('/categories/:id', async (req, res) => {
    try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message: 'Invalid category id',
            });
        }

        const categoryId = new ObjectId(id);

        const category =
            await categoriesCollection.findOne({
                _id: categoryId,
            });

        if (!category) {
            return res.status(404).send({
                message: 'Category not found',
            });
        }


        /////////////// TEMPORARY HARD DELETE ///////////////////

        await categoriesCollection.deleteOne({
            _id: categoryId,
        });

        res.send({
            success: true,

            message: 'Category deleted successfully',
        });
    } catch (err) {
        console.error('Delete category error:', err);

        res.status(500).send({
            message: 'Failed to delete category',
        });
    }
});


///////////////////// SUB CATEGORIES /////////////////////////////

app.get('/sub-categories', async (req, res) => {
    try {
        const {
            productTypeId,
            categoryId,
        } = req.query;

        const query = {};

        //////////////////// PRODUCT TYPE FILTER //////////////////////

        if (productTypeId) {
            if (!ObjectId.isValid(productTypeId)) {
                return res.status(400).send({
                    message: 'Invalid product type id',
                });
            }

            query.productTypeId =
                new ObjectId(productTypeId);
        }

        ////////////////////// CATEGORY FILTER /////////////////////////

        if (categoryId) {
            if (!ObjectId.isValid(categoryId)) {
                return res.status(400).send({
                    message: 'Invalid category id',
                });
            }

            query.categoryId =
                new ObjectId(categoryId);
        }

        ////////////////////// FETCH //////////////////////////////

        const subCategories =
            await subCategoriesCollection
                .find(query)
                .sort({
                    sortOrder: 1,
                    createdAt: -1,
                })
                .toArray();

        res.send(subCategories);

    } catch (err) {

        console.error(
            'Fetch sub categories error:',
            err
        );

        res.status(500).send({
            message:
                'Failed to fetch sub categories',
        });
    }
});


app.get('/sub-categories/:id', async (req, res) => {
    try {

        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message:
                    'Invalid sub category id',
            });
        }

        const subCategory =
            await subCategoriesCollection.findOne({
                _id: new ObjectId(id),
            });

        if (!subCategory) {
            return res.status(404).send({
                message:
                    'Sub category not found',
            });
        }

        res.send(subCategory);

    } catch (err) {

        console.error(
            'Fetch sub category error:',
            err
        );

        res.status(500).send({
            message:
                'Failed to fetch sub category',
        });
    }
});


app.post('/sub-categories', async (req, res) => {
    try {

        const {
            productTypeId,
            categoryId,
            name,
            image,
            isActive = true,
        } = req.body;


        ////////////////////// BASIC VALIDATION /////////////////////////////


        if (!productTypeId) {
            return res.status(400).send({
                message:
                    'Product type is required',
            });
        }

        if (!categoryId) {
            return res.status(400).send({
                message:
                    'Category is required',
            });
        }

        if (!ObjectId.isValid(productTypeId)) {
            return res.status(400).send({
                message:
                    'Invalid product type id',
            });
        }

        if (!ObjectId.isValid(categoryId)) {
            return res.status(400).send({
                message:
                    'Invalid category id',
            });
        }

        if (!name || !name.trim()) {
            return res.status(400).send({
                message:
                    'Sub category name is required',
            });
        }

        const cleanName = name.trim();

        const productTypeObjectId =
            new ObjectId(productTypeId);

        const categoryObjectId =
            new ObjectId(categoryId);



        ////////////////////////// CHECK PRODUCT TYPE ////////////////////////


        const productType =
            await productTypesCollection.findOne({
                _id: productTypeObjectId,
            });

        if (!productType) {
            return res.status(404).send({
                message:
                    'Product type not found',
            });
        }



        //////////////////////////// CHECK CATEGORY ////////////////////////////////

        const category =
            await categoriesCollection.findOne({
                _id: categoryObjectId,
            });

        if (!category) {
            return res.status(404).send({
                message:
                    'Category not found',
            });
        }


        /////////////////////// IMPORTANT RELATIONSHIP CHECK ////////////////////////////

        if (
            String(category.productTypeId) !==
            String(productTypeObjectId)
        ) {
            return res.status(400).send({
                message:
                    'Category does not belong to the selected product type',
            });
        }


        ///////////////////////// SLUG /////////////////////////////

        const slug = toSlug(cleanName);


        ///////////////////////// DUPLICATE CHECK /////////////////////////

        const existingSubCategory =
            await subCategoriesCollection.findOne({
                categoryId: categoryObjectId,
                slug,
            });

        if (existingSubCategory) {
            return res.status(409).send({
                message:
                    'Sub category already exists under this category',
            });
        }



        ////////////////////// SORT ORDER ////////////////////////

        const lastSubCategory =
            await subCategoriesCollection
                .find({
                    categoryId: categoryObjectId,
                })
                .sort({
                    sortOrder: -1,
                })
                .limit(1)
                .next();

        const sortOrder = lastSubCategory
            ? lastSubCategory.sortOrder + 1
            : 1;


        /////////////////////////// DOCUMENT ///////////////////////////

        const now = new Date();

        const subCategory = {

            productTypeId:
                productTypeObjectId,

            categoryId:
                categoryObjectId,

            name:
                cleanName,

            slug,

            image:
                image?.trim() || '',

            isActive:
                Boolean(isActive),

            sortOrder,

            createdAt:
                now,

            updatedAt:
                now,
        };


        //////////////////////// INSERT //////////////////////////////

        const result =
            await subCategoriesCollection
                .insertOne(subCategory);


        res.status(201).send({

            success: true,

            message:
                'Sub category created successfully',

            data: {
                _id:
                    result.insertedId,

                ...subCategory,
            },

        });

    } catch (err) {

        console.error(
            'Create sub category error:',
            err
        );

        res.status(500).send({
            message:
                'Failed to create sub category',
        });
    }
});


app.patch('/sub-categories/:id', async (req, res) => {
    try {

        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message:
                    'Invalid sub category id',
            });
        }

        const subCategoryId =
            new ObjectId(id);



        //////////////// EXISTING DOCUMENT //////////////////////

        const existingSubCategory =
            await subCategoriesCollection.findOne({
                _id: subCategoryId,
            });

        if (!existingSubCategory) {
            return res.status(404).send({
                message:
                    'Sub category not found',
            });
        }


        const {
            productTypeId,
            categoryId,
            name,
            image,
            isActive,
            sortOrder,
        } = req.body;


        const updateData = {
            updatedAt: new Date(),
        };



        /////////////////// DETERMINE FINAL RELATION //////////////////////

        let finalProductTypeId =
            existingSubCategory.productTypeId;

        let finalCategoryId =
            existingSubCategory.categoryId;



        ///////////////////// PRODUCT TYPE ////////////////////////////

        if (productTypeId !== undefined) {

            if (!ObjectId.isValid(productTypeId)) {
                return res.status(400).send({
                    message:
                        'Invalid product type id',
                });
            }

            finalProductTypeId =
                new ObjectId(productTypeId);


            const productType =
                await productTypesCollection.findOne({
                    _id: finalProductTypeId,
                });

            if (!productType) {
                return res.status(404).send({
                    message:
                        'Product type not found',
                });
            }

            updateData.productTypeId =
                finalProductTypeId;
        }


        ////////////////////////// CATEGORY /////////////////////////

        if (categoryId !== undefined) {

            if (!ObjectId.isValid(categoryId)) {
                return res.status(400).send({
                    message:
                        'Invalid category id',
                });
            }

            finalCategoryId =
                new ObjectId(categoryId);


            const category =
                await categoriesCollection.findOne({
                    _id: finalCategoryId,
                });

            if (!category) {
                return res.status(404).send({
                    message:
                        'Category not found',
                });
            }

            updateData.categoryId =
                finalCategoryId;
        }



        ///////////////////// RELATIONSHIP VALIDATION //////////////////////


        const finalCategory =
            await categoriesCollection.findOne({
                _id: finalCategoryId,
            });

        if (!finalCategory) {
            return res.status(404).send({
                message:
                    'Category not found',
            });
        }


        if (
            String(finalCategory.productTypeId) !==
            String(finalProductTypeId)
        ) {
            return res.status(400).send({
                message:
                    'Category does not belong to the selected product type',
            });
        }



        /////////////////////// NAME /////////////////////////////

        let finalSlug =
            existingSubCategory.slug;

        if (name !== undefined) {

            const cleanName =
                name.trim();

            if (!cleanName) {
                return res.status(400).send({
                    message:
                        'Sub category name cannot be empty',
                });
            }

            finalSlug =
                toSlug(cleanName);

            updateData.name =
                cleanName;

            updateData.slug =
                finalSlug;
        }


        //////////////////////// DUPLICATE CHECK ///////////////////////////////

        const duplicate =
            await subCategoriesCollection.findOne({
                categoryId:
                    finalCategoryId,

                slug:
                    finalSlug,

                _id: {
                    $ne: subCategoryId,
                },
            });

        if (duplicate) {
            return res.status(409).send({
                message:
                    'Another sub category with this name already exists under this category',
            });
        }


        ///////////////////////////// IMAGE //////////////////////////////////


        if (image !== undefined) {

            updateData.image =
                typeof image === 'string'
                    ? image.trim()
                    : '';
        }



        ////////////////////////// STATUS //////////////////////////////////


        if (isActive !== undefined) {

            updateData.isActive =
                Boolean(isActive);
        }



        //////////////////////////// SORT ORDER /////////////////////////////


        if (sortOrder !== undefined) {

            const parsedSortOrder =
                Number(sortOrder);

            if (
                !Number.isInteger(
                    parsedSortOrder
                ) ||
                parsedSortOrder < 1
            ) {
                return res.status(400).send({
                    message:
                        'sortOrder must be a positive integer',
                });
            }

            updateData.sortOrder =
                parsedSortOrder;
        }


        ////////////////////////////// UPDATE //////////////////////////


        await subCategoriesCollection.updateOne(

            {
                _id:
                    subCategoryId,
            },

            {
                $set:
                    updateData,
            }

        );


        const updatedSubCategory =
            await subCategoriesCollection.findOne({
                _id:
                    subCategoryId,
            });


        res.send({

            success: true,

            message:
                'Sub category updated successfully',

            data:
                updatedSubCategory,

        });

    } catch (err) {

        console.error(
            'Update sub category error:',
            err
        );

        res.status(500).send({
            message:
                'Failed to update sub category',
        });
    }
});


app.delete('/sub-categories/:id', async (req, res) => {
    try {

        const id =
            req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message:
                    'Invalid sub category id',
            });
        }

        const subCategoryId =
            new ObjectId(id);


        const subCategory =
            await subCategoriesCollection.findOne({
                _id:
                    subCategoryId,
            });

        if (!subCategory) {
            return res.status(404).send({
                message:
                    'Sub category not found',
            });
        }


        await subCategoriesCollection.deleteOne({
            _id:
                subCategoryId,
        });


        res.send({

            success: true,

            message:
                'Sub category deleted successfully',

        });

    } catch (err) {

        console.error(
            'Delete sub category error:',
            err
        );

        res.status(500).send({
            message:
                'Failed to delete sub category',
        });
    }
});


app.get('/category-navigation', async (req, res) => {
    try {

        // FETCH ALL DATA

        const [productTypes, categories, subCategories] =
            await Promise.all([
                productTypesCollection
                    .find({ isActive: true })
                    .sort({
                        sortOrder: 1,
                        createdAt: -1,
                    })
                    .toArray(),

                categoriesCollection
                    .find({ isActive: true })
                    .sort({
                        sortOrder: 1,
                        createdAt: -1,
                    })
                    .toArray(),

                subCategoriesCollection
                    .find({ isActive: true })
                    .sort({
                        sortOrder: 1,
                        createdAt: -1,
                    })
                    .toArray(),
            ]);



        // BUILD NAVIGATION

        const navigation = productTypes.map((productType) => {

            // Product type-এর categories
            const productTypeCategories =
                categories.filter(
                    (category) =>
                        String(category.productTypeId) ===
                        String(productType._id)
                );


            return {
                _id: productType._id,

                name: productType.name,

                type: productType.name,

                slug: productType.slug,

                image: productType.image,

                categories: productTypeCategories.map(
                    (category) => {

                        // Category-এর sub categories
                        const categorySubCategories =
                            subCategories.filter(
                                (subCategory) =>
                                    String(
                                        subCategory.categoryId
                                    ) ===
                                    String(category._id)
                            );


                        return {
                            _id: category._id,

                            name: category.name,

                            category: category.name,

                            slug: category.slug,

                            image: category.image,

                            subCategories:
                                categorySubCategories.map(
                                    (subCategory) => ({
                                        _id:
                                            subCategory._id,

                                        name:
                                            subCategory.name,

                                        slug:
                                            subCategory.slug,

                                        image:
                                            subCategory.image,

                                        sortOrder:
                                            subCategory.sortOrder,

                                        isActive:
                                            subCategory.isActive,
                                    })
                                ),
                        };
                    }
                ),
            };
        });


        // RESPONSE

        res.send({
            success: true,
            data: navigation,
        });

    } catch (err) {

        console.error(
            'Fetch category navigation error:',
            err
        );

        res.status(500).send({
            message:
                'Failed to fetch category navigation',
        });
    }
});


app.get('/', (req, res) => {
    res.send('Britto Shop server is running');
});

app.listen(port, () => {
    console.log(`Britto Shop server listening on port ${port}`);
});



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// const express = require('express');
// const cors = require('cors');
// require("dotenv").config();

// const app = express();
// const port = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@brittodb.o3wjzwp.mongodb.net/?appName=brittodb`;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });

// // collections — connect once, reuse everywhere (client.close() removed on purpose)
// let productsCollection;
// let categoriesCollection;

// async function run() {
//     try {
//         await client.connect();
//         await client.db("admin").command({ ping: 1 });
//         console.log("Pinged your deployment. You successfully connected to MongoDB!");

//         // TODO: replace 'brittoshop' with your actual database name if different
//         const db = client.db("brittoshop");
//         productsCollection = db.collection("products");
//         categoriesCollection = db.collection("categories");
//     } catch (err) {
//         console.error("MongoDB connection failed:", err);
//     }
// }
// run();

// // ---------------------------------------------
// // PRODUCTS
// // ---------------------------------------------

// // GET all products — supports filtering + pagination
// // /products?productType=Men&category=Topwear&subCategory=Hoodie&search=hoodie&page=1&limit=20
// app.get('/products', async (req, res) => {
//     try {
//         const { productType, category, subCategory, search, isFeatured, isNewArrival, page = 1, limit = 20 } = req.query;

//         const query = {};
//         if (productType) query.productType = productType;
//         if (category) query.category = category;
//         if (subCategory) query.subCategory = subCategory;
//         if (isFeatured) query.isFeatured = isFeatured === 'true';
//         if (isNewArrival) query.isNewArrival = isNewArrival === 'true';
//         if (search) query.name = { $regex: search, $options: 'i' };

//         const pageNum = parseInt(page);
//         const limitNum = parseInt(limit);
//         const skip = (pageNum - 1) * limitNum;

//         const total = await productsCollection.countDocuments(query);
//         const products = await productsCollection
//             .find(query)
//             .sort({ createdAt: -1 })
//             .skip(skip)
//             .limit(limitNum)
//             .toArray();

//         res.send({ total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum), products });
//     } catch (err) {
//         res.status(500).send({ message: 'Failed to fetch products', error: err.message });
//     }
// });

// // GET single product by id
// app.get('/products/:id', async (req, res) => {
//     try {
//         const id = req.params.id;
//         if (!ObjectId.isValid(id)) return res.status(400).send({ message: 'Invalid product id' });

//         const product = await productsCollection.findOne({ _id: new ObjectId(id) });
//         if (!product) return res.status(404).send({ message: 'Product not found' });

//         res.send(product);
//     } catch (err) {
//         res.status(500).send({ message: 'Failed to fetch product', error: err.message });
//     }
// });

// // POST create a new product
// app.post('/products', async (req, res) => {
//     try {
//         const product = req.body;

//         if (!product.name || !product.productType || !product.category) {
//             return res.status(400).send({ message: 'name, productType and category are required' });
//         }

//         product.isActive = product.isActive ?? true;
//         product.createdAt = new Date().toISOString();
//         product.updatedAt = new Date().toISOString();

//         const result = await productsCollection.insertOne(product);
//         res.status(201).send(result);
//     } catch (err) {
//         res.status(500).send({ message: 'Failed to create product', error: err.message });
//     }
// });

// // PATCH update an existing product (partial update — send only changed fields)
// app.patch('/products/:id', async (req, res) => {
//     try {
//         const id = req.params.id;
//         if (!ObjectId.isValid(id)) return res.status(400).send({ message: 'Invalid product id' });

//         const updatedDoc = { ...req.body, updatedAt: new Date().toISOString() };
//         delete updatedDoc._id; // never allow overwriting _id

//         const result = await productsCollection.updateOne(
//             { _id: new ObjectId(id) },
//             { $set: updatedDoc }
//         );

//         if (result.matchedCount === 0) return res.status(404).send({ message: 'Product not found' });
//         res.send(result);
//     } catch (err) {
//         res.status(500).send({ message: 'Failed to update product', error: err.message });
//     }
// });

// // DELETE a product
// app.delete('/products/:id', async (req, res) => {
//     try {
//         const id = req.params.id;
//         if (!ObjectId.isValid(id)) return res.status(400).send({ message: 'Invalid product id' });

//         const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });
//         if (result.deletedCount === 0) return res.status(404).send({ message: 'Product not found' });

//         res.send(result);
//     } catch (err) {
//         res.status(500).send({ message: 'Failed to delete product', error: err.message });
//     }
// });

// // ---------------------------------------------
// // CATEGORIES  (productType -> category -> subCategories tree)
// // ---------------------------------------------

// // GET all categories (optionally filter by productType)
// // /categories?productType=Men
// app.get('/categories', async (req, res) => {
//     try {
//         const { productType } = req.query;
//         const query = productType ? { type: productType } : {};
//         const categories = await categoriesCollection.find(query).toArray();
//         res.send(categories);
//     } catch (err) {
//         res.status(500).send({ message: 'Failed to fetch categories', error: err.message });
//     }
// });

// // POST create a new productType/category group
// app.post('/categories', async (req, res) => {
//     try {
//         const category = req.body;
//         if (!category.type) return res.status(400).send({ message: 'type is required' });

//         const result = await categoriesCollection.insertOne(category);
//         res.status(201).send(result);
//     } catch (err) {
//         res.status(500).send({ message: 'Failed to create category', error: err.message });
//     }
// });

// // PATCH update a category document (e.g. replace its whole `categories` array,
// // or push/add a new category/subCategory — adjust body shape to your dashboard form)
// app.patch('/categories/:id', async (req, res) => {
//     try {
//         const id = req.params.id;
//         if (!ObjectId.isValid(id)) return res.status(400).send({ message: 'Invalid category id' });

//         const result = await categoriesCollection.updateOne(
//             { _id: new ObjectId(id) },
//             { $set: req.body }
//         );

//         if (result.matchedCount === 0) return res.status(404).send({ message: 'Category not found' });
//         res.send(result);
//     } catch (err) {
//         res.status(500).send({ message: 'Failed to update category', error: err.message });
//     }
// });

// // DELETE a category document
// app.delete('/categories/:id', async (req, res) => {
//     try {
//         const id = req.params.id;
//         if (!ObjectId.isValid(id)) return res.status(400).send({ message: 'Invalid category id' });

//         const result = await categoriesCollection.deleteOne({ _id: new ObjectId(id) });
//         if (result.deletedCount === 0) return res.status(404).send({ message: 'Category not found' });

//         res.send(result);
//     } catch (err) {
//         res.status(500).send({ message: 'Failed to delete category', error: err.message });
//     }
// });

// app.get('/', (req, res) => {
//     res.send('Britto Shop server is running');
// });

// app.listen(port, () => {
//     console.log(`Britto Shop server listening on port ${port}`);
// });