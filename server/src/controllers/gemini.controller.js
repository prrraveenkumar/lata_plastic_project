import { GoogleGenerativeAI } from "@google/generative-ai";
import User  from "../models/user.model.js";
import Product  from "../models/product.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fs from "fs";
import Fuse from "fuse.js"


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const processOrderSlipGemini = asyncHandler(async (req, res) => {
    // 1. Check if file exists
    const slipLocalPath = req.file?.path;

    if (!slipLocalPath) {
        throw new ApiError(400, "Order slip image is required");
    }

    try {
        // 2. Initialize Gemini Pro Vision
        const model = genAI.getGenerativeModel(
            { model:  "gemini-2.5-flash" }
        );
        // 3. Convert image to base64 for Gemini
        const imageData = {
            inlineData: {
                data: Buffer.from(fs.readFileSync(slipLocalPath)).toString("base64"),
                mimeType: req.file.mimetype,
            },
        };

        const prompt = `
            You are an assistant for 'Lata Plastic'. Read this handwritten order slip.
            Return ONLY a valid JSON object. 
            Do not include markdown formatting like \`\`\`json.
            Structure:
            {
                "clientName": "string",
                "items": [{"name": "string", "quantity": number, "price": number, "totalPrice": number}],
                "oldBalance": number,
                "totalAmount": number
            }
        `;

        // 4. Generate content
       const result = await model.generateContent([prompt, imageData]);
        const extractedData = JSON.parse(result.response.text().replace(/```json|```/g, "").trim());

        // --- 1. FUZZY CLIENT MATCHING ---
        const clients = await User.find({ role: 'client' });
        const clientFuse = new Fuse(clients, { keys: ['fullname'], threshold: 0.4 });
        const clientResults = clientFuse.search(extractedData.clientName || '');
        
        // Correctly extract the MongoDB item from Fuse results
        const matchedClient = clientResults.length > 0 ? clientResults[0].item : null;

        // --- 2. FUZZY PRODUCT MATCHING ---
        const products = await Product.find();
        const productFuse = new Fuse(products, { keys: ['name'], threshold: 0.4 });

        const matchedItems = extractedData.items.map(slipItem => {
            const productResults = productFuse.search(slipItem.name);
            const databaseProduct = productResults.length > 0 ? productResults[0].item : null;

            return {
                ...slipItem,
                productId: databaseProduct?._id || null,
                dbName: databaseProduct?.name || "Not Found", // For verification
                isMatched: !!databaseProduct
            };
        });

        if (fs.existsSync(slipLocalPath)) fs.unlinkSync(slipLocalPath);

        return res.status(200).json(
            new ApiResponse(200, {
                extracted: extractedData,
                matchedClient,
                matchedItems
            }, "Slip processed. Please verify details.")
        );

    } catch (error) {
        if (fs.existsSync(slipLocalPath)) fs.unlinkSync(slipLocalPath);
        throw new ApiError(500, error?.message || "Internal server error during OCR");
    }
});