import { Router } from "express";
import {
    createOrder,
    getOrder,
    updateOrder,
    getAllOrder,
    deleteOrder,
    updateOrderStatus
} from "../controllers/order.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdminOrStaff, isAdmin } from "../middleware/role.middleware.js";

const router = Router();

// All order routes require authentication
router.use(verifyJWT);

// Routes accessible to all authenticated users (clients see only their orders)
router.route("/").get(getAllOrder);
router.route("/:orderId").get(getOrder);

// Admin/Staff only routes
router.route("/").post(isAdminOrStaff, createOrder);
router.route("/:orderId").patch(isAdminOrStaff, updateOrder);
router.route("/:orderId/status").patch(isAdminOrStaff, updateOrderStatus);

// Admin only routes
router.route("/:orderId").delete(isAdmin, deleteOrder);

export default router;

