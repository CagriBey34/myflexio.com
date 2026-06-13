/**
 * Hasta Routes
 * API endpoints for hasta registration and profile management
 */

import express from 'express';
import {
    registerHasta,
    completeProfile,
    getProfile,
    uploadMedicalReport,
    getMedicalReports,
    deleteMedicalReport,
    createAssessment,
    getAssessments,
    getAssessment,
    getAssessmentRecommendations,
    createRandevu,
    getHastaRandevular,
    hastaRandevuKarar,
    hastaSeansAl,
    getHastaTedaviPlani,
    uploadDekont,
    getHastaSeanslari,
    hastaSeansOnay
} from '../controllers/hastaController.js';
import {
    searchUzmanlar,
    createReview,
    updateReview,
    deleteReview
} from '../../uzman/controllers/searchController.js';
import { getUzmanProfile } from '../../uzman/controllers/searchController.js';
import { authenticate } from '../../../core/auth/middleware/auth.js';
import { uploadSingle, handleUploadError } from '../../../core/upload/middleware/upload.js';
import { validateHastaRegistration, validateProfileCompletion } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /api/hasta/register
 * @desc    Register new hasta
 * @access  Public
 */
router.post('/register', validateHastaRegistration, registerHasta);

/**
 * @route   POST /api/hasta/profile/complete
 * @desc    Complete hasta profile
 * @access  Private (hasta only)
 */
router.post(
    '/profile/complete',
    authenticate,
    validateProfileCompletion,
    completeProfile
);

/**
 * @route   GET /api/hasta/profile
 * @desc    Get hasta profile
 * @access  Private (hasta only)
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   POST /api/hasta/reports
 * @desc    Upload medical report
 * @access  Private (hasta only)
 */
router.post(
    '/reports',
    authenticate,
    uploadSingle('medicalReport'),
    handleUploadError,
    uploadMedicalReport
);

/**
 * @route   GET /api/hasta/reports
 * @desc    Get medical reports
 * @access  Private (hasta only)
 */
router.get('/reports', authenticate, getMedicalReports);
router.delete('/reports/:id', authenticate, deleteMedicalReport);

/**
 * @route   POST /api/hasta/assessment
 * @desc    Create new assessment
 * @access  Private (hasta only)
 */
router.post('/assessment', authenticate, createAssessment);

/**
 * @route   GET /api/hasta/assessments
 * @desc    Get all assessments
 * @access  Private (hasta only)
 */
router.get('/assessments', authenticate, getAssessments);

/**
 * @route   GET /api/hasta/assessment/:id
 * @desc    Get single assessment
 * @access  Private (hasta only)
 */
router.get('/assessment/:id', authenticate, getAssessment);

/**
 * @route   GET /api/hasta/assessment/:id/recommendations
 * @desc    Get recommended uzmanlar based on assessment result
 * @access  Private (hasta only)
 */
router.get('/assessment/:id/recommendations', authenticate, getAssessmentRecommendations);


/**
 * @route   GET /api/hasta/uzmanlar
 * @desc    Search uzmanlar with filters
 * @access  Private (hasta only)
 */
router.get('/uzmanlar', authenticate, searchUzmanlar);

/**
 * @route   GET /api/uzman/:id/profile
 * @desc    Get uzman profile with reviews
 * @access  Private (hasta only)
 */
router.get('/uzman/:id/profile', authenticate, getUzmanProfile);

/**
 * @route   POST /api/hasta/reviews
 * @desc    Create review
 * @access  Private (hasta only)
 */
router.post('/reviews', authenticate, createReview);

/**
 * @route   PUT /api/hasta/reviews/:id
 * @desc    Update review
 * @access  Private (hasta only)
 */
router.put('/reviews/:id', authenticate, updateReview);

/**
 * @route   DELETE /api/hasta/reviews/:id
 * @desc    Delete review
 * @access  Private (hasta only)
 */
router.delete('/reviews/:id', authenticate, deleteReview);

router.post('/randevu', authenticate, createRandevu);
router.get('/randevular', authenticate, getHastaRandevular);
router.patch('/randevu/:id/karar', authenticate, hastaRandevuKarar);
router.patch('/randevu/:id/seans-al', authenticate, hastaSeansAl);

// Tedavi planı routes
router.get('/tedavi-plani', authenticate, getHastaTedaviPlani);
router.post('/tedavi-plani/:id/dekont', authenticate, uploadSingle('dekont'), handleUploadError, uploadDekont);

// Seans routes
router.get('/seanslar', authenticate, getHastaSeanslari);
router.patch('/seanslar/:seansId/seans-al', authenticate, hastaSeansOnay);

export default router;
