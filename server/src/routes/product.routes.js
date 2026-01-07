import { Router } from "express";
import {
    createProduct,
    getProductById,
    editProduct,
    deleteProduct,
    getLowStockProduct,
    updateStockProduct,
    getAllProduct
} from "../controllers/product.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdminOrStaff } from "../middleware/role.middleware.js";

const router = Router();

// All product routes require authentication
router.use(verifyJWT);

// Public product routes (authenticated users can view)
// 1. Specific static routes first
router.route("/low-stock").get(getLowStockProduct);

// 2. General list route
router.route("/").get(getAllProduct);

// 3. Dynamic ID routes last
router.route("/:productId").get(getProductById);

// Admin/Staff only routes (Order doesn't matter as much here, but keep it clean)
router.route("/").post(isAdminOrStaff, createProduct);
router.route("/:productId").patch(isAdminOrStaff, editProduct);
router.route("/:productId").delete(isAdminOrStaff, deleteProduct);
router.route("/:productId/stock").patch(isAdminOrStaff, updateStockProduct);
export default router;

