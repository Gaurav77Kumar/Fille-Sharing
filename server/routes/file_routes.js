import express from "express";
import auth_middleware from "../middleware/auth_middleware.js";
import { upload } from "../middleware/multer.js";
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

const router = express.Router();



// Upload files (authenticated users)
router.post("/upload", auth_middleware, upload.array("files", 10), uploadFiles); // Done

// Get all user files
router.get("/user-files", auth_middleware, getUserFiles);  // DONE
  
// Show user files with pagination
router.get("/my-files", auth_middleware, showUserFiles);  // DONE

// Search files
router.get("/search", auth_middleware, searchFiles);    // DONE

// Get file details
router.get("/details/:fileId", auth_middleware, getFileDetails);

// Get download info
router.get("/download-info/:fileId", auth_middleware, downloadInfo);  // DONE

// Download file
router.get("/download/:fileId", auth_middleware, downloadFile);

// Get download count
router.get("/download-count/:fileId", auth_middleware, getDownloadCount);

// Delete file
router.delete("/delete/:fileId", auth_middleware, deleteFile);

// Update file status
router.patch("/status/:fileId", auth_middleware, updateFileStatus);

// Update file expiry
router.patch("/expiry/:fileId", auth_middleware, updateFileExpiry);

// Update file password
router.patch("/password/:fileId", auth_middleware, updateFilePassword);

// Update all files expiry
router.patch("/expiry-all", auth_middleware, updateAllFileExpiry);

// Generate share link
router.get("/share-link/:fileId", auth_middleware, generateShareShortenLink);

// Send link via email
router.post("/send-email/:fileId", auth_middleware, sendLinkEmail);   // DONE

// Generate QR code
router.get("/qr/:fileId", auth_middleware, generateQR);    // DONE

// Verify file password (for authenticated shared files)
router.post("/verify-password/:fileId", verifyFilePassword);



// Resolve share link (public - no auth required)
router.get("/share/:shortUrl", resolveShareLink);    // DONE



// Upload files (guest users - no auth required)
router.post("/guest/upload", upload.array("files", 5), uploadFilesGuest);  // DONE

// Get guest download info
router.get("/guest/download-info/:shortUrl", guestDownloadInfo);           // DONE

// Verify guest file password
router.post("/guest/verify-password/:shortUrl", verifyGuestFilePassword);  // DONE

export default router;
