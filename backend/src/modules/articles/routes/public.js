/**
 * Public Article Routes
 */

import express from 'express';
import {
    getPublicArticles,
    getArticleDetail,
    getUzmanPublicArticles
} from '../controllers/articleController.js';

const router = express.Router();

/**
 * @route   GET /api/articles
 * @desc    Get all public articles
 * @access  Public
 */
router.get('/', getPublicArticles);

/**
 * @route   GET /api/articles/:id
 * @desc    Get article detail
 * @access  Public
 */
router.get('/:id', getArticleDetail);

/**
 * @route   GET /api/articles/uzman/:uzmanId
 * @desc    Get uzman's public articles
 * @access  Public
 */
router.get('/uzman/:uzmanId', getUzmanPublicArticles);

export default router;
