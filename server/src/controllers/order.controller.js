import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";

const createOrder = asyncHandler(async (req, res) => {
    const { clientId, productList, oldBalance } = req.body;

    if (!clientId || !productList || productList.length === 0) {
        throw new ApiError(400, "Client ID and product list are required");
    }

    // Verify client exists
    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
        throw new ApiError(404, "Client not found");
    }

    // Calculate total amount and verify products
    let totalAmount = oldBalance || 0;
    const processedProducts = [];

    for (const item of productList) {
        const product = await Product.findById(item.productId);
        if (!product) {
            throw new ApiError(404, `Product with ID ${item.productId} not found`);
        }

        const pricePerUnit = item.pricePerUnit || product.price;
        const quantity = item.quantity;
        const totalPrice = pricePerUnit * quantity;

        totalAmount += totalPrice;

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
        totalAmount,
        oldBalance: oldBalance || 0,
        amountPaid: 0,
        paymentStatus: 'Unpaid'
    });

    // Update client credit balance
    client.creditBalance = (client.creditBalance || 0) + totalAmount;
    await client.save();

    const populatedOrder = await Order.findById(order._id)
        .populate('client', 'fullname mobileno email address')
        .populate('productList.product', 'name price unit');

    return res.status(201).json(
        new ApiResponse(201, populatedOrder, "Order created successfully")
    );
});

const getOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
        .populate('client', 'fullname mobileno email address')
        .populate('productList.product', 'name price unit category');

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Check if user is client and owns this order
    if (req.user.role === 'client' && order.client._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access denied");
    }

    return res.status(200).json(
        new ApiResponse(200, order, "Order fetched successfully")
    );
});

const updateOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { productList, oldBalance } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Only admin/staff can update orders
    if (req.user.role === 'client') {
        throw new ApiError(403, "Access denied");
    }

    // Recalculate if product list is provided
    if (productList && productList.length > 0) {
        let totalAmount = oldBalance || order.oldBalance;
        const processedProducts = [];

        for (const item of productList) {
            const product = await Product.findById(item.productId);
            if (!product) {
                throw new ApiError(404, `Product with ID ${item.productId} not found`);
            }

            const pricePerUnit = item.pricePerUnit || product.price;
            const quantity = item.quantity;
            const totalPrice = pricePerUnit * quantity;

            totalAmount += totalPrice;

            processedProducts.push({
                product: product._id,
                quantity,
                pricePerUnit,
                totalPrice
            });
        }

        order.productList = processedProducts;
        order.totalAmount = totalAmount;
        if (oldBalance !== undefined) {
            order.oldBalance = oldBalance;
        }
    }

    // Update payment status based on amount paid
    if (order.amountPaid >= order.totalAmount) {
        order.paymentStatus = 'Paid';
    } else if (order.amountPaid > 0) {
        order.paymentStatus = 'Partially Paid';
    } else {
        order.paymentStatus = 'Unpaid';
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
        .populate('client', 'fullname mobileno email address')
        .populate('productList.product', 'name price unit');

    return res.status(200).json(
        new ApiResponse(200, updatedOrder, "Order updated successfully")
    );
});

const getAllOrder = asyncHandler(async (req, res) => {
    const { clientId, paymentStatus, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};
    
    // If user is client, only show their orders
    if (req.user.role === 'client') {
        query.client = req.user._id;
    } else if (clientId) {
        query.client = clientId;
    }

    if (paymentStatus) {
        query.paymentStatus = paymentStatus;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
        .populate('client', 'fullname mobileno email address')
        .populate('productList.product', 'name price unit')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        }, "Orders fetched successfully")
    );
});

const deleteOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    // Only admin can delete orders
    if (req.user.role !== 'admin') {
        throw new ApiError(403, "Only admin can delete orders");
    }

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    await Order.findByIdAndDelete(orderId);

    return res.status(200).json(
        new ApiResponse(200, null, "Order deleted successfully")
    );
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { paymentStatus, amountPaid } = req.body;

    // Only admin/staff can update order status
    if (req.user.role === 'client') {
        throw new ApiError(403, "Access denied");
    }

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (amountPaid !== undefined) {
        order.amountPaid = amountPaid;
    }

    if (paymentStatus) {
        order.paymentStatus = paymentStatus;
    } else if (amountPaid !== undefined) {
        // Auto-update payment status
        if (order.amountPaid >= order.totalAmount) {
            order.paymentStatus = 'Paid';
        } else if (order.amountPaid > 0) {
            order.paymentStatus = 'Partially Paid';
        } else {
            order.paymentStatus = 'Unpaid';
        }
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
        .populate('client', 'fullname mobileno email address')
        .populate('productList.product', 'name price unit');

    return res.status(200).json(
        new ApiResponse(200, updatedOrder, "Order status updated successfully")
    );
});

export { createOrder, getOrder, updateOrder, getAllOrder, deleteOrder, updateOrderStatus };
