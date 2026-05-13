/**
 * Public Article Controller
 * Handles public article viewing, search, and filtering
 */

import pool from '../../../config/db.js';

/**
 * Get published articles
 * GET /api/articles/public
 */
export const getPublishedArticles = async (req, res) => {
    try {
        const { kategori, page = 1, limit = 10 } = req.query;

        let query = `
      SELECT a.id, a.baslik, a.ozet, a.kapak_gorseli_url, a.kategori, a.etiketler,
             a.goruntuleme_sayisi, a.published_at,
             up.ad as uzman_ad, up.soyad as uzman_soyad, up.unvan, up.profil_fotograf_url,
             u.id as uzman_user_id
      FROM uzman_articles a
      INNER JOIN uzman_profiles up ON a.uzman_profile_id = up.id
      INNER JOIN users u ON up.user_id = u.id
      WHERE a.durum = 'yayinda'
    `;

        const params = [];

        if (kategori) {
            query += ' AND a.kategori = ?';
            params.push(kategori);
        }

        query += ' ORDER BY a.published_at DESC LIMIT ? OFFSET ?';
        const offset = (parseInt(page) - 1) * parseInt(limit);
        params.push(parseInt(limit), offset);

        const [articles] = await pool.execute(query, params);

        // Parse etiketler
        const parsedArticles = articles.map(a => ({
            ...a,
            etiketler: a.etiketler ? JSON.parse(a.etiketler) : [],
            uzman: {
                id: a.uzman_user_id,
                ad: a.uzman_ad,
                soyad: a.uzman_soyad,
                unvan: a.unvan,
                profil_fotograf_url: a.profil_fotograf_url
            },
            uzman_ad: undefined,
            uzman_soyad: undefined,
            unvan: undefined,
            profil_fotograf_url: undefined,
            uzman_user_id: undefined
        }));

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM uzman_articles WHERE durum = "yayinda"';
        const countParams = [];

        if (kategori) {
            countQuery += ' AND kategori = ?';
            countParams.push(kategori);
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
        console.error('Get published articles error:', error);
        res.status(500).json({
            success: false,
            message: 'Makaleler alınırken bir hata oluştu'
        });
    }
};

/**
 * Get single article (public)
 * GET /api/articles/public/:id
 */
export const getArticle = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;

        await connection.beginTransaction();

        // Get article
        const [articles] = await connection.execute(
            `SELECT a.*, 
              up.ad as uzman_ad, up.soyad as uzman_soyad, up.unvan, 
              up.profil_fotograf_url, up.biyografi, up.uzmanlik_alani,
              u.id as uzman_user_id
       FROM uzman_articles a
       INNER JOIN uzman_profiles up ON a.uzman_profile_id = up.id
       INNER JOIN users u ON up.user_id = u.id
       WHERE a.id = ? AND a.durum = 'yayinda'`,
            [id]
        );

        if (articles.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Makale bulunamadı'
            });
        }

        // Increment view count
        await connection.execute(
            'UPDATE uzman_articles SET goruntuleme_sayisi = goruntuleme_sayisi + 1 WHERE id = ?',
            [id]
        );

        await connection.commit();

        const article = articles[0];

        // Format response
        const formattedArticle = {
            id: article.id,
            baslik: article.baslik,
            icerik: article.icerik,
            ozet: article.ozet,
            kapak_gorseli_url: article.kapak_gorseli_url,
            kategori: article.kategori,
            etiketler: article.etiketler ? JSON.parse(article.etiketler) : [],
            goruntuleme_sayisi: article.goruntuleme_sayisi + 1,
            published_at: article.published_at,
            created_at: article.created_at,
            uzman: {
                id: article.uzman_user_id,
                ad: article.uzman_ad,
                soyad: article.uzman_soyad,
                unvan: article.unvan,
                profil_fotograf_url: article.profil_fotograf_url,
                biyografi: article.biyografi,
                uzmanlik_alani: article.uzmanlik_alani
            }
        };

        res.status(200).json({
            success: true,
            data: formattedArticle
        });
    } catch (error) {
        await connection.rollback();
        console.error('Get article error:', error);
        res.status(500).json({
            success: false,
            message: 'Makale alınırken bir hata oluştu'
        });
    } finally {
        connection.release();
    }
};

/**
 * Get articles by uzman
 * GET /api/articles/public/uzman/:uzmanId
 */
export const getArticlesByUzman = async (req, res) => {
    try {
        const { uzmanId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Get uzman profile id
        const [uzmanProfiles] = await pool.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?',
            [uzmanId]
        );

        if (uzmanProfiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Uzman bulunamadı'
            });
        }

        const uzmanProfileId = uzmanProfiles[0].id;

        // Get articles
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const [articles] = await pool.execute(
            `SELECT id, baslik, ozet, kapak_gorseli_url, kategori, etiketler,
              goruntuleme_sayisi, published_at
       FROM uzman_articles
       WHERE uzman_profile_id = ? AND durum = 'yayinda'
       ORDER BY published_at DESC
       LIMIT ? OFFSET ?`,
            [uzmanProfileId, parseInt(limit), offset]
        );

        // Parse etiketler
        const parsedArticles = articles.map(a => ({
            ...a,
            etiketler: a.etiketler ? JSON.parse(a.etiketler) : []
        }));

        // Get total count
        const [countResult] = await pool.execute(
            'SELECT COUNT(*) as total FROM uzman_articles WHERE uzman_profile_id = ? AND durum = "yayinda"',
            [uzmanProfileId]
        );
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
        console.error('Get articles by uzman error:', error);
        res.status(500).json({
            success: false,
            message: 'Makaleler alınırken bir hata oluştu'
        });
    }
};

/**
 * Search articles
 * GET /api/articles/public/search
 */
export const searchArticles = async (req, res) => {
    try {
        const { q, kategori, page = 1, limit = 10 } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Arama terimi gereklidir'
            });
        }

        let query = `
      SELECT a.id, a.baslik, a.ozet, a.kapak_gorseli_url, a.kategori, a.etiketler,
             a.goruntuleme_sayisi, a.published_at,
             up.ad as uzman_ad, up.soyad as uzman_soyad, up.unvan, up.profil_fotograf_url,
             u.id as uzman_user_id,
             MATCH(a.baslik, a.icerik, a.ozet) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
      FROM uzman_articles a
      INNER JOIN uzman_profiles up ON a.uzman_profile_id = up.id
      INNER JOIN users u ON up.user_id = u.id
      WHERE a.durum = 'yayinda'
      AND MATCH(a.baslik, a.icerik, a.ozet) AGAINST(? IN NATURAL LANGUAGE MODE)
    `;

        const params = [q, q];

        if (kategori) {
            query += ' AND a.kategori = ?';
            params.push(kategori);
        }

        query += ' ORDER BY relevance DESC, a.published_at DESC LIMIT ? OFFSET ?';
        const offset = (parseInt(page) - 1) * parseInt(limit);
        params.push(parseInt(limit), offset);

        const [articles] = await pool.execute(query, params);

        // Parse etiketler
        const parsedArticles = articles.map(a => ({
            ...a,
            etiketler: a.etiketler ? JSON.parse(a.etiketler) : [],
            uzman: {
                id: a.uzman_user_id,
                ad: a.uzman_ad,
                soyad: a.uzman_soyad,
                unvan: a.unvan,
                profil_fotograf_url: a.profil_fotograf_url
            },
            uzman_ad: undefined,
            uzman_soyad: undefined,
            unvan: undefined,
            profil_fotograf_url: undefined,
            uzman_user_id: undefined,
            relevance: undefined
        }));

        res.status(200).json({
            success: true,
            data: parsedArticles,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Search articles error:', error);
        res.status(500).json({
            success: false,
            message: 'Arama yapılırken bir hata oluştu'
        });
    }
};

/**
 * Get article categories
 * GET /api/articles/categories
 */
export const getCategories = async (req, res) => {
    try {
        const [categories] = await pool.execute(
            'SELECT kategori_adi, aciklama FROM article_categories WHERE aktif = true ORDER BY kategori_adi'
        );

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Kategoriler alınırken bir hata oluştu'
        });
    }
};
