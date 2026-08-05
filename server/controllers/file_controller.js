import  File  from "../models/file.js";
import { GuestFile } from "../models/guestFile.js";
import shortid from 'shortid';
import User from "../models/user.js";
import cloudinary from "../config/cloudinary.js";
import { nanoid } from "nanoid";
import crypto from "crypto";
import QRCode from "qrcode";
import { emailQueue } from "../Queues/EmailQueue.js";

const computeHash = (buffer) => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    stream.end(buffer);
  });
};

const getResourceType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("audio/")) return "audio";
  return "raw";
};

const generateSlug = async (Model) => {
  let slug, exists;
  do {
    slug = nanoid(8);
    exists = await Model.findOne({ slug }).select("_id");
  } while (exists);
  return slug;
};


const uploadFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const batchSize = files.reduce((sum, f) => sum + Number(f.size), 0);
    const remainingQuota = user.storageLimit - user.storageUsed;

    if (batchSize > remainingQuota) {
      return res.status(400).json({
        message: "Storage quota exceeded",
        storageUsed: user.storageUsed,
        storageQuota: user.storageLimit,
        needed: batchSize,
        available: remainingQuota,
      });
    }

    const uploadedFiles = [];
    let totalBytesAdded = 0;

    for (const file of files) {
      // Step 1: Compute SHA-256 hash of the file content
      // identical content = identical hash
      const hash = computeHash(file.buffer);

      // Step 2: Deduplication check: same user uploading same file again Re use the cloudinary asset
      const existing = await File.findOne({
        hash,
        CreatedBy: userId,
        deletedAt: null,
      });

      if (existing) {
        // Duplicate found, reuse the existing file record
        uploadedFiles.push({ ...existing.toObject(), deduplicated: true });
        continue;
      }

      // Step 3: Upload to cloudinary and create new files record
      const resourceType = getResourceType(file.mimetype);
      const result = await uploadToCloudinary(file.buffer, {
        resource_type: resourceType,
        folder: `file-sharing/${userId}`,
        public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "").replace(/\s/g, '_')}`

      });

      // Step 4: Generate collision safe slug for the share URL
      const slug = await generateSlug(File);

      // Step 5: Save the file record with correct fiels names from updated model
      const newFile = await File.create({
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        cloudinaryUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
        hash,
        slug,
        CreatedBy: userId,
        isPublic: true,
      });

      uploadedFiles.push(newFile);
      totalBytesAdded += Number(file.size);
    }

    // Step 6: Atomically update storageUsed
    if (totalBytesAdded > 0 && typeof totalBytesAdded === "number") {

      await User.findByIdAndUpdate(userId, {
        $inc: { storageUsed: totalBytesAdded },
      });
    }

    res.status(201).json({
      message: "Files uploaded successfully",
      count: uploadedFiles.length,
      files: uploadedFiles,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error uploading files", error: error.message });
  }
};


const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);

    if (!file || file.deletedAt) {
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

    if (file.isPasswordProtected) {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ message: "Password is required to download this file" });
      }
      const valid = await file.verifyPassword(password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid password" });
      }
    }

    // Atomic increment - $inc prevent race conditon
    await File.findByIdAndUpdate(fileId, { $inc: { downloadCount: 1 } });

    res.status(200).json({
      message: "File retrieved successfully",
      file: {
        url: file.cloudinaryUrl,
        name: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        sharedUrl: file.sharedUrl,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error downloading file", error: error.message });
  }
};


const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const file = await File.findById(fileId);

    if (!file || file.deletedAt)
      return res.status(404).json({ message: "File not found" });

    if (file.CreatedBy.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to delete this file" });
    }

    await File.findByIdAndUpdate(fileId, { deletedAt: new Date() });
    const resourceType = getResourceType(file.mimeType);

    await cloudinary.uploader.destroy(file.cloudinaryPublicId, {
      resource_type: resourceType,
    });

    await User.findByIdAndUpdate(userId, { $inc: { storageUsed: -file.size } });

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting file", error: error.message });
  }
};


const updateFileStatus = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.CreatedBy.toString() !== userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this file" });
    }

   const updatedFile =  await File.findByIdAndUpdate(fileId, { status }, { new: true });
    res.status(200).json({ message: "File status updated", file: updatedFile });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating file status", error: error.message });
  }
};


const updateFileExpiry = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { expiresAt } = req.body;
    const userId = req.user.id;

    const file = await File.findById(fileId);

    if (!file || file.deletedAt)
      return res.status(404).json({ message: "File not found" });

    if (file.CreatedBy.toString() !== userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this file" });
    }

   const updatedFile =  await File.findByIdAndUpdate(fileId, {
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    }, { new: true });
    res.status(200).json({ message: "File expiry updated", file: updatedFile });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating file expiry", error: error.message });
  }
};


const updateFilePassword = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { isPasswordProtected, password } = req.body;
    const userId = req.user.id;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    
    if(isPasswordProtected && !password) {
      return res.status(400).json({ message: "Password is required when enabling password protection" });
    }

    if (file.CreatedBy.toString() !== userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this file" });
    }

    file.isPasswordProtected = isPasswordProtected;
    file.password = isPasswordProtected ? await bcrypt.hash(password, 10) : null;

    await file.save();
    res.status(200).json({ message: "File password updated", file });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating file password", error: error.message });
  }
};


const searchFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query, type, status } = req.query;

    const filter = { CreatedBy: userId, deletedAt: null };

    if (query) filter.originalName = { $regex: query, $options: "i" };
    if (type) filter.mimeType = { $regex: type, $options: "i" };
    if (status) filter.status = status;

    const files = await File.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ files });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching files", error: error.message });
  }
};


const showUserFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { CreatedBy: userId, deletedAt: null };

    const [files, total] = await Promise.all([
      File.find(filter)
        .sort({ [sortBy]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      File.countDocuments(filter),
    ]);

    res.status(200).json({
      files,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalFiles: total,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching files", error: error.message });
  }
};


const getFileDetails = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId).populate("CreatedBy","fullname username email profilePic");

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    res.status(200).json({ file });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching file details", error: error.message });
  }
};


const generateShareShortenLink = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.CreatedBy.toString() !== userId) {
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
    res
      .status(500)
      .json({ message: "Error generating share link", error: error.message });
  }
};


const sendLinkEmail = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { recipientEmail, message } = req.body;
    const userId = req.user.id;

    if (!recipientEmail) {
      return res.status(400).json({ message: "Recipient email is required" });
    }

    const file = await File.findById(fileId);

    if (!file || file.deletedAt)
      return res.status(404).json({ message: "File not found" });
    if (file.CreatedBy.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await emailQueue.add("send-share-email", {
      to: recipientEmail,
      fileName: file.originalName,
      fileSize: file.sizeFormatted,
      shareUrl: file.shareUrl,
      message,
      isPasswordProtected: file.isPasswordProtected,
    });

    // respond immediately without waiting for email this will be done by the worker
    res.status(200).json({ message: "Share link email queued for sending" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error sending share link email",
        error: error.message,
      });
  }
};


const generateQR = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    if (!file.shortUrl) {
            file.shortUrl = nanoid(8);
            await file.save();
        }

    const shareLink = `${req.protocol}://${req.get("host")}/api/files/share/${file.shortUrl}`;
    const qrCode = await QRCode.toDataURL(shareLink);

    res.status(200).json({
      message: "QR code generated",
      qrCode,
      shareLink,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error generating QR code", error: error.message });
  }
};


const getDownloadCount = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);

    if (!file) return res.status(404).json({ message: "File not found" });

    res.status(200).json({
      fileId: file._id,
      fileName: file.originalName,
      downloadCount: file.downloadCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching download count", error: error.message });
  }
};


const resolveShareLink = async (req, res) => {
  try {
    const { slug } = req.params;
    const file = await File.findOne({ slug, deletedAt: null });

    if (!file) return res.status(404).json({ message: "File not found" });
    if (file.status !== "active")
      return res.status(403).json({ message: "File is not active" });
    if (file.isExpired())
      return res.status(403).json({ message: "File has expired" });

    res.status(200).json({
      file: {
        id: file._id,
        name: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        sizeFormatted: file.sizeFormatted,
        isPasswordProtected: file.isPasswordProtected,
        expiresAt: file.expiresAt,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error resolving share link", error: error.message });
  }
};


const verifyFilePassword = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { password } = req.body;

    const file = await File.findById(fileId).select("+password");

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (!file.isPasswordProtected) {
      return res
        .status(400)
        .json({ message: "File is not password protected" });
    }

    const valid = await file.verifyPassword(password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    await File.findByIdAndUpdate(fileId, { $inc: { downloadCount: 1 } });

    res.status(200).json({
      message: "Password verified",
      file: {
        url: file.cloudinaryUrl,
        name: file.originalName,
        mimeType: file.mimeType,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error verifying password", error: error.message });
  }
};


const getUserFiles = async (req, res) => {
  try {
    const userId = req.user.id;

    const files = await File.find({ CreatedBy: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ files });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user files", error: error.message });
  }
};


const updateAllFileExpiry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { hasExpiry, expiresAt } = req.body;

    const result = await File.updateMany(
      { CreatedBy: userId },
      {
        hasExpiry,
        expiresAt: hasExpiry ? new Date(expiresAt) : null,
      },
    );

    res.status(200).json({
      message: "All files expiry updated",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating files expiry", error: error.message });
  }
};


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
        name: file.originalName,
        type: file.mimeType,
        size: file.size,
        downloadCount: file.downloadCount,
        isPasswordProtected: file.isPasswordProtected,
        hasExpiry: file.hasExpiry,
        expiresAt: file.expiresAt,
        status: file.status,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching download info", error: error.message });
  }
};

const GUEST_MAX_UPLOADS_PER_DAY = 5;
const GUEST_MAX_FILE_SIZE = 50 * 1024 * 1024;
const GUEST_EXPIRY_HOURS = 24;


const uploadFilesGuest = async (req, res) => {
  try {
    const files = req.files;
    const ipAddress = req.ip;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Rate limit for guest users:
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await GuestFile.countDocuments({
      ipAddress,
      createdAt: { $gte: yesterday },
    });

    if (recentCount >= GUEST_MAX_UPLOADS_PER_DAY) {
      return res.status(429).json({
        message: "Guest upload limit reached. Please try again later.",
        uploadsUsed: recentCount,
        limit: GUEST_MAX_UPLOADS_PER_DAY,
      });
    }
    // File size CAP for guest user
    const oversized = files.find((f) => f.size > GUEST_MAX_FILE_SIZE);
    if (oversized) {
      return res.status(400).json({
        message: `File ${oversized.originalname} exceeds the maximum allowed size of ${GUEST_MAX_FILE_SIZE / (1024 * 1024)} MB`,
      });
    }

    const uploadedFiles = [];

    for (const file of files) {
      const hash = computeHash(file.buffer);
      const existing = await GuestFile.findOne({ hash });

      if (existing && !existing.isExpired()) {
        const slug = await generateSlug(GuestFile);

        const newFile = await GuestFile.create({
          originalName: existing.originalName,
          mimeType: existing.mimeType,
          size: existing.size,
          cloudinaryUrl: existing.cloudinaryUrl,
          cloudinaryPublicId: existing.cloudinaryPublicId,
          hash,
          slug,
          ipAddress,
          expiresAt: new Date(Date.now() + GUEST_EXPIRY_HOURS * 60 * 60 * 1000),
        });
        uploadedFiles.push(newFile);
        continue;
      }

      const resourceType = getResourceType(file.mimetype);
      const result = await uploadToCloudinary(file.buffer, {
        resource_type: resourceType,
        folder: `file-sharing/guest`,
        public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`,
      });

      const slug = await generateSlug(GuestFile);

      const newFile = await GuestFile.create({
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        cloudinaryUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
        hash: hash,
        slug,
        ipAddress,
        expiresAt: new Date(Date.now() + GUEST_EXPIRY_HOURS * 60 * 60 * 1000),
      });
      uploadedFiles.push(newFile);

    }
    res.status(201).json({
    message: "Files uploaded successfully",
    count: uploadedFiles.length,
    files: uploadedFiles,
});
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error uploading files", error: error.message });
  }
};


const guestDownloadInfo = async (req, res) => {
  try {
    const { slug } = req.params;
    const file = await GuestFile.findOne({ slug });
    if (!file) return res.status(404).json({ message: "File not found" });
    if (file.isExpired())
      return res.status(403).json({ message: "file has expired" });

    res.status(200).json({
      file: {
        id: file._id,
        name: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        sizeFormatted: file.sizeFormatted,
        minutesRemaining: file.minutesRemaining,
        isPasswordProtected: file.isPasswordProtected,
        downloadCount: file.downloadCount,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching download info", error: error.message });
  }
};


const verifyGuestFilePassword = async (req, res) => {
  try {
    const { slug } = req.params;
    const { password } = req.body;

    const file = await GuestFile.findOne({ slug }).select("+password");

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (!file.isPasswordProtected) {
      return res
        .status(400)
        .json({ message: "File is not password protected" });
    }

    const valid = await file.verifyPassword(password, file.password);

    if (!valid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    await GuestFile.findOneAndUpdate({ slug }, { $inc: { downloadCount: 1 } });

    res.status(200).json({
      message: "Password verified",
      file: {
        url: file.cloudinaryUrl,
        name: file.originalName,
        mimeType: file.mimeType,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error verifying password", error: error.message });
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
