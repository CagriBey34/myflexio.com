/**
 * Uzman Article Routes
 */

import express from 'express';
import {
    getUzmanArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    updateArticleStatus
} from '../controllers/articleController.js';
import { authenticate } from '../../../core/auth/middleware/auth.js';
import { uploadSingle } from '../../../core/upload/middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/uzman/articles
 * @desc    Get uzman's own articles
 * @access  Private (uzman only)
 */
router.get('/articles', getUzmanArticles);

/**
 * @route   POST /api/uzman/articles
 * @desc    Create new article
 * @access  Private (uzman only)
 */
router.post('/articles', uploadSingle('kapakremi'), createArticle);

/**
 * @route   PUT /api/uzman/articles/:id
 * @desc    Update article
 * @access  Private (uzman only)
 */
router.put('/articles/:id', updateArticle);

/**
 * @route   DELETE /api/uzman/articles/:id
 * @desc    Delete article
 * @access  Private (uzman only)
 */
router.delete('/articles/:id', deleteArticle);

/**
 * @route   PATCH /api/uzman/articles/:id/status
 * @desc    Update article status
 * @access  Private (uzman only)
 */
router.patch('/articles/:id/status', updateArticleStatus);

export default router;
