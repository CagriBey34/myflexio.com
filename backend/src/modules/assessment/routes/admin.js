/**
 * Assessment Admin Routes
 * API endpoints for admin question management
 */

import express from 'express';
import {
    createQuestion,
    getQuestions,
    getQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions
} from '../controllers/adminController.js';
import { authenticate } from '../../../core/auth/middleware/auth.js';
import { isAdmin } from '../../../modules/admin/middleware/auth.js';
import { validateQuestion } from '../middleware/validation.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, isAdmin);

/**
 * @route   POST /api/assessment/admin/questions
 * @desc    Create new assessment question
 * @access  Private (admin only)
 */
router.post('/questions', validateQuestion, createQuestion);

/**
 * @route   GET /api/assessment/admin/questions
 * @desc    Get all assessment questions
 * @access  Private (admin only)
 */
router.get('/questions', getQuestions);

/**
 * @route   GET /api/assessment/admin/questions/:id
 * @desc    Get single assessment question
 * @access  Private (admin only)
 */
router.get('/questions/:id', getQuestion);

/**
 * @route   PUT /api/assessment/admin/questions/:id
 * @desc    Update assessment question
 * @access  Private (admin only)
 */
router.put('/questions/:id', validateQuestion, updateQuestion);

/**
 * @route   DELETE /api/assessment/admin/questions/:id
 * @desc    Delete assessment question
 * @access  Private (admin only)
 */
router.delete('/questions/:id', deleteQuestion);

/**
 * @route   PUT /api/assessment/admin/questions/reorder
 * @desc    Reorder questions
 * @access  Private (admin only)
 */
router.put('/questions/reorder', reorderQuestions);

export default router;
