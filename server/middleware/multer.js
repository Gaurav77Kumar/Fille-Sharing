import multer from 'multer';

const storage = multer.memoryStorage();

const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',

];

const fileFilter = (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Allowed types: JPEG, PNG, GIF, MP3, WAV, OGG, MP4, WEBM, OGG'), false);
    }
};

export const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024,
        files: 10
    },
    fileFilter,
});