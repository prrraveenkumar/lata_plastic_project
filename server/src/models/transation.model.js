import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ["Payment", "Refund", "CreditNote"],
        default: "Payment"
    },
    paymentMethod: {
        type: String,
        enum: ["Cash", "Online", "Cheque", "Bank Transfer"],
        required: true
    },
    referenceNumber: {
        type: String, // Cheque number or UTR number
        trim: true
    },
    // This array stores which orders were affected by THIS specific payment
    appliedToOrders: [
        {
            orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
            amountApplied: { type: Number, default: 0 }
        }
    ],
    receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" // The Admin/Staff who collected the money
    }
}, { timestamps: true });

export const Transaction = mongoose.model("Transaction", transactionSchema);