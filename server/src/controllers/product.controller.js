import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Product from "../models/product.model.js";

const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, stockQuantity, unit, category } = req.body;

    if (!name || !description || price === undefined || stockQuantity === undefined || !unit) {
        throw new ApiError(400, "All required fields must be provided");
    }

    // Check if product already exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
        throw new ApiError(409, "Product with this name already exists");
    }

    const product = await Product.create({
        name,
        description,
        price,
        stockQuantity,
        unit,
        category: category || 'regular'
    });

    return res.status(201).json(
        new ApiResponse(201, product, "Product created successfully")
    );
});

const getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
        new ApiResponse(200, product, "Product fetched successfully")
    );
});

const editProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { name, description, price, stockQuantity, unit, category } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Check if name is being changed and if it conflicts
    if (name && name !== product.name) {
        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            throw new ApiError(409, "Product with this name already exists");
        }
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;
    if (stockQuantity !== undefined) product.stockQuantity = stockQuantity;
    if (unit) product.unit = unit;
    if (category) product.category = category;

    await product.save();

    return res.status(200).json(
        new ApiResponse(200, product, "Product updated successfully")
    );
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    // Only admin can delete products
    if (req.user.role !== 'admin') {
        throw new ApiError(403, "Only admin can delete products");
    }

    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Product deleted successfully")
    );
});

const getLowStockProduct = asyncHandler(async (req, res) => {
    const { threshold = 10 } = req.query;

    const lowStockProducts = await Product.find({
        stockQuantity: { $lte: parseInt(threshold) }
    }).sort({ stockQuantity: 1 });

    return res.status(200).json(
        new ApiResponse(200, lowStockProducts, "Low stock products fetched successfully")
    );
});

const updateStockProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { stockQuantity, operation } = req.body; // operation: 'add' or 'set'

    if (stockQuantity === undefined) {
        throw new ApiError(400, "Stock quantity is required");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (operation === 'add') {
        product.stockQuantity += parseInt(stockQuantity);
    } else {
        product.stockQuantity = parseInt(stockQuantity);
    }

    if (product.stockQuantity < 0) {
        throw new ApiError(400, "Stock quantity cannot be negative");
    }

    await product.save();

    return res.status(200).json(
        new ApiResponse(200, product, "Stock updated successfully")
    );
});

const getAllProduct = asyncHandler(async (req, res) => {
    const { category, unit, page = 1, limit = 10, search } = req.query;

    const query = {};

    if (category) {
        query.category = category;
    }

    if (unit) {
        query.unit = unit;
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        }, "Products fetched successfully")
    );
});

export { 
    createProduct, 
    getProductById, 
    editProduct, 
    deleteProduct, 
    getLowStockProduct, 
    updateStockProduct, 
    getAllProduct 
};
