import { File } from "../models/file.js";
import { GuestFile } from "../models/guestFile.js";
import User from "../models/user.js";
import cloudinary from "../config/cloudinary.js";
import shortid from "shortid";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Helper function to upload to cloudinary
const uploadToCloudinary = (fileBuffer, options) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
        uploadStream.end(fileBuffer);
    });
};

// Helper function to get file type category
const getFileCategory = (mimetype) => {
    if (mimetype.startsWith("image/")) return "image";
    if (mimetype.startsWith("video/")) return "video";
    if (mimetype.startsWith("audio/")) return "audio";
    return "raw";
};



// Upload files for authenticated users
const uploadFiles = async (req, res) => {
    try {
        const userId = req.user.id;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const uploadedFiles = [];

        for (const file of files) {
            const fileCategory = getFileCategory(file.mimetype);
            const resourceType = fileCategory === "image" || fileCategory === "video" ? fileCategory : "raw";

            // Upload to cloudinary
            const result = await uploadToCloudinary(file.buffer, {
                resource_type: resourceType,
                folder: `file-sharing/${userId}`,
                public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
            });

            // Generate short URL
            const shortUrl = shortid.generate();

            // Create file record
            const newFile = new File({
                path: result.secure_url,
                name: file.originalname,
                type: file.mimetype,
                size: file.size,
                shortUrl,
                createdBy: userId,
                hasExpiry: false,
                expiresAt: null,
                isPasswordProtected: false,
                password: null,
                status: "active",
            });

            await newFile.save();
            uploadedFiles.push(newFile);

            // Update user stats
            const user = await User.findById(userId);
            if (user) {
                user.totalUploads += 1;
                if (fileCategory === "image") user.imageCounts += 1;
                else if (fileCategory === "video") user.videoCounts += 1;
                else user.documentCounts += 1;
                await user.save();
            }
        }

        res.status(201).json({
            message: "Files uploaded successfully",
            files: uploadedFiles,
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Error uploading files", error: error.message });
    }
};

// Download file
const downloadFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        if (file.status !== "active") {
            return res.status(403).json({ message: "File is not available" });
        }

        if (file.hasExpiry && file.expiresAt && new Date() > file.expiresAt) {
            file.status = "inactive";
            await file.save();
            return res.status(403).json({ message: "File has expired" });
        }

        // Increment download count
        file.downloadContent += 1;
        await file.save();

        // Update user download count
        const user = await User.findById(file.createdBy);
        if (user) {
            user.totalDownloads += 1;
            await user.save();
        }

        res.status(200).json({
            message: "File retrieved successfully",
            file: {
                url: file.path,
                name: file.name,
                type: file.type,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Error downloading file", error: error.message });
    }
};

// Delete file
const deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.user.id;

        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        if (file.createdBy.toString() !== userId && req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized to delete this file" });
        }

        // Delete from cloudinary
        const publicId = file.path.split("/").slice(-2).join("/").split(".")[0];
        const resourceType = getFileCategory(file.type);
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType === "image" || resourceType === "video" ? resourceType : "raw" });

        await File.findByIdAndDelete(fileId);

        res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting file", error: error.message });
    }
};

// Update file status
const updateFileStatus = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        if (!["active", "inactive", "deleted"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        if (file.createdBy.toString() !== userId && req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized to update this file" });
        }

        file.status = status;
        await file.save();

        res.status(200).json({ message: "File status updated", file });
    } catch (error) {
        res.status(500).json({ message: "Error updating file status", error: error.message });
    }
};

// Update file expiry
const updateFileExpiry = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { hasExpiry, expiresAt } = req.body;
        const userId = req.user.id;

        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        if (file.createdBy.toString() !== userId && req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized to update this file" });
        }

        file.hasExpiry = hasExpiry;
        file.expiresAt = hasExpiry ? new Date(expiresAt) : null;
        await file.save();

        res.status(200).json({ message: "File expiry updated", file });
    } catch (error) {
        res.status(500).json({ message: "Error updating file expiry", error: error.message });
    }
};

// Update file password
const updateFilePassword = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { isPasswordProtected, password } = req.body;
        const userId = req.user.id;

        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        if (file.createdBy.toString() !== userId && req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized to update this file" });
        }

        file.isPasswordProtected = isPasswordProtected;
        if (isPasswordProtected && password) {
            file.password = await bcrypt.hash(password, 10);
        } else {
            file.password = null;
        }
        await file.save();

        res.status(200).json({ message: "File password updated", file });
    } catch (error) {
        res.status(500).json({ message: "Error updating file password", error: error.message });
    }
};

// Search files
const searchFiles = async (req, res) => {
    try {
        const userId = req.user.id;
        const { query, type, status } = req.query;

        const searchFilter = { createdBy: userId };

        if (query) {
            searchFilter.name = { $regex: query, $options: "i" };
        }

        if (type) {
            searchFilter.type = { $regex: type, $options: "i" };
        }

        if (status) {
            searchFilter.status = status;
        }

        const files = await File.find(searchFilter).sort({ createdAt: -1 });

        res.status(200).json({ files });
    } catch (error) {
        res.status(500).json({ message: "Error searching files", error: error.message });
    }
};

// Show user files (with pagination)
const showUserFiles = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, sortBy = "createdAt", order = "desc" } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOrder = order === "asc" ? 1 : -1;

        const files = await File.find({ createdBy: userId })
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await File.countDocuments({ createdBy: userId });

        res.status(200).json({
            files,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalFiles: total,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching files", error: error.message });
    }
};

// Get file details
const getFileDetails = async (req, res) => {
    try {
        const { fileId } = req.params;

        const file = await File.findById(fileId).populate("createdBy", "fullname username email profilePic");

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        res.status(200).json({ file });
    } catch (error) {
        res.status(500).json({ message: "Error fetching file details", error: error.message });
    }
};

// Generate share shortened link
const generateShareShortenLink = async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.user.id;

        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        if (file.createdBy.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Generate new short URL if needed
        if (!file.shortUrl) {
            file.shortUrl = shortid.generate();
            await file.save();
        }

        const shareLink = `${req.protocol}://${req.get("host")}/api/files/share/${file.shortUrl}`;

        res.status(200).json({
            message: "Share link generated",
            shortUrl: file.shortUrl,
            shareLink,
        });
    } catch (error) {
        res.status(500).json({ message: "Error generating share link", error: error.message });
    }
};

// Send link via email
const sendLinkEmail = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { recipientEmail, message } = req.body;
        console.log("req.user:", req.user);
        console.log("userId:", req.user?.id);
        console.log("fileId:", fileId);

        const userId = req.user.id;

        if (!recipientEmail) {
            return res.status(400).json({ message: "Recipient email is required" });
        }

        const file = await File.findById(fileId);
        console.log("file:", file);
        console.log("file.createdBy:", file?.createdBy);
        console.log("file.userId:", file?.userId);
        console.log("file.user:", file?.user);
        console.log("=== DEBUG END ===");

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        if (file.createdBy.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const shareLink = `${req.protocol}://${req.get("host")}/api/files/share/${file.shortUrl}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: `File shared with you: ${file.name}`,
            html: `
                <h2>A file has been shared with you</h2>
                <p><strong>File:</strong> ${file.name}</p>
                <p><strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
                ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
                <p><a href="${shareLink}">Click here to download</a></p>
                ${file.isPasswordProtected ? "<p><em>Note: This file is password protected</em></p>" : ""}
            `,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error sending email", error: error.message });
    }
};

// Generate QR code
const generateQR = async (req, res) => {
    try {
        const { fileId } = req.params;

        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        const shareLink = `${req.protocol}://${req.get("host")}/api/files/share/${file.shortUrl}`;

        const qrCode = await QRCode.toDataURL(shareLink);

        res.status(200).json({
            message: "QR code generated",
            qrCode,
            shareLink,
        });
    } catch (error) {
        res.status(500).json({ message: "Error generating QR code", error: error.message });
    }
};

// Get download count
const getDownloadCount = async (req, res) => {
    try {
        const { fileId } = req.params;

        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        res.status(200).json({
            fileId: file._id,
            fileName: file.name,
            downloadCount: file.downloadContent,
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching download count", error: error.message });
    }
};

// Resolve share link
const resolveShareLink = async (req, res) => {
    try {
        const { shortUrl } = req.params;

        const file = await File.findOne({ shortUrl });

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        if (file.status !== "active") {
            return res.status(403).json({ message: "File is not available" });
        }

        if (file.hasExpiry && file.expiresAt && new Date() > file.expiresAt) {
            file.status = "inactive";
            await file.save();
            return res.status(403).json({ message: "File has expired" });
        }

        res.status(200).json({
            file: {
                id: file._id,
                name: file.name,
                type: file.type,
                size: file.size,
                isPasswordProtected: file.isPasswordProtected,
                hasExpiry: file.hasExpiry,
                expiresAt: file.expiresAt,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Error resolving share link", error: error.message });
    }
};

// Verify file password
const verifyFilePassword = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { password } = req.body;

        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        if (!file.isPasswordProtected) {
            return res.status(400).json({ message: "File is not password protected" });
        }

        const isMatch = await bcrypt.compare(password, file.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        res.status(200).json({
            message: "Password verified",
            file: {
                url: file.path,
                name: file.name,
                type: file.type,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Error verifying password", error: error.message });
    }
};

// Get user files (simplified)
const getUserFiles = async (req, res) => {
    try {
        const userId = req.user.id;

        const files = await File.find({ createdBy: userId }).sort({ createdAt: -1 });

        res.status(200).json({ files });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user files", error: error.message });
    }
};

// Update all file expiry
const updateAllFileExpiry = async (req, res) => {
    try {
        const userId = req.user.id;
        const { hasExpiry, expiresAt } = req.body;

        const result = await File.updateMany(
            { createdBy: userId },
            {
                hasExpiry,
                expiresAt: hasExpiry ? new Date(expiresAt) : null,
            }
        );

        res.status(200).json({
            message: "All files expiry updated",
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating files expiry", error: error.message });
    }
};

// Get download info
const downloadInfo = async (req, res) => {
    try {
        const { fileId } = req.params;

        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        res.status(200).json({
            file: {
                id: file._id,
                name: file.name,
                type: file.type,
                size: file.size,
                downloadCount: file.downloadContent,
                isPasswordProtected: file.isPasswordProtected,
                hasExpiry: file.hasExpiry,
                expiresAt: file.expiresAt,
                status: file.status,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching download info", error: error.message });
    }
};



// Upload files for guest users
const uploadFilesGuest = async (req, res) => {
    try {
        const files = req.files;
        const guestId = req.ip || "anonymous";

        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const uploadedFiles = [];

        for (const file of files) {
            const fileCategory = getFileCategory(file.mimetype);
            const resourceType = fileCategory === "image" || fileCategory === "video" ? fileCategory : "raw";

            // Upload to cloudinary
            const result = await uploadToCloudinary(file.buffer, {
                resource_type: resourceType,
                folder: `file-sharing/guest`,
                public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
            });

            // Generate short URL
            const shortUrl = shortid.generate();

            // Set default expiry of 24 hours for guest files
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);

            // Create guest file record
            const newFile = new GuestFile({
                path: result.secure_url,
                name: file.originalname,
                type: file.mimetype,
                size: file.size,
                shortUrl,
                createdBy: guestId,
                hasExpiry: true,
                expiresAt,
                isPasswordProtected: false,
                password: null,
                status: "active",
            });

            await newFile.save();
            uploadedFiles.push(newFile);
        }

        res.status(201).json({
            message: "Files uploaded successfully",
            files: uploadedFiles,
        });
    } catch (error) {
        console.error("Guest upload error:", error);
        res.status(500).json({ message: "Error uploading files", error: error.message });
    }
};

// Get guest download info
const guestDownloadInfo = async (req, res) => {
    try {
        const { shortUrl } = req.params;

        const file = await GuestFile.findOne({ shortUrl });

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        if (file.status !== "active") {
            return res.status(403).json({ message: "File is not available" });
        }

        if (file.hasExpiry && file.expiresAt && new Date() > file.expiresAt) {
            file.status = "expired";
            await file.save();
            return res.status(403).json({ message: "File has expired" });
        }

        res.status(200).json({
            file: {
                id: file._id,
                name: file.name,
                type: file.type,
                size: file.size,
                downloadCount: file.downloadedContent,
                isPasswordProtected: file.isPasswordProtected,
                hasExpiry: file.hasExpiry,
                expiresAt: file.expiresAt,
                status: file.status,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching download info", error: error.message });
    }
};

// Verify guest file password
const verifyGuestFilePassword = async (req, res) => {
    try {
        const { shortUrl } = req.params;
        const { password } = req.body;

        const file = await GuestFile.findOne({ shortUrl });

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        if (!file.isPasswordProtected) {
            return res.status(400).json({ message: "File is not password protected" });
        }

        const isMatch = await bcrypt.compare(password, file.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Increment download count
        file.downloadedContent += 1;
        await file.save();

        res.status(200).json({
            message: "Password verified",
            file: {
                url: file.path,
                name: file.name,
                type: file.type,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Error verifying password", error: error.message });
    }
};

export {
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
};
