import express from "express";
import auth_middleware from "../middleware/auth_middleware.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
} from "../controllers/user_controller.js";
import authorizeUser from "../middleware/authorizeUser.js";

const router = express.Router();

// Auth routes
router.post("/register", registerUser);    // working
router.post("/login", loginUser);          // working  
router.post("/logout", logoutUser);        // working

// User routes (protected)
router.get("/users", auth_middleware, authorizeUser, getUsers);
router.get("/users/:userId", auth_middleware, authorizeUser, getUserById);
router.patch("/users/:userId", auth_middleware, authorizeUser, updateUser);
router.delete("/users/:userId", auth_middleware, authorizeUser, deleteUser);

export default router;
