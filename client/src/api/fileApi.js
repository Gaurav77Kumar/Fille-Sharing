import API from './axios';

export const uploadFiles = async (files, onUploadProgress) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const res = await API.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
  return res.data;
};

// Get files with pagination
export const getMyFiles = async (page = 1, limit = 10, sortBy = 'createdAt', order = 'desc') => {
  const res = await API.get('/files/my-files', {
    params: { page, limit, sortBy, order },
  });
  return res.data;
};

export const searchFiles = async (query, type, status) => {
  const res = await API.get('/files/search', {
    params: { query, type, status },
  });
  return res.data;
};

export const getFileDetails = async (fileId) => {
  const res = await API.get(`/files/details/${fileId}`);
  return res.data;
};

export const getDownloadInfo = async (fileId) => {
  const res = await API.get(`/files/download-info/${fileId}`);
  return res.data;
};

export const downloadFile = async (fileId) => {
  const res = await API.get(`/files/download/${fileId}`);
  return res.data;
};

// Delete file (soft delete — server sets deletedAt + decrements storageUsed)
export const deleteFile = async (fileId) => {
  const res = await API.delete(`/files/delete/${fileId}`);
  return res.data;
};

export const updateFileStatus = async (fileId, status) => {
  const res = await API.patch(`/files/status/${fileId}`, { status });
  return res.data;
};

export const updateFileExpiry = async (fileId, { expiresAt }) => {
  const res = await API.patch(`/files/expiry/${fileId}`, { expiresAt });
  return res.data;
};

export const updateFilePassword = async (fileId, isPasswordProtected, password) => {
  const res = await API.patch(`/files/password/${fileId}`, { isPasswordProtected, password });
  return res.data;
};

export const getShareLink = async (fileId) => {
  const res = await API.get(`/files/share-link/${fileId}`);
  return res.data;
};

// Send file via email — server queues this with BullMQ, returns immediately
export const sendFileEmail = async (fileId, recipientEmail, message) => {
  const res = await API.post(`/files/send-email/${fileId}`, { recipientEmail, message });
  return res.data;
};

// Generate QR code
export const generateQRCode = async (fileId) => {
  const res = await API.get(`/files/qr/${fileId}`);
  return res.data;
};

// Verify file password (rate-limited on the server — 10 attempts / 15 min)
export const verifyFilePassword = async (fileId, password) => {
  const res = await API.post(`/files/verify-password/${fileId}`, { password });
  return res.data;
};

export const getDownloadCount = async (fileId) => {
  const res = await API.get(`/files/download-count/${fileId}`);
  return res.data;
};

export const getSharedFile = async (slug) => {
  const res = await API.get(`/files/share/${slug}`);
  return res.data;
};

// Guest upload (no auth — IP-based rate limiting on server: 3/day, 25MB/file)
export const guestUpload = async (files, onUploadProgress) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const res = await API.post('/files/guest/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
  return res.data;
};

export const getGuestDownloadInfo = async (slug) => {
  const res = await API.get(`/files/guest/download-info/${slug}`);
  return res.data;
};

export const guestVerifyPassword = async (slug, password) => {
  const res = await API.post(`/files/guest/verify-password/${slug}`, { password });
  return res.data;
};