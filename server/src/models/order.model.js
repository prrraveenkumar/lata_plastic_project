import mongoose, { Schema } from "mongoose";

const BilledSchema = new Schema({
    billNumber: {
        type: String,
        required: true,
        unique: true
    },
    productList: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            pricePerUnit: {
                type: Number,
                required: true,
                min: 0
            },
            totalPrice: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    oldBalance: {
        type: Number,
        default: 0,
        min: 0
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amountPaid:{
        type: Number,
        default: 0,
        min: 0
    },
    paymentStatus:{
        type: String,
        required: true,
        enum:['Paid', 'Partially Paid', 'Unpaid'],
        default: 'Unpaid'
    }
},{timestamps: true});

const Order = mongoose.model("Order", BilledSchema);

export default Order;
