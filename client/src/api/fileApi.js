import API from './axios';

// Upload files
export const uploadFiles = async (files, onUploadProgress) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const res = await API.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress
    });
    return res.data;
};

// Get all user files
export const getUserFiles = async () => {
    const res = await API.get('/files/user-files');
    return res.data;
};

// Get files with pagination
export const getMyFiles = async (page = 1, limit = 10, sortBy = 'createdAt', order = 'desc') => {
    const res = await API.get('/files/my-files', {
        params: { page, limit, sortBy, order }
    });
    return res.data;
};

// Search files
export const searchFiles = async (query, type, status) => {
    const res = await API.get('/files/search', {
        params: { query, type, status }
    });
    return res.data;
};

// Get file details
export const getFileDetails = async (fileId) => {
    const res = await API.get(`/files/details/${fileId}`);
    return res.data;
};

// Get download info
export const getDownloadInfo = async (fileId) => {
    const res = await API.get(`/files/download-info/${fileId}`);
    return res.data;
};

// Download file
export const downloadFile = async (fileId) => {
    const res = await API.get(`/files/download/${fileId}`);
    return res.data;
};

// Delete file
export const deleteFile = async (fileId) => {
    const res = await API.delete(`/files/delete/${fileId}`);
    return res.data;
};

// Update file status
export const updateFileStatus = async (fileId, status) => {
    const res = await API.patch(`/files/status/${fileId}`, { status });
    return res.data;
};

// Update file expiry
export const updateFileExpiry = async (fileId, hasExpiry, expiresAt) => {
    const res = await API.patch(`/files/expiry/${fileId}`, { hasExpiry, expiresAt });
    return res.data;
};

// Set file password
export const updateFilePassword = async (fileId, isPasswordProtected, password) => {
    const res = await API.patch(`/files/password/${fileId}`, { isPasswordProtected, password });
    return res.data;
};

// Get share link
export const getShareLink = async (fileId) => {
    const res = await API.get(`/files/share-link/${fileId}`);
    return res.data;
};

// Send file via email
export const sendFileEmail = async (fileId, recipientEmail, message) => {
    const res = await API.post(`/files/send-email/${fileId}`, { recipientEmail, message });
    return res.data;
};

// Generate QR code
export const generateQRCode = async (fileId) => {
    const res = await API.get(`/files/qr/${fileId}`);
    return res.data;
};

// Verify file password
export const verifyFilePassword = async (fileId, password) => {
    const res = await API.post(`/files/verify-password/${fileId}`, { password });
    return res.data;
};

// Get download count
export const getDownloadCount = async (fileId) => {
    const res = await API.get(`/files/download-count/${fileId}`);
    return res.data;
};

// === PUBLIC/GUEST ROUTES ===

// Access shared file (public)
export const getSharedFile = async (shortUrl) => {
    const res = await API.get(`/files/share/${shortUrl}`);
    return res.data;
};

// Guest upload
export const guestUpload = async (files, onUploadProgress) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const res = await API.post('/files/guest/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress
    });
    return res.data;
};

// Guest download info
export const getGuestDownloadInfo = async (shortUrl) => {
    const res = await API.get(`/files/guest/download-info/${shortUrl}`);
    return res.data;
};

// Guest verify password
export const guestVerifyPassword = async (shortUrl, password) => {
    const res = await API.post(`/files/guest/verify-password/${shortUrl}`, { password });
    return res.data;
};
