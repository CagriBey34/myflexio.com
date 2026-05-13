/**
 * Uzman Review Routes
 * Routes for review submission and management
 */

import express from 'express';
import {
    createReview,
    getUzmanReviews,
    updateReview,
    deleteReview,
    getMyReviews
} from '../controllers/reviewController.js';
import { authenticate } from '../../../core/auth/middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/uzman/:id/reviews
 * @desc    Get uzman reviews
 * @access  Public
 */
router.get('/:id/reviews', getUzmanReviews);

/**
 * @route   POST /api/uzman/:id/review
 * @desc    Create review for uzman
 * @access  Private (hasta only)
 */
router.post('/:id/review', authenticate, createReview);

/**
 * @route   PUT /api/uzman/:id/review
 * @desc    Update own review
 * @access  Private (hasta only)
 */
router.put('/:id/review', authenticate, updateReview);

/**
 * @route   DELETE /api/uzman/:id/review
 * @desc    Delete own review
 * @access  Private (hasta only)
 */
router.delete('/:id/review', authenticate, deleteReview);

/**
 * @route   GET /api/hasta/my-reviews
 * @desc    Get hasta's own reviews
 * @access  Private (hasta only)
 */
router.get('/my-reviews', authenticate, getMyReviews);

export default router;
