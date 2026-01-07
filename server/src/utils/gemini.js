import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const processOrderSlipGemini = async (imagePath) => {
  try {
    // Most common fix: Just use the name directly
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert local image file to base64 for Gemini
    const imageData = {
      inlineData: {
        data: Buffer.from(fs.readFileSync(imagePath)).toString("base64"),
        mimeType: "image/jpeg",
      },
    };

    const prompt = `
      Extract details from this handwritten plastic shop order slip. 
      Return ONLY a JSON object with this structure:
      {
        "clientName": "string",
        "products": [{"name": "string", "quantity": number, "pricePerUnit": number, "totalPrice": number}],
        "oldBalance": number,
        "totalAmount": number
      }
      If a value is unclear, return null. Use the math on the slip to verify totals.
    `;

    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const text = response.text();
    
    // Clean the AI response (remove markdown code blocks if present)
    const cleanJson = text.replace(/```json|```/g, "").trim();
    
    return {
      success: true,
      data: JSON.parse(cleanJson),
      rawText: text
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { success: false, error: error.message };
  }
};