/**
 * Assessment Hasta Routes
 * API endpoints for patient assessment
 */

import express from 'express';
import {
    getActiveQuestions,
    submitAssessment,
    getMyAssessments,
    getLatestAssessment
} from '../controllers/hastaController.js';
import { authenticate } from '../../../core/auth/middleware/auth.js';
import { validateAssessmentSubmission } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/assessment/questions
 * @desc    Get active assessment questions
 * @access  Private (hasta)
 */
router.get('/questions', getActiveQuestions);

/**
 * @route   POST /api/assessment/submit
 * @desc    Submit assessment responses
 * @access  Private (hasta)
 */
router.post('/submit', validateAssessmentSubmission, submitAssessment);

/**
 * @route   GET /api/assessment/my-assessments
 * @desc    Get patient's assessment history
 * @access  Private (hasta)
 */
router.get('/my-assessments', getMyAssessments);

/**
 * @route   GET /api/assessment/latest
 * @desc    Get latest assessment
 * @access  Private (hasta)
 */
router.get('/latest', getLatestAssessment);

export default router;
