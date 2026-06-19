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
    getMe,
} from "../controllers/user_controller.js";
import authorizeUser from "../middleware/authorizeUser.js";
import  authorize  from "../middleware/authorize.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", auth_middleware, logoutUser);

router.get("/me", auth_middleware, getMe);

router.get("/users", auth_middleware, authorize("admin"), getUsers);

router.get("/users/:userId", auth_middleware, authorizeUser, getUserById);
router.patch("/users/:userId", auth_middleware, authorizeUser, updateUser);
router.delete("/users/:userId", auth_middleware, authorizeUser, deleteUser);

export default router;
