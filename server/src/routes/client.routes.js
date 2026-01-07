import { Router } from "express";
import {
    addClient,
    getAllClients,
    getClientDetails,
    processClientPayment,
    getClientCredit
} from "../controllers/client.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdminOrStaff, isClient } from "../middleware/role.middleware.js";

const router = Router();

// All client routes require authentication
router.use(verifyJWT);

// Client-specific routes (clients can see their own data)
router.route("/my-credit").get(isClient, getClientCredit);

// Admin/Staff routes
router.route("/").post(isAdminOrStaff, addClient);
router.route("/").get(isAdminOrStaff, getAllClients);
router.route("/:clientId").get(isAdminOrStaff, getClientDetails);
router.route("/:clientId/payment").post(isAdminOrStaff, processClientPayment);

export default router;

