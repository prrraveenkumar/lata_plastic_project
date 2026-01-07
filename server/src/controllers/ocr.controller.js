import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { processOrderSlip, enhancedParseOrderSlip } from "../utils/ocrService.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import { processOrderSlipGemini } from "../utils/gemini.js";

/**
 * Upload and process order slip image
 * POST /api/ocr/process-slip
 */

const processOrderSlipImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Image file is required");
    }

    const imagePath = req.file.path;

    try {
        // Process the image using OCR
        const result = await processOrderSlip(imagePath);

        if (!result.success) {
            throw new ApiError(500, result.error || "Failed to process order slip");
        }

        // Try to match client name with existing clients
        let matchedClient = null;
        if (result.data.clientName) {
            // Try to find client by name (fuzzy match)
            const clients = await User.find({ role: 'client' });
            matchedClient = clients.find(client => 
                client.fullname.toLowerCase().includes(result.data.clientName.toLowerCase()) ||
                result.data.clientName.toLowerCase().includes(client.fullname.toLowerCase())
            );
        }

        // Try to match products with existing products
        const matchedProducts = [];
        if (result.data.products && result.data.products.length > 0) {
            const allProducts = await Product.find({});
            
            for (const extractedProduct of result.data.products) {
                // Try to find matching product by name
                const matched = allProducts.find(product =>
                    product.name.toLowerCase().includes(extractedProduct.name.toLowerCase()) ||
                    extractedProduct.name.toLowerCase().includes(product.name.toLowerCase())
                );

                if (matched) {
                    matchedProducts.push({
                        productId: matched._id,
                        productName: matched.name,
                        quantity: extractedProduct.quantity,
                        pricePerUnit: extractedProduct.pricePerUnit || matched.price,
                        totalPrice: extractedProduct.totalPrice || (extractedProduct.quantity * (extractedProduct.pricePerUnit || matched.price))
                    });
                } else {
                    // Product not found, include as-is for manual review
                    matchedProducts.push({
                        productName: extractedProduct.name,
                        quantity: extractedProduct.quantity,
                        pricePerUnit: extractedProduct.pricePerUnit,
                        totalPrice: extractedProduct.totalPrice,
                        note: "Product not found in database - needs manual matching"
                    });
                }
            }
        }

        return res.status(200).json(
            new ApiResponse(200, {
                extractedData: result.data,
                rawText: result.rawText,
                matchedClient: matchedClient ? {
                    _id: matchedClient._id,
                    fullname: matchedClient.fullname,
                    mobileno: matchedClient.mobileno
                } : null,
                matchedProducts,
                oldBalance: result.data.oldBalance,
                totalAmount: result.data.totalAmount,
                suggestions: {
                    clientNeedsReview: !matchedClient,
                    productsNeedReview: matchedProducts.some(p => p.note)
                }
            }, "Order slip processed successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to process order slip");
    }
});

/**
 * Create order from processed OCR data
 * POST /api/ocr/create-order
 */
const createOrderFromOCR = asyncHandler(async (req, res) => {
    const { clientId, products, oldBalance, totalAmount } = req.body;

    if (!clientId || !products || products.length === 0) {
        throw new ApiError(400, "Client ID and products are required");
    }

    // Verify client exists
    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
        throw new ApiError(404, "Client not found");
    }

    // Process products
    let calculatedTotal = oldBalance || 0;
    const processedProducts = [];

    for (const item of products) {
        if (!item.productId) {
            throw new ApiError(400, `Product ID is required for product: ${item.productName || 'Unknown'}`);
        }

        const product = await Product.findById(item.productId);
        if (!product) {
            throw new ApiError(404, `Product with ID ${item.productId} not found`);
        }

        const pricePerUnit = item.pricePerUnit || product.price;
        const quantity = item.quantity;
        const totalPrice = pricePerUnit * quantity;

        calculatedTotal += totalPrice;

        processedProducts.push({
            product: product._id,
            quantity,
            pricePerUnit,
            totalPrice
        });

        // Update stock
        product.stockQuantity -= quantity;
        if (product.stockQuantity < 0) {
            throw new ApiError(400, `Insufficient stock for product ${product.name}`);
        }
        await product.save();
    }

    // Generate bill number
    const billNumber = `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create order
    const order = await Order.create({
        billNumber,
        client: clientId,
        productList: processedProducts,
        totalAmount: totalAmount || calculatedTotal,
        oldBalance: oldBalance || 0,
        amountPaid: 0,
        paymentStatus: 'Unpaid'
    });

    // Update client credit balance
    client.creditBalance = (client.creditBalance || 0) + (totalAmount || calculatedTotal);
    await client.save();

    const populatedOrder = await Order.findById(order._id)
        .populate('client', 'fullname mobileno email address')
        .populate('productList.product', 'name price unit');

    return res.status(201).json(
        new ApiResponse(201, populatedOrder, "Order created from OCR data successfully")
    );
});

export { processOrderSlipImage, createOrderFromOCR };

