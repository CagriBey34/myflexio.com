/**
 * File Upload Utilities
 * Helper functions for file handling
 */

import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

/**
 * Generate unique filename
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename with UUID
 */
export const generateUniqueFilename = (originalName) => {
    const ext = path.extname(originalName);
    const uuid = uuidv4();
    return `${uuid}${ext}`;
};

/**
 * Validate file type
 * @param {string} mimetype - File mimetype
 * @param {string[]} allowedTypes - Allowed mimetypes
 * @returns {boolean} True if valid
 */
export const isValidFileType = (mimetype, allowedTypes) => {
    return allowedTypes.includes(mimetype);
};

/**
 * Delete file from filesystem
 * @param {string} filePath - Path to file
 */
export const deleteFile = async (filePath) => {
    try {
        await fs.unlink(filePath);
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

/**
 * Get file extension from mimetype
 * @param {string} mimetype - File mimetype
 * @returns {string} File extension
 */
export const getExtensionFromMimetype = (mimetype) => {
    const mimetypeMap = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'application/pdf': '.pdf'
    };
    return mimetypeMap[mimetype] || '';
};

/**
 * Allowed file types for different upload categories
 */
export const ALLOWED_FILE_TYPES = {
    image: ['image/jpeg', 'image/jpg', 'image/png'],
    document: ['application/pdf'],
    imageOrDocument: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
};

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
    image: 5 * 1024 * 1024, // 5MB
    document: 10 * 1024 * 1024 // 10MB
};
