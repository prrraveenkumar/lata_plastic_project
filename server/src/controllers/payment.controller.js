import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Transaction } from "../models/transation.model.js";
import User from "../models/user.model.js";

// Get all payments (admin/staff only, or client sees their own)
const getAllPayments = asyncHandler(async (req, res) => {
    const { clientId, paymentMethod, page = 1, limit = 10 } = req.query;

    const query = {};

    // If user is client, only show their payments
    if (req.user.role === 'client') {
        query.client = req.user._id;
    } else if (clientId) {
        query.client = clientId;
    }

    if (paymentMethod) {
        query.paymentMethod = paymentMethod;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Transaction.find(query)
        .populate('client', 'fullname mobileno email')
        .populate('receivedBy', 'fullname')
        .populate('appliedToOrders.orderId', 'billNumber totalAmount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        }, "Payments fetched successfully")
    );
});

// Get payment by ID
const getPaymentById = asyncHandler(async (req, res) => {
    const { paymentId } = req.params;

    const payment = await Transaction.findById(paymentId)
        .populate('client', 'fullname mobileno email address')
        .populate('receivedBy', 'fullname')
        .populate('appliedToOrders.orderId', 'billNumber totalAmount amountPaid');

    if (!payment) {
        throw new ApiError(404, "Payment not found");
    }

    // Check if user is client and owns this payment
    if (req.user.role === 'client' && payment.client._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access denied");
    }

    return res.status(200).json(
        new ApiResponse(200, payment, "Payment fetched successfully")
    );
});

// Get client's own payment history
const getClientPayments = asyncHandler(async (req, res) => {
    const clientId = req.user._id;

    const payments = await Transaction.find({ client: clientId })
        .populate('receivedBy', 'fullname')
        .populate('appliedToOrders.orderId', 'billNumber totalAmount')
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, payments, "Payment history fetched successfully")
    );
});

export { getAllPayments, getPaymentById, getClientPayments };

