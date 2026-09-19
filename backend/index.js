const express = require('express');
const cors = require('cors');
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@brittodb.o3wjzwp.mongodb.net/?appName=brittodb`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// collections — connect once, reuse everywhere (client.close() removed on purpose)
let productsCollection;
let categoriesCollection;

async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // TODO: replace 'brittoshop' with your actual database name if different
        const db = client.db("brittoshop");
        productsCollection = db.collection("products");
        categoriesCollection = db.collection("categories");
    } catch (err) {
        console.error("MongoDB connection failed:", err);
    }
}
run();

// ---------------------------------------------
// PRODUCTS
// ---------------------------------------------

// GET all products — supports filtering + pagination
// /products?productType=Men&category=Topwear&subCategory=Hoodie&search=hoodie&page=1&limit=20
app.get('/products', async (req, res) => {
    try {
        const { productType, category, subCategory, search, isFeatured, isNewArrival, page = 1, limit = 20 } = req.query;

        const query = {};
        if (productType) query.productType = productType;
        if (category) query.category = category;
        if (subCategory) query.subCategory = subCategory;
        if (isFeatured) query.isFeatured = isFeatured === 'true';
        if (isNewArrival) query.isNewArrival = isNewArrival === 'true';
        if (search) query.name = { $regex: search, $options: 'i' };

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const total = await productsCollection.countDocuments(query);
        const products = await productsCollection
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .toArray();

        res.send({ total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum), products });
    } catch (err) {
        res.status(500).send({ message: 'Failed to fetch products', error: err.message });
    }
});

// GET single product by id
app.get('/products/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) return res.status(400).send({ message: 'Invalid product id' });

        const product = await productsCollection.findOne({ _id: new ObjectId(id) });
        if (!product) return res.status(404).send({ message: 'Product not found' });

        res.send(product);
    } catch (err) {
        res.status(500).send({ message: 'Failed to fetch product', error: err.message });
    }
});

// POST create a new product
app.post('/products', async (req, res) => {
    try {
        const product = req.body;

        if (!product.name || !product.productType || !product.category) {
            return res.status(400).send({ message: 'name, productType and category are required' });
        }

        product.isActive = product.isActive ?? true;
        product.createdAt = new Date().toISOString();
        product.updatedAt = new Date().toISOString();

        const result = await productsCollection.insertOne(product);
        res.status(201).send(result);
    } catch (err) {
        res.status(500).send({ message: 'Failed to create product', error: err.message });
    }
});

// PATCH update an existing product (partial update — send only changed fields)
app.patch('/products/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) return res.status(400).send({ message: 'Invalid product id' });

        const updatedDoc = { ...req.body, updatedAt: new Date().toISOString() };
        delete updatedDoc._id; // never allow overwriting _id

        const result = await productsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedDoc }
        );

        if (result.matchedCount === 0) return res.status(404).send({ message: 'Product not found' });
        res.send(result);
    } catch (err) {
        res.status(500).send({ message: 'Failed to update product', error: err.message });
    }
});

// DELETE a product
app.delete('/products/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) return res.status(400).send({ message: 'Invalid product id' });

        const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return res.status(404).send({ message: 'Product not found' });

        res.send(result);
    } catch (err) {
        res.status(500).send({ message: 'Failed to delete product', error: err.message });
    }
});

// ---------------------------------------------
// CATEGORIES  (productType -> category -> subCategories tree)
// ---------------------------------------------

// GET all categories (optionally filter by productType)
// /categories?productType=Men
app.get('/categories', async (req, res) => {
    try {
        const { productType } = req.query;
        const query = productType ? { type: productType } : {};
        const categories = await categoriesCollection.find(query).toArray();
        res.send(categories);
    } catch (err) {
        res.status(500).send({ message: 'Failed to fetch categories', error: err.message });
    }
});

// POST create a new productType/category group
app.post('/categories', async (req, res) => {
    try {
        const category = req.body;
        if (!category.type) return res.status(400).send({ message: 'type is required' });

        const result = await categoriesCollection.insertOne(category);
        res.status(201).send(result);
    } catch (err) {
        res.status(500).send({ message: 'Failed to create category', error: err.message });
    }
});

// PATCH update a category document (e.g. replace its whole `categories` array,
// or push/add a new category/subCategory — adjust body shape to your dashboard form)
app.patch('/categories/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) return res.status(400).send({ message: 'Invalid category id' });

        const result = await categoriesCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: req.body }
        );

        if (result.matchedCount === 0) return res.status(404).send({ message: 'Category not found' });
        res.send(result);
    } catch (err) {
        res.status(500).send({ message: 'Failed to update category', error: err.message });
    }
});

// DELETE a category document
app.delete('/categories/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) return res.status(400).send({ message: 'Invalid category id' });

        const result = await categoriesCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return res.status(404).send({ message: 'Category not found' });

        res.send(result);
    } catch (err) {
        res.status(500).send({ message: 'Failed to delete category', error: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('Britto Shop server is running');
});

app.listen(port, () => {
    console.log(`Britto Shop server listening on port ${port}`);
});