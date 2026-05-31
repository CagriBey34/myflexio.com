import multer from 'multer';
import path from 'path'; // artık bu da gerekmiyor, silebilirsin
import fs from 'fs';
import { generateUniqueFilename, ALLOWED_FILE_TYPES, FILE_SIZE_LIMITS } from '../utils/fileUtils.js';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';

        if (file.fieldname === 'diploma') {
            uploadPath += 'diplomas/';
        } else if (file.fieldname === 'sertifika') {
            uploadPath += 'sertifikalar/';
        } else if (file.fieldname === 'profilFotograf') {
            uploadPath += 'profil-fotograflar/';
        } else if (file.fieldname === 'medicalReport') {
            uploadPath += 'medical-reports/';
        } else if (file.fieldname === 'kapakGorseli') {
            uploadPath += 'article-covers/';
        } else if (file.fieldname === 'dekont') {
            uploadPath += 'dekontlar/';
        }

        // Klasör yoksa oluştur
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueFilename = generateUniqueFilename(file.originalname);
        cb(null, uniqueFilename);
    }
});

/**
 * File filter to validate file types
 */
const fileFilter = (req, file, cb) => {
    const fieldAllowedTypes = {
        diploma: ALLOWED_FILE_TYPES.imageOrDocument,
        sertifika: ALLOWED_FILE_TYPES.imageOrDocument,
        profilFotograf: ALLOWED_FILE_TYPES.image,
        medicalReport: ALLOWED_FILE_TYPES.imageOrDocument
    };

    const allowedTypes = fieldAllowedTypes[file.fieldname] || ALLOWED_FILE_TYPES.imageOrDocument;

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type for ${file.fieldname}. Allowed: ${allowedTypes.join(', ')}`), false);
    }
};

/**
 * Multer upload instance
 */
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: FILE_SIZE_LIMITS.document // Max 10MB
    }
});

/**
 * Upload middleware for single file
 */
export const uploadSingle = (fieldName) => upload.single(fieldName);

/**
 * Upload middleware for multiple files
 */
export const uploadMultiple = (fieldName, maxCount = 10) => upload.array(fieldName, maxCount);

/**
 * Upload middleware for multiple fields
 */
export const uploadFields = (fields) => upload.fields(fields);

/**
 * Error handler for multer errors
 */
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 10MB'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};
