import mongoose,{Schema} from "mongoose";

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stockQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    unit:{
        type: String,
        required: true,
        enum: ['kg', 'piece']

    },
    category: {
        type: String,
        required: true,
        enum: ['soft', 'regular'],
        default: 'regular'
    }
}, {timestamps: true});

const Product = mongoose.model("Product", ProductSchema);

export default Product;
