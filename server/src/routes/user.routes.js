import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changePassword, 
    getCurrentUser, 
    updateAvatar,
    getClientPortfolio
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);
router.route("/client-portfolio/:clientId").get(verifyJWT, getClientPortfolio);

export default router;

