/**
 * Uzman Search Controller
 * Handles uzman search, filtering, and reviews
 */

import pool from '../../../config/db.js';

/**
 * Search uzmanlar with filters
 * GET /api/hasta/uzmanlar
 */
export const searchUzmanlar = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { unvan, sehir, ilce, uzmanlik, minRating, sort = 'recommended', page = 1, limit = 12 } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 12;
        const offsetNum = (pageNum - 1) * limitNum;

        let whereConditions = ["u.role = 'uzman'", "u.status = 'active'", "up.profile_completed_at IS NOT NULL"];
        let whereParams = []; // Only for WHERE clause

        // Filters
        if (unvan) {
            whereConditions.push('up.unvan = ?');
            whereParams.push(unvan);
        }
        if (sehir) {
            whereConditions.push('up.sehir = ?');
            whereParams.push(sehir);
        }
        if (ilce) {
            whereConditions.push('up.ilce = ?');
            whereParams.push(ilce);
        }

        // Base query
        let query = `
            SELECT 
                u.id, up.ad, up.soyad, up.unvan, up.sehir, up.ilce,
                up.profil_fotograf_url, up.biyografi,
                COALESCE(AVG(r.rating), 0) as avgRating,
                COUNT(DISTINCT r.id) as reviewCount
            FROM users u
            INNER JOIN uzman_profiles up ON u.id = up.user_id
            LEFT JOIN reviews r ON u.id = r.uzman_id
            WHERE ${whereConditions.join(' AND ')}
            GROUP BY u.id, up.ad, up.soyad, up.unvan, up.sehir, up.ilce, up.profil_fotograf_url, up.biyografi
        `;

        // Start building params array for main query
        let queryParams = [...whereParams]; // Copy WHERE params

        // Rating filter
        const minRatingNum = parseFloat(minRating);
        if (minRatingNum && minRatingNum > 0) {
            query += ` HAVING avgRating >= ?`;
            queryParams.push(minRatingNum);
        }

        // Sorting
        switch (sort) {
            case 'rating':
                query += ' ORDER BY avgRating DESC, reviewCount DESC';
                break;
            case 'reviews':
                query += ' ORDER BY reviewCount DESC, avgRating DESC';
                break;
            case 'name':
                query += ' ORDER BY up.ad ASC, up.soyad ASC';
                break;
            default:
                query += ' ORDER BY avgRating DESC, reviewCount DESC';
        }

        // Count total (use only WHERE params)
        let countQuery = `SELECT COUNT(*) as total FROM (
            SELECT u.id
            FROM users u
            INNER JOIN uzman_profiles up ON u.id = up.user_id
            LEFT JOIN reviews r ON u.id = r.uzman_id
            WHERE ${whereConditions.join(' AND ')}
            GROUP BY u.id
        `;
        const countParams = [...whereParams];

        if (minRatingNum && minRatingNum > 0) {
            countQuery += ' HAVING COALESCE(AVG(r.rating), 0) >= ?';
            countParams.push(minRatingNum);
        }

        countQuery += ') counted_uzmanlar';

        const [countResult] = await pool.query(countQuery, countParams);
        const total = countResult[0]?.total || 0;

        // Pagination
        query += ` LIMIT ${limitNum} OFFSET ${offsetNum}`;

        const [uzmanlar] = await pool.query(query, queryParams);

        // Get expertise for each uzman
        for (let uzman of uzmanlar) {
            const [alanlari] = await pool.execute(
                'SELECT kategori, deger FROM uzmanlik_alanlari WHERE uzman_profile_id = (SELECT id FROM uzman_profiles WHERE user_id = ?)',
                [uzman.id]
            );

            uzman.uzmanlikAlanlari = alanlari.reduce((acc, item) => {
                if (!acc[item.kategori]) acc[item.kategori] = [];
                acc[item.kategori].push(item.deger);
                return acc;
            }, {});
        }

        // Get recommended uzmanlar if user has assessment
        let recommended = [];
        if (userId) {
            const [assessments] = await pool.execute(
                'SELECT * FROM assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
                [userId]
            );

            if (assessments.length > 0) {
                const assessment = assessments[0];
                // Simple matching: filter by pain region and recommended specialists
                recommended = uzmanlar.filter(uzman => {
                    const hasRegion = uzman.uzmanlikAlanlari.vucutBolgesi?.includes(assessment.pain_region);
                    return hasRegion;
                }).slice(0, 3);
            }
        }

        res.status(200).json({
            success: true,
            data: {
                recommended,
                all: uzmanlar,
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Search uzmanlar error:', error);
        res.status(500).json({
            success: false,
            message: 'Uzman arama sırasında bir hata oluştu'
        });
    }
};

/**
 * Get uzman profile with reviews
 * GET /api/uzman/:id/profile
 */
export const getUzmanProfile = async (req, res) => {
    try {
        const uzmanId = req.params.id;

        // Get uzman profile
        const [profiles] = await pool.execute(
            `SELECT u.id, u.email, up.ad, up.soyad, up.unvan, up.telefon,
                up.dogum_tarihi, up.cinsiyet, up.sehir, up.ilce,
                up.profil_fotograf_url, up.biyografi,
                up.mezuniyet_okul, up.mezuniyet_yili
            FROM users u
            INNER JOIN uzman_profiles up ON u.id = up.user_id
            WHERE u.id = ? AND u.role = 'uzman' AND u.status = 'active'`,
            [uzmanId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Uzman bulunamadı'
            });
        }

        const profile = profiles[0];

        // Get expertise
        const [alanlari] = await pool.execute(
            'SELECT kategori, deger FROM uzmanlik_alanlari WHERE uzman_profile_id = (SELECT id FROM uzman_profiles WHERE user_id = ?)',
            [uzmanId]
        );

        profile.uzmanlikAlanlari = alanlari.reduce((acc, item) => {
            if (!acc[item.kategori]) acc[item.kategori] = [];
            acc[item.kategori].push(item.deger);
            return acc;
        }, {});

        // Get certificates
        const [sertifikalar] = await pool.execute(
            'SELECT id, adi, dosya_url FROM sertifikalar WHERE uzman_profile_id = (SELECT id FROM uzman_profiles WHERE user_id = ?)',
            [uzmanId]
        );
        profile.sertifikalar = sertifikalar;

        // Get makaleler
        const [makaleler] = await pool.execute(
            `SELECT id, baslik, created_at 
             FROM articles 
             WHERE uzman_id = ? AND yayinlanma_durumu = 'yayinda'
             ORDER BY created_at DESC
             LIMIT 5`,
            [uzmanId]
        );
        profile.makaleler = makaleler;

        // Get reviews
        const [reviews] = await pool.execute(
            `SELECT r.id, r.rating, r.comment, r.created_at,
                hp.ad as hastaAd, hp.soyad as hastaSoyad
            FROM reviews r
            INNER JOIN users u ON r.hasta_id = u.id
            INNER JOIN hasta_profiles hp ON u.id = hp.user_id
            WHERE r.uzman_id = ?
            ORDER BY r.created_at DESC`,
            [uzmanId]
        );

        // Calculate review stats
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => distribution[r.rating]++);

        profile.reviews = {
            avgRating: Math.round(avgRating * 10) / 10,
            totalReviews: reviews.length,
            distribution,
            reviews
        };

        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Get uzman profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Profil alınırken bir hata oluştu'
        });
    }
};

/**
 * Create review
 * POST /api/hasta/reviews
 */
export const createReview = async (req, res) => {
    try {
        const hastaId = req.user.id;
        const { uzmanId, rating, comment } = req.body;

        if (!uzmanId) {
            return res.status(400).json({
                success: false,
                message: 'Uzman bilgisi eksik'
            });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz puan (1-5 arası olmalı)'
            });
        }

        // Check if review already exists
        const [existing] = await pool.execute(
            'SELECT id FROM reviews WHERE uzman_id = ? AND hasta_id = ?',
            [uzmanId, hastaId]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Bu uzmana zaten yorum yaptınız'
            });
        }

        await pool.execute(
            'INSERT INTO reviews (uzman_id, hasta_id, rating, comment) VALUES (?, ?, ?, ?)',
            [uzmanId, hastaId, rating, comment || null]
        );

        res.status(201).json({
            success: true,
            message: 'Yorum başarıyla eklendi'
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: 'Yorum eklenirken bir hata oluştu'
        });
    }
};

/**
 * Update review
 * PUT /api/hasta/reviews/:id
 */
export const updateReview = async (req, res) => {
    try {
        const hastaId = req.user.id;
        const reviewId = req.params.id;
        const { rating, comment } = req.body;

        // Check ownership
        const [reviews] = await pool.execute(
            'SELECT id FROM reviews WHERE id = ? AND hasta_id = ?',
            [reviewId, hastaId]
        );

        if (reviews.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Yorum bulunamadı'
            });
        }

        await pool.execute(
            'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
            [rating, comment || null, reviewId]
        );

        res.status(200).json({
            success: true,
            message: 'Yorum güncellendi'
        });
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({
            success: false,
            message: 'Yorum güncellenirken bir hata oluştu'
        });
    }
};

/**
 * Delete review
 * DELETE /api/hasta/reviews/:id
 */
export const deleteReview = async (req, res) => {
    try {
        const hastaId = req.user.id;
        const reviewId = req.params.id;

        const [result] = await pool.execute(
            'DELETE FROM reviews WHERE id = ? AND hasta_id = ?',
            [reviewId, hastaId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Yorum bulunamadı'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Yorum silindi'
        });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Yorum silinirken bir hata oluştu'
        });
    }
};

/**
 * Get uzman's own reviews
 * GET /api/uzman/reviews
 */
export const getUzmanOwnReviews = async (req, res) => {
    try {
        const uzmanId = req.user.id;

        // Get reviews with patient info
        const [reviews] = await pool.query(
            `SELECT 
                r.id, r.rating, r.comment, r.created_at,
                CONCAT(hp.ad, ' ', SUBSTRING(hp.soyad, 1, 1), '.') as hastaAd
            FROM reviews r
            INNER JOIN users u ON r.hasta_id = u.id
            INNER JOIN hasta_profiles hp ON u.id = hp.user_id
            WHERE r.uzman_id = ?
            ORDER BY r.created_at DESC`,
            [uzmanId]
        );

        // Calculate statistics
        const [stats] = await pool.query(
            `SELECT 
                COALESCE(AVG(rating), 0) as avgRating,
                COUNT(*) as totalReviews,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating5,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating4,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating3,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating2,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating1
            FROM reviews
            WHERE uzman_id = ?`,
            [uzmanId]
        );

        const distribution = {
            5: stats[0].rating5 || 0,
            4: stats[0].rating4 || 0,
            3: stats[0].rating3 || 0,
            2: stats[0].rating2 || 0,
            1: stats[0].rating1 || 0
        };

        res.status(200).json({
            success: true,
            data: {
                reviews,
                stats: {
                    avgRating: parseFloat(stats[0].avgRating.toFixed(1)),
                    totalReviews: stats[0].totalReviews,
                    distribution
                }
            }
        });
    } catch (error) {
        console.error('Get uzman reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Yorumlar alınırken bir hata oluştu'
        });
    }
};
