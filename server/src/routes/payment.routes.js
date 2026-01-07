import { Router } from "express";
import {
    getAllPayments,
    getPaymentById,
    getClientPayments
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { isClient } from "../middleware/role.middleware.js";

const router = Router();

// All payment routes require authentication
router.use(verifyJWT);

// Client can see their own payments
router.route("/my-payments").get(isClient, getClientPayments);

// All authenticated users can access (clients see only their payments, admin/staff see all)
router.route("/").get(getAllPayments);
router.route("/:paymentId").get(getPaymentById);

export default router;

