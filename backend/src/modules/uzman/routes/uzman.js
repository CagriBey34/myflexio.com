/**
 * Uzman Routes
 * API endpoints for uzman registration and profile management
 */

import express from 'express';
import { registerUzman, completeProfile, getProfile, getUzmanRandevular, setKesinTarih, createTedaviPlani, updateIban, getUzmanTedaviPlanlari, uzmanSeansVer, getUzmanEslesmeler, getEslesmeSeanslariUzman, setSeansTargihi, uzmanSeansOnay, getHastaRaporlari } from '../controllers/uzmanController.js';
import {
    getUzmanArticles,
    getUzmanArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    updateArticleStatus
} from '../../articles/controllers/articleController.js';
import { getUzmanOwnReviews } from '../controllers/searchController.js';
import { authenticate } from '../../../core/auth/middleware/auth.js';
import { uploadSingle, uploadFields, handleUploadError } from '../../../core/upload/middleware/upload.js';
import { validateUzmanRegistration, validateProfileCompletion, checkUzmanApproval } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /api/uzman/register
 * @desc    Register new uzman with diploma
 * @access  Public
 */
router.post(
    '/register',
    uploadSingle('diploma'),
    handleUploadError,
    validateUzmanRegistration,
    registerUzman
);

/**
 * @route   POST /api/uzman/profile/complete
 * @desc    Complete uzman profile after approval
 * @access  Private (uzman only, approved)
 */
router.post(
    '/profile/complete',
    authenticate,
    checkUzmanApproval,
    uploadFields([
        { name: 'profilFotograf', maxCount: 1 },
        { name: 'sertifika', maxCount: 10 }
    ]),
    handleUploadError,
    validateProfileCompletion,
    completeProfile
);

/**
 * @route   GET /api/uzman/profile
 * @desc    Get uzman profile
 * @access  Private (uzman only)
 */
router.get('/profile', authenticate, getProfile);

// Article routes
router.get('/articles', authenticate, getUzmanArticles);
router.get('/articles/:id', authenticate, getUzmanArticleById);
router.post('/articles', authenticate, uploadSingle('kapakGorseli'), handleUploadError, createArticle);
router.put('/articles/:id', authenticate, uploadSingle('kapakGorseli'), handleUploadError, updateArticle);
router.delete('/articles/:id', authenticate, deleteArticle);
router.patch('/articles/:id/status', authenticate, updateArticleStatus);

// Reviews route
router.get('/reviews', authenticate, getUzmanOwnReviews);

// Randevu routes
router.get('/randevular', authenticate, getUzmanRandevular);
router.patch('/randevular/:id/kesin-tarih', authenticate, setKesinTarih);
router.patch('/randevular/:id/seans-ver', authenticate, uzmanSeansVer);
router.get('/hasta/:hastaProfileId/raporlar', authenticate, getHastaRaporlari);

// Tedavi planı routes
router.post('/tedavi-plani', authenticate, createTedaviPlani);
router.get('/tedavi-planlari', authenticate, getUzmanTedaviPlanlari);
router.patch('/profile/iban', authenticate, updateIban);

// Eşleşme & seans routes
router.get('/eslesmeler', authenticate, getUzmanEslesmeler);
router.get('/eslesmeler/:planId/seanslar', authenticate, getEslesmeSeanslariUzman);
router.patch('/seanslar/:seansId/tarih', authenticate, setSeansTargihi);
router.patch('/seanslar/:seansId/seans-ver', authenticate, uzmanSeansOnay);

export default router;
