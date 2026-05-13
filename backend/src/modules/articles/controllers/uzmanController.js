/**
 * Uzman Article Controller
 * Handles article creation, management, and publishing for uzmanlar
 */

import pool from '../../../config/db.js';
import { deleteFile } from '../../../core/upload/utils/fileUtils.js';

/**
 * Create new article
 * POST /api/articles
 */
export const createArticle = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const uzmanUserId = req.user.id;
        const {
            baslik,
            icerik,
            ozet,
            kategori,
            etiketler,
            durum = 'taslak'
        } = req.body;

        await connection.beginTransaction();

        // Get uzman profile id
        const [uzmanProfiles] = await connection.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?',
            [uzmanUserId]
        );

        if (uzmanProfiles.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Uzman profili bulunamadı'
            });
        }

        const uzmanProfileId = uzmanProfiles[0].id;

        // Handle cover image
        const kapakGorseliUrl = req.file ? `/uploads/article-covers/${req.file.filename}` : null;

        // Parse etiketler if string
        const etiketlerJson = typeof etiketler === 'string' ? etiketler : JSON.stringify(etiketler || []);

        // Insert article
        const [result] = await connection.execute(
            `INSERT INTO uzman_articles 
       (uzman_profile_id, baslik, icerik, ozet, kapak_gorseli_url, kategori, etiketler, durum, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                uzmanProfileId,
                baslik,
                icerik,
                ozet || null,
                kapakGorseliUrl,
                kategori,
                etiketlerJson,
                durum,
                durum === 'yayinda' ? new Date() : null
            ]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Makale başarıyla oluşturuldu',
            data: {
                id: result.insertId
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Create article error:', error);
        res.status(500).json({
            success: false,
            message: 'Makale oluşturulurken bir hata oluştu'
        });
    } finally {
        connection.release();
    }
};

/**
 * Get own articles
 * GET /api/articles/my-articles
 */
export const getMyArticles = async (req, res) => {
    try {
        const uzmanUserId = req.user.id;
        const { durum, page = 1, limit = 10 } = req.query;

        // Get uzman profile id
        const [uzmanProfiles] = await pool.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?',
            [uzmanUserId]
        );

        if (uzmanProfiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Uzman profili bulunamadı'
            });
        }

        const uzmanProfileId = uzmanProfiles[0].id;

        let query = 'SELECT * FROM uzman_articles WHERE uzman_profile_id = ?';
        const params = [uzmanProfileId];

        if (durum) {
            query += ' AND durum = ?';
            params.push(durum);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        const offset = (parseInt(page) - 1) * parseInt(limit);
        params.push(parseInt(limit), offset);

        const [articles] = await pool.execute(query, params);

        // Parse etiketler
        const parsedArticles = articles.map(a => ({
            ...a,
            etiketler: a.etiketler ? JSON.parse(a.etiketler) : []
        }));

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM uzman_articles WHERE uzman_profile_id = ?';
        const countParams = [uzmanProfileId];

        if (durum) {
            countQuery += ' AND durum = ?';
            countParams.push(durum);
        }

        const [countResult] = await pool.execute(countQuery, countParams);
        const total = countResult[0].total;

        res.status(200).json({
            success: true,
            data: parsedArticles,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get my articles error:', error);
        res.status(500).json({
            success: false,
            message: 'Makaleler alınırken bir hata oluştu'
        });
    }
};

/**
 * Get single article (own)
 * GET /api/articles/:id
 */
export const getArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const uzmanUserId = req.user.id;

        // Get uzman profile id
        const [uzmanProfiles] = await pool.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?',
            [uzmanUserId]
        );

        if (uzmanProfiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Uzman profili bulunamadı'
            });
        }

        const uzmanProfileId = uzmanProfiles[0].id;

        // Get article
        const [articles] = await pool.execute(
            'SELECT * FROM uzman_articles WHERE id = ? AND uzman_profile_id = ?',
            [id, uzmanProfileId]
        );

        if (articles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Makale bulunamadı'
            });
        }

        const article = {
            ...articles[0],
            etiketler: articles[0].etiketler ? JSON.parse(articles[0].etiketler) : []
        };

        res.status(200).json({
            success: true,
            data: article
        });
    } catch (error) {
        console.error('Get article error:', error);
        res.status(500).json({
            success: false,
            message: 'Makale alınırken bir hata oluştu'
        });
    }
};

/**
 * Update article
 * PUT /api/articles/:id
 */
export const updateArticle = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;
        const uzmanUserId = req.user.id;
        const { baslik, icerik, ozet, kategori, etiketler, durum } = req.body;

        await connection.beginTransaction();

        // Get uzman profile id
        const [uzmanProfiles] = await connection.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?',
            [uzmanUserId]
        );

        if (uzmanProfiles.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Uzman profili bulunamadı'
            });
        }

        const uzmanProfileId = uzmanProfiles[0].id;

        // Check if article exists and belongs to uzman
        const [existingArticles] = await connection.execute(
            'SELECT kapak_gorseli_url, durum FROM uzman_articles WHERE id = ? AND uzman_profile_id = ?',
            [id, uzmanProfileId]
        );

        if (existingArticles.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Makale bulunamadı'
            });
        }

        const oldArticle = existingArticles[0];

        // Handle cover image update
        let kapakGorseliUrl = oldArticle.kapak_gorseli_url;
        if (req.file) {
            // Delete old image if exists
            if (oldArticle.kapak_gorseli_url) {
                await deleteFile(oldArticle.kapak_gorseli_url);
            }
            kapakGorseliUrl = `/uploads/article-covers/${req.file.filename}`;
        }

        // Parse etiketler
        const etiketlerJson = typeof etiketler === 'string' ? etiketler : JSON.stringify(etiketler || []);

        // Update published_at if changing to yayinda
        let publishedAt = oldArticle.durum === 'yayinda' ? oldArticle.published_at : null;
        if (durum === 'yayinda' && oldArticle.durum === 'taslak') {
            publishedAt = new Date();
        }

        // Update article
        await connection.execute(
            `UPDATE uzman_articles SET
       baslik = ?, icerik = ?, ozet = ?, kategori = ?, etiketler = ?,
       durum = ?, kapak_gorseli_url = ?, published_at = ?
       WHERE id = ?`,
            [baslik, icerik, ozet || null, kategori, etiketlerJson, durum, kapakGorseliUrl, publishedAt, id]
        );

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Makale güncellendi'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Update article error:', error);
        res.status(500).json({
            success: false,
            message: 'Makale güncellenirken bir hata oluştu'
        });
    } finally {
        connection.release();
    }
};

/**
 * Delete article
 * DELETE /api/articles/:id
 */
export const deleteArticle = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;
        const uzmanUserId = req.user.id;

        await connection.beginTransaction();

        // Get uzman profile id
        const [uzmanProfiles] = await connection.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?',
            [uzmanUserId]
        );

        if (uzmanProfiles.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Uzman profili bulunamadı'
            });
        }

        const uzmanProfileId = uzmanProfiles[0].id;

        // Get article
        const [articles] = await connection.execute(
            'SELECT kapak_gorseli_url FROM uzman_articles WHERE id = ? AND uzman_profile_id = ?',
            [id, uzmanProfileId]
        );

        if (articles.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Makale bulunamadı'
            });
        }

        // Delete cover image if exists
        if (articles[0].kapak_gorseli_url) {
            await deleteFile(articles[0].kapak_gorseli_url);
        }

        // Delete article
        await connection.execute(
            'DELETE FROM uzman_articles WHERE id = ?',
            [id]
        );

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Makale silindi'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Delete article error:', error);
        res.status(500).json({
            success: false,
            message: 'Makale silinirken bir hata oluştu'
        });
    } finally {
        connection.release();
    }
};

/**
 * Publish article
 * POST /api/articles/:id/publish
 */
export const publishArticle = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;
        const uzmanUserId = req.user.id;

        await connection.beginTransaction();

        // Get uzman profile id
        const [uzmanProfiles] = await connection.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?',
            [uzmanUserId]
        );

        if (uzmanProfiles.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Uzman profili bulunamadı'
            });
        }

        const uzmanProfileId = uzmanProfiles[0].id;

        // Update article
        const [result] = await connection.execute(
            `UPDATE uzman_articles SET durum = 'yayinda', published_at = NOW()
       WHERE id = ? AND uzman_profile_id = ?`,
            [id, uzmanProfileId]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Makale bulunamadı'
            });
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Makale yayınlandı'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Publish article error:', error);
        res.status(500).json({
            success: false,
            message: 'Makale yayınlanırken bir hata oluştu'
        });
    } finally {
        connection.release();
    }
};

/**
 * Unpublish article
 * POST /api/articles/:id/unpublish
 */
export const unpublishArticle = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;
        const uzmanUserId = req.user.id;

        await connection.beginTransaction();

        // Get uzman profile id
        const [uzmanProfiles] = await connection.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?',
            [uzmanUserId]
        );

        if (uzmanProfiles.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Uzman profili bulunamadı'
            });
        }

        const uzmanProfileId = uzmanProfiles[0].id;

        // Update article
        const [result] = await connection.execute(
            `UPDATE uzman_articles SET durum = 'taslak'
       WHERE id = ? AND uzman_profile_id = ?`,
            [id, uzmanProfileId]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Makale bulunamadı'
            });
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Makale yayından kaldırıldı'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Unpublish article error:', error);
        res.status(500).json({
            success: false,
            message: 'Makale yayından kaldırılırken bir hata oluştu'
        });
    } finally {
        connection.release();
    }
};
