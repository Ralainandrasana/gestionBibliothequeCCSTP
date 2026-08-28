const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const multer = require('multer');

const uploadDirectory = path.resolve(
    process.env.UPLOAD_DIR || 'C:/xampp/htdocs/Bibliofianar/uploads/files'
);
const maximumFileSize = (Number(process.env.UPLOAD_MAX_SIZE_MB) || 3) * 1024 * 1024;
const extensionsByMimeType = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp'
};

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDirectory),
    filename: (_req, file, callback) => {
        callback(null, `${randomUUID()}${extensionsByMimeType[file.mimetype]}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: maximumFileSize,
        files: 1
    },
    fileFilter: (_req, file, callback) => {
        if (!extensionsByMimeType[file.mimetype]) {
            const error = new Error('Seules les images JPG, PNG et WebP sont autorisees.');
            error.code = 'UNSUPPORTED_IMAGE_TYPE';
            callback(error);
            return;
        }

        callback(null, true);
    }
});

module.exports = upload;
