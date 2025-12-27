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
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paidAmound:{
        type: Number,
        min: 0
    }
},{timestamps: true});

const Billed = mongoose.model("Billed", BilledSchema);

export default Billed;
