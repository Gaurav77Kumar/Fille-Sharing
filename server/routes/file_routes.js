import express from "express";
import auth_middleware from "../middleware/auth_middleware.js";
import { upload } from "../middleware/multer.js";
import multer from "multer";
import rateLimit from "express-rate-limit";
import {
    uploadFiles,
    downloadFile,
    deleteFile,
    updateFileStatus,
    updateFileExpiry,
    updateFilePassword,
    searchFiles,
    showUserFiles,
    getFileDetails,
    generateShareShortenLink,
    sendLinkEmail,
    generateQR,
    getDownloadCount,
    resolveShareLink,
    verifyFilePassword,
    getUserFiles,
    updateAllFileExpiry,
    downloadInfo,
    uploadFilesGuest,
    guestDownloadInfo,
    verifyGuestFilePassword,
} from "../controllers/file_controller.js";


const guestUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024, files: 3},
    fileFilter: (req, file, cb) => {
        const ALLOWED = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
        ALLOWED.includes(file.mimetype) ? cb(null, true) : cb(new Error("Only JPEG, PNG, PDF, and TXT files are allowed"));
    }
})

// Rate limiter - brute force protection for password verify
const passwordRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, 
    message: { message: "Too many attempts, please try again later"},
    standardHeaders: true,
})

const router = express.Router();

router.post("/upload", auth_middleware, upload.array("files", 10), uploadFiles);
router.get("/my-files",  auth_middleware,  showUserFiles);
router.get("/search",    auth_middleware,  searchFiles);

router.get("/details/:fileId",   auth_middleware,   getFileDetails);
router.get("/download-info/:fileId", auth_middleware, downloadInfo);
router.get("/download/:fileId", auth_middleware, downloadFile);
router.get("/download-count/:fileId", auth_middleware, getDownloadCount);

router.delete("/delete/:fileId", auth_middleware, deleteFile);
router.patch("/status/:fileId", auth_middleware, updateFileStatus);
router.patch("/expiry/:fileId", auth_middleware, updateFileExpiry);
router.patch("/password/:fileId", auth_middleware, updateFilePassword);
router.patch("/expiry-all", auth_middleware, updateAllFileExpiry);

router.get("/share-link/:fileId", auth_middleware, generateShareShortenLink);
router.post("/send-email/:fileId", auth_middleware, sendLinkEmail);
router.get("/qr/:fileId", auth_middleware, generateQR);


router.get("/share/: slug", resolveShareLink);

router.post("/verify-password/:fileId", passwordRateLimit, verifyFilePassword);

router.post("/verify-password/:slug", passwordRateLimit, verifyFilePassword);

router.post("/guest/upload", guestUpload.array("files", 5), uploadFilesGuest);

router.get("/guest/download-info/:shortUrl", guestDownloadInfo);
router.post("/guest/verify-password/:slug", passwordRateLimit, verifyGuestFilePassword);

export default router;

