/**
 * Uzman Review Controller
 * Handles review submission, retrieval, and rating calculations
 */

import pool from '../../../config/db.js';

/**
 * Create review for uzman
 * POST /api/uzman/:id/review
 */
export const createReview = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const uzmanUserId = req.params.id;
        const hastaUserId = req.user.id;
        const {
            rating,
            yorum,
            profesyonellik_puan,
            iletisim_puan,
            tedavi_etkinligi_puan,
            zamaninda_gelme_puan,
            anonim = false
        } = req.body;

        // Validation
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli bir rating (1-5) gereklidir'
            });
        }

        await connection.beginTransaction();

        // Get hasta profile id
        const [hastaProfiles] = await connection.execute(
            'SELECT id FROM hasta_profiles WHERE user_id = ?',
            [hastaUserId]
        );

        if (hastaProfiles.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Hasta profili bulunamadı'
            });
        }

        const hastaProfileId = hastaProfiles[0].id;

        // Get uzman profile id
        const [uzmanProfiles] = await connection.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?',
            [uzmanUserId]
        );

        if (uzmanProfiles.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Uzman bulunamadı'
            });
        }

        const uzmanProfileId = uzmanProfiles[0].id;

        // Insert review
        await connection.execute(
            `INSERT INTO uzman_reviews 
       (uzman_profile_id, hasta_profile_id, rating, yorum, 
        profesyonellik_puan, iletisim_puan, tedavi_etkinligi_puan, 
        zamaninda_gelme_puan, anonim)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                uzmanProfileId,
                hastaProfileId,
                rating,
                yorum || null,
                profesyonellik_puan || null,
                iletisim_puan || null,
                tedavi_etkinligi_puan || null,
                zamaninda_gelme_puan || null,
                anonim
            ]
        );

        // Update uzman statistics
        await updateUzmanStatistics(connection, uzmanProfileId);

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Değerlendirme başarıyla kaydedildi'
        });
    } catch (error) {
        await connection.rollback();

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Bu uzmana daha önce değerlendirme yaptınız'
            });
        }

        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: 'Değerlendirme kaydedilirken bir hata oluştu'
        });
    } finally {
        connection.release();
    }
};

/**
 * Get uzman reviews
 * GET /api/uzman/:id/reviews
 */
export const getUzmanReviews = async (req, res) => {
    try {
        const uzmanUserId = req.params.id;
        const { page = 1, limit = 10 } = req.query;

        // Get uzman profile id
        const [uzmanProfiles] = await pool.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?',
            [uzmanUserId]
        );

        if (uzmanProfiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Uzman bulunamadı'
            });
        }

        const uzmanProfileId = uzmanProfiles[0].id;

        // Get reviews with pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const [reviews] = await pool.execute(
            `SELECT r.id, r.rating, r.yorum, r.profesyonellik_puan, r.iletisim_puan,
              r.tedavi_etkinligi_puan, r.zamaninda_gelme_puan, r.anonim, r.created_at,
              hp.ad as hasta_ad, hp.soyad as hasta_soyad
       FROM uzman_reviews r
       INNER JOIN hasta_profiles hp ON r.hasta_profile_id = hp.id
       WHERE r.uzman_profile_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
            [uzmanProfileId, parseInt(limit), offset]
        );

        // Hide hasta name if anonim
        const processedReviews = reviews.map(r => ({
            ...r,
            hasta_ad: r.anonim ? null : r.hasta_ad,
            hasta_soyad: r.anonim ? null : r.hasta_soyad
        }));

        // Get total count
        const [countResult] = await pool.execute(
            'SELECT COUNT(*) as total FROM uzman_reviews WHERE uzman_profile_id = ?',
            [uzmanProfileId]
        );
        const total = countResult[0].total;

        // Get rating distribution
        const [distribution] = await pool.execute(
            `SELECT rating, COUNT(*) as count
       FROM uzman_reviews
       WHERE uzman_profile_id = ?
       GROUP BY rating`,
            [uzmanProfileId]
        );

        const ratingDagilimi = {
            '5': 0,
            '4': 0,
            '3': 0,
            '2': 0,
            '1': 0
        };

        distribution.forEach(d => {
            ratingDagilimi[d.rating] = d.count;
        });

        // Get average rating
        const [avgResult] = await pool.execute(
            'SELECT ortalama_rating FROM uzman_profiles WHERE id = ?',
            [uzmanProfileId]
        );

        res.status(200).json({
            success: true,
            data: {
                reviews: processedReviews,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                },
                statistics: {
                    ortalama_rating: avgResult[0].ortalama_rating,
                    rating_dagilimi: ratingDagilimi
                }
            }
        });
    } catch (error) {
        console.error('Get uzman reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Değerlendirmeler alınırken bir hata oluştu'
        });
    }
};

/**
 * Update own review
 * PUT /api/uzman/:id/review
 */
export const updateReview = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const uzmanUserId = req.params.id;
        const hastaUserId = req.user.id;
        const {
            rating,
            yorum,
            profesyonellik_puan,
            iletisim_puan,
            tedavi_etkinligi_puan,
            zamaninda_gelme_puan,
            anonim
        } = req.body;

        await connection.beginTransaction();

        // Get profile ids
        const [hastaProfiles] = await connection.execute(
            'SELECT id FROM hasta_profiles WHERE user_id = ?',
            [hastaUserId]
        );

        const [uzmanProfiles] = await connection.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?',
            [uzmanUserId]
        );

        if (hastaProfiles.length === 0 || uzmanProfiles.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Profil bulunamadı'
            });
        }

        const hastaProfileId = hastaProfiles[0].id;
        const uzmanProfileId = uzmanProfiles[0].id;

        // Update review
        const [result] = await connection.execute(
            `UPDATE uzman_reviews SET
       rating = ?, yorum = ?, profesyonellik_puan = ?, iletisim_puan = ?,
       tedavi_etkinligi_puan = ?, zamaninda_gelme_puan = ?, anonim = ?
       WHERE uzman_profile_id = ? AND hasta_profile_id = ?`,
            [
                rating,
                yorum || null,
                profesyonellik_puan || null,
                iletisim_puan || null,
                tedavi_etkinligi_puan || null,
                zamaninda_gelme_puan || null,
                anonim !== undefined ? anonim : false,
                uzmanProfileId,
                hastaProfileId
            ]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Değerlendirme bulunamadı'
            });
        }

        // Update statistics
        await updateUzmanStatistics(connection, uzmanProfileId);

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Değerlendirme güncellendi'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Update review error:', error);
        res.status(500).json({
            success: false,
            message: 'Değerlendirme güncellenirken bir hata oluştu'
        });
    } finally {
        connection.release();
    }
};

/**
 * Delete own review
 * DELETE /api/uzman/:id/review
 */
export const deleteReview = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const uzmanUserId = req.params.id;
        const hastaUserId = req.user.id;

        await connection.beginTransaction();

        // Get profile ids
        const [hastaProfiles] = await connection.execute(
            'SELECT id FROM hasta_profiles WHERE user_id = ?',
            [hastaUserId]
        );

        const [uzmanProfiles] = await connection.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?',
            [uzmanUserId]
        );

        if (hastaProfiles.length === 0 || uzmanProfiles.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Profil bulunamadı'
            });
        }

        const hastaProfileId = hastaProfiles[0].id;
        const uzmanProfileId = uzmanProfiles[0].id;

        // Delete review
        const [result] = await connection.execute(
            'DELETE FROM uzman_reviews WHERE uzman_profile_id = ? AND hasta_profile_id = ?',
            [uzmanProfileId, hastaProfileId]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Değerlendirme bulunamadı'
            });
        }

        // Update statistics
        await updateUzmanStatistics(connection, uzmanProfileId);

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Değerlendirme silindi'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Değerlendirme silinirken bir hata oluştu'
        });
    } finally {
        connection.release();
    }
};

/**
 * Get hasta's own reviews
 * GET /api/hasta/my-reviews
 */
export const getMyReviews = async (req, res) => {
    try {
        const hastaUserId = req.user.id;

        // Get hasta profile id
        const [hastaProfiles] = await pool.execute(
            'SELECT id FROM hasta_profiles WHERE user_id = ?',
            [hastaUserId]
        );

        if (hastaProfiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Hasta profili bulunamadı'
            });
        }

        const hastaProfileId = hastaProfiles[0].id;

        // Get reviews
        const [reviews] = await pool.execute(
            `SELECT r.id, r.rating, r.yorum, r.profesyonellik_puan, r.iletisim_puan,
              r.tedavi_etkinligi_puan, r.zamaninda_gelme_puan, r.anonim, r.created_at,
              up.ad as uzman_ad, up.soyad as uzman_soyad, up.unvan,
              u.id as uzman_user_id
       FROM uzman_reviews r
       INNER JOIN uzman_profiles up ON r.uzman_profile_id = up.id
       INNER JOIN users u ON up.user_id = u.id
       WHERE r.hasta_profile_id = ?
       ORDER BY r.created_at DESC`,
            [hastaProfileId]
        );

        res.status(200).json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error('Get my reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Değerlendirmeler alınırken bir hata oluştu'
        });
    }
};

/**
 * Helper function to update uzman statistics
 */
async function updateUzmanStatistics(connection, uzmanProfileId) {
    // Calculate average rating
    const [avgResult] = await connection.execute(
        'SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM uzman_reviews WHERE uzman_profile_id = ?',
        [uzmanProfileId]
    );

    const avgRating = avgResult[0].avg_rating || 0;
    const totalReviews = avgResult[0].total_reviews || 0;

    // Update uzman profile
    await connection.execute(
        'UPDATE uzman_profiles SET ortalama_rating = ?, toplam_yorum_sayisi = ? WHERE id = ?',
        [parseFloat(avgRating.toFixed(2)), totalReviews, uzmanProfileId]
    );
}
