import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new Schema({
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,

    },
    address: {
        type: String,
        default : ""
    },
    mobileno: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
    },
    role:{
        type: String,
        enum: ['admin','staff','client'],
        default: 'client'
        
    },
    creditBalance: {
        type: Number,
        default: 0,
        min: 0
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true,
})

UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10)
})

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}

UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            mobileno: this.mobileno,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            mobileno: this.mobileno,
            fullname: this.fullname
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const User = mongoose.model("User", UserSchema);

export default User;