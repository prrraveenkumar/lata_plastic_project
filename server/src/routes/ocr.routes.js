import { Router } from "express";
import {
    processOrderSlipImage,
    createOrderFromOCR
} from "../controllers/ocr.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdminOrStaff } from "../middleware/role.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { processOrderSlipGemini } from "../controllers/gemini.controller.js";

const router = Router();

// All OCR routes require authentication and admin/staff role
router.use(verifyJWT);
router.use(isAdminOrStaff);

// Upload and process order slip image
router.route("/process-slip").post(upload.single("image"), processOrderSlipGemini);

// Create order from processed OCR data
router.route("/create-order").post(createOrderFromOCR);

export default router;

