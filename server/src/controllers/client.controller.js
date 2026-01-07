import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { Transaction } from "../models/transation.model.js";

// Add a new client (only admin/staff)
const addClient = asyncHandler(async (req, res) => {
    const { fullname, mobileno, password, email, address } = req.body;

    if (!fullname || !mobileno || !password) {
        throw new ApiError(400, "Fullname, mobileno, and password are required");
    }

    // Check if client already exists
    const existingClient = await User.findOne({ mobileno });
    if (existingClient) {
        throw new ApiError(409, "Client with this mobile number already exists");
    }

    const client = await User.create({
        fullname,
        mobileno,
        password,
        email: email || "",
        address: address || "",
        role: 'client',
        creditBalance: 0
    });

    const createdClient = await User.findById(client?._id).select("-password -refreshToken");

    return res.status(201).json(
        new ApiResponse(201, createdClient, "Client added successfully")
    );
});

// Get all clients (admin/staff only)
const getAllClients = asyncHandler(async (req, res) => {
    const { search, page = 1, limit = 10 } = req.query;

    const query = { role: 'client' };

    if (search) {
        query.$or = [
            { fullname: { $regex: search, $options: 'i' } },
            { mobileno: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const clients = await User.find(query)
        .select("-password -refreshToken")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            clients,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        }, "Clients fetched successfully")
    );
});

// Get client details with credit and orders
const getClientDetails = asyncHandler(async (req, res) => {
    const { clientId } = req.params;

    // If user is client, they can only see their own details
    if (req.user.role === 'client' && req.user._id.toString() !== clientId) {
        throw new ApiError(403, "Access denied");
    }

    const client = await User.findById(clientId).select("-password -refreshToken");
    if (!client || client.role !== 'client') {
        throw new ApiError(404, "Client not found");
    }

    // Get all orders for this client
    const orders = await Order.find({ client: clientId })
        .populate('productList.product', 'name price unit')
        .sort({ createdAt: -1 });

    // Calculate total credit (unpaid amount)
    const totalCredit = orders.reduce((acc, order) => {
        return acc + (order.totalAmount - (order.amountPaid || 0));
    }, 0);

    // Get payment history
    const payments = await Transaction.find({ client: clientId })
        .populate('receivedBy', 'fullname')
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, {
            client: {
                ...client.toObject(),
                totalCredit
            },
            orders,
            payments
        }, "Client details fetched successfully")
    );
});

// Process payment from client
const processClientPayment = asyncHandler(async (req, res) => {
    const { clientId, paymentAmount, paymentMethod, referenceNumber } = req.body;

    if (!clientId || !paymentAmount || !paymentMethod) {
        throw new ApiError(400, "Client ID, payment amount, and payment method are required");
    }

    if (paymentAmount <= 0) {
        throw new ApiError(400, "Payment amount must be greater than 0");
    }

    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
        throw new ApiError(404, "Client not found");
    }

    let remainingPool = paymentAmount;

    // Get all unpaid/partially paid orders, oldest first
    const pendingOrders = await Order.find({
        client: clientId,
        paymentStatus: { $ne: "Paid" }
    }).sort({ createdAt: 1 });

    const appliedToOrders = [];

    // Distribute the payment across orders
    for (let order of pendingOrders) {
        if (remainingPool <= 0) break;

        const amountOwed = order.totalAmount - (order.amountPaid || 0);

        if (remainingPool >= amountOwed) {
            // Can fully pay this order
            remainingPool -= amountOwed;
            order.amountPaid = order.totalAmount;
            order.paymentStatus = "Paid";
            appliedToOrders.push({
                orderId: order._id,
                amountApplied: amountOwed
            });
        } else {
            // Partially pay this order
            order.amountPaid = (order.amountPaid || 0) + remainingPool;
            order.paymentStatus = "Partially Paid";
            appliedToOrders.push({
                orderId: order._id,
                amountApplied: remainingPool
            });
            remainingPool = 0;
        }
        await order.save();
    }

    // Create transaction record
    const transaction = await Transaction.create({
        client: clientId,
        amount: paymentAmount,
        type: "Payment",
        paymentMethod,
        referenceNumber: referenceNumber || "",
        appliedToOrders,
        receivedBy: req.user._id
    });

    // Update client credit balance
    client.creditBalance = Math.max(0, (client.creditBalance || 0) - paymentAmount);
    await client.save();

    const populatedTransaction = await Transaction.findById(transaction._id)
        .populate('client', 'fullname mobileno')
        .populate('receivedBy', 'fullname');

    return res.status(200).json(
        new ApiResponse(200, {
            transaction: populatedTransaction,
            remainingCredit: client.creditBalance,
            appliedToOrders
        }, "Payment processed successfully")
    );
});

// Get client's own credit balance and summary (for client role)
const getClientCredit = asyncHandler(async (req, res) => {
    const clientId = req.user._id;

    const client = await User.findById(clientId);
    if (!client) {
        throw new ApiError(404, "Client not found");
    }

    // Get all orders
    const orders = await Order.find({ client: clientId })
        .populate('productList.product', 'name price unit')
        .sort({ createdAt: -1 });

    // Calculate total credit (unpaid amount)
    const totalCredit = orders.reduce((acc, order) => {
        return acc + (order.totalAmount - (order.amountPaid || 0));
    }, 0);

    // Get payment history
    const payments = await Transaction.find({ client: clientId })
        .populate('receivedBy', 'fullname')
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, {
            creditBalance: totalCredit,
            totalOrders: orders.length,
            paidOrders: orders.filter(o => o.paymentStatus === 'Paid').length,
            unpaidOrders: orders.filter(o => o.paymentStatus !== 'Paid').length,
            orders,
            payments
        }, "Client credit information fetched successfully")
    );
});

export { 
    addClient, 
    getAllClients, 
    getClientDetails, 
    processClientPayment, 
    getClientCredit 
};
