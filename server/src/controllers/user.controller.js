import User from "../models/user.model.js";
import Order from "../models/order.model.js"
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOncloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose, { Aggregate } from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found")
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }

    } catch (error) {

        console.error("JWT Error:", error); // This will tell you if it's a 'Secret missing' or 'Database' error
        throw new ApiError(500, "Token generation failed");
    }
}

// User Registration Controller

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, mobileno, password, role, email, address } = req.body;

    if ([fullname, mobileno, password].some((field) => !field || !field.trim())) {
        throw new ApiError(400, "All fields are required")
    }

    const existingUser = await User.findOne({
        $or: [{ mobileno, fullname }]
    });

    let avatarLocalPath = null;
    if (req.file) {
        avatarLocalPath = req.file.path;
    }

    let avatarUrl = null;
    if (avatarLocalPath) {
        const uploadResult = await uploadOncloudinary(avatarLocalPath);
        if (uploadResult && uploadResult.secure_url) {
            avatarUrl = uploadResult.secure_url;
        }
    }

    if (existingUser) {
        throw new ApiError(409, "User with provided mobileno or fullname already exists");
    }

    const newUser = await User.create({
        fullname,
        mobileno,
        password,
        email: email || "",
        address: address || "",
        role: role || 'client',
        avatar: avatarUrl || ""
    });

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "User registration failed");
    }

    res.status(201).json(new ApiResponse(201, { user: createdUser }, "User registered successfully"));
})

// Login Controller 

const loginUser = asyncHandler(async (req, res) => {

    const { mobileno, password } = req.body;

    console.log(`mobileno: ${mobileno}, password: ${password}`)

    if ([mobileno, password].some((field) => (!field.trim()))) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ mobileno })

    if (!user) {
        throw new ApiError(404, "User with this no. is not found");
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        throw new ApiError(401, "Invalid credentials");
    }


    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id);

    const Option = {
        httpOnly: true,
        secure: true
    }



    res
        .status(200)
        .cookie("refreshToken", refreshToken, Option)
        .cookie("accessToken", accessToken, Option)
        .json(new ApiResponse(200, { user: loggedInUser }, "User logged in successfully"));

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const option = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
        .clearCookie("refreshToken", option)
        .clearCookie("accessToken", option)
        .json(new ApiResponse(200, null, "User logged out successfully"));
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required")
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findOne({ _id: decodedToken._id }).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(403, "Invalid refresh token");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const option = {
        httpOnly: true,
        secure: true
    }

    res
        .status(200)
        .cookie("refreshToken", refreshToken, option)
        .cookie("accessToken", accessToken, option)
        .json(new ApiResponse(200, { user }, "Token refreshed successfully"));
})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    if ([oldPassword, newPassword].some(field => !field || !field.trim())) {
        throw new ApiError(401, "Both fields are required")
    }

    const user = await User.findById(req.user?._id)

    const isPassordCorrect = await user.comparePassword(oldPassword)

    if (!isPassordCorrect) {
        throw new ApiError(404, "Old password is not correct")
    }

    user.password = newPassword

    await user.save({
        validateBeforeSave: false
    })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password is changed"))

})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { user }, "Current user fetched successfully"))
})

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadOncloudinary(avatarLocalPath)

    if (!avatar) {
        throw new ApiError(500, "Problem in uploading image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.secure_url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(400, "User doesnt exist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { user }, "Avatar uploaded successfully"))


})

const getClientPortfolio = asyncHandler(async (req, res) => {
    const { clientId } = req.params;

    // Fetch client details and orders in parallel
    const [client, orders] = await Promise.all([
        User.findById(clientId),
        Order.find({ client: clientId }).sort({ createdAt: -1 })
    ]);

    if (!client) {
        throw new ApiError(404, "Client not found");
    }

    // Calculate total unpaid amount dynamically
    const unpaidAmount = orders.reduce((acc, order) => {
        return acc + (order.totalAmount - order.amountPaid);
    }, 0);

    res.status(200).json(
        new ApiResponse(200, {
            profile: {
                name: client.fullname,
                mobile: client.mobileno,
                email: client.email,
                address: client.address,
                unpaidAmount
            },
            orders
        }, "Client portfolio fetched successfully")
    );
});

export { registerUser, loginUser, logoutUser, refreshAccessToken, changePassword, getCurrentUser, updateAvatar, getClientPortfolio }
