/**
 * Article Controller
 * Handles article CRUD operations for uzman and public access
 */

import pool from '../../../config/db.js';

/**
 * Get uzman's own articles
 * GET /api/uzman/articles
 */
export const getUzmanArticles = async (req, res) => {
    try {
        const uzmanId = req.user.id;
        const { durum, page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offsetNum = (pageNum - 1) * limitNum;

        let whereConditions = ['uzman_id = ?'];
        let params = [uzmanId];

        if (durum) {
            whereConditions.push('yayinlanma_durumu = ?');
            params.push(durum);
        }

        const query = `
            SELECT id, baslik, ozet, kapak_resmi_url, kategori, 
                   yayinlanma_durumu, okunma_sayisi, created_at, yayinlanma_tarihi
            FROM articles
            WHERE ${whereConditions.join(' AND ')}
            ORDER BY created_at DESC
            LIMIT ${limitNum} OFFSET ${offsetNum}
        `;

        const [articles] = await pool.query(query, params);

        const countQuery = `SELECT COUNT(*) as total FROM articles WHERE ${whereConditions.join(' AND ')}`;
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        res.status(200).json({
            success: true,
            data: {
                articles,
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Get uzman articles error:', error);
        res.status(500).json({
            success: false,
            message: 'Makaleler alınırken bir hata oluştu'
        });
    }
};

/**
 * Get single article for editing (uzman only, own article)
 * GET /api/uzman/articles/:id
 */
export const getUzmanArticleById = async (req, res) => {
    try {
        const uzmanId = req.user.id;
        const articleId = req.params.id;

        const [articles] = await pool.query(
            `SELECT id, baslik, ozet, icerik, kapak_resmi_url, kategori, etiketler,
                    video_link, yayinlanma_durumu, okunma_sayisi, created_at, yayinlanma_tarihi
             FROM articles WHERE id = ? AND uzman_id = ?`,
            [articleId, uzmanId]
        );

        if (articles.length === 0) {
            return res.status(404).json({ success: false, message: 'Makale bulunamadı' });
        }

        const article = articles[0];
        if (article.etiketler) {
            try {
                article.etiketler = typeof article.etiketler === 'string'
                    ? JSON.parse(article.etiketler)
                    : article.etiketler;
            } catch { article.etiketler = []; }
        }

        res.status(200).json({ success: true, data: article });
    } catch (error) {
        console.error('Get article by id error:', error);
        res.status(500).json({ success: false, message: 'Makale alınırken bir hata oluştu' });
    }
};

/**
 * Create article
 * POST /api/uzman/articles
 */
export const createArticle = async (req, res) => {
    try {
        const uzmanId = req.user.id;
        const { baslik, ozet, icerik, kategori, etiketler, yayinlanmaDurumu = 'taslak', video_link } = req.body;

        if (!baslik || !icerik) {
            return res.status(400).json({
                success: false,
                message: 'Başlık ve içerik zorunludur'
            });
        }

        const kapakremi = req.file ? `/uploads/article-covers/${req.file.filename}` : null;

        // etiketler: JSON string olarak geliyorsa parse et, array ise tekrar stringify
        let etiketlerJson = null;
        if (etiketler) {
            try {
                const parsed = typeof etiketler === 'string' ? JSON.parse(etiketler) : etiketler;
                etiketlerJson = JSON.stringify(parsed);
            } catch { etiketlerJson = JSON.stringify([]); }
        }

        const yayinlanmaTarihi = yayinlanmaDurumu === 'yayinda' ? new Date() : null;

        const [result] = await pool.query(
            `INSERT INTO articles
            (uzman_id, baslik, ozet, icerik, kapak_resmi_url, kategori, etiketler, video_link, yayinlanma_durumu, yayinlanma_tarihi)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [uzmanId, baslik, ozet, icerik, kapakremi, kategori, etiketlerJson, video_link || null, yayinlanmaDurumu, yayinlanmaTarihi]
        );

        res.status(201).json({
            success: true,
            message: 'Makale başarıyla oluşturuldu',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Create article error:', error);
        res.status(500).json({
            success: false,
            message: 'Makale oluşturulurken bir hata oluştu'
        });
    }
};

/**
 * Update article
 * PUT /api/uzman/articles/:id
 */
export const updateArticle = async (req, res) => {
    try {
        const uzmanId = req.user.id;
        const articleId = req.params.id;
        const { baslik, ozet, icerik, kategori, etiketler, video_link } = req.body;

        const [existing] = await pool.query(
            'SELECT id, kapak_resmi_url FROM articles WHERE id = ? AND uzman_id = ?',
            [articleId, uzmanId]
        );

        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Makale bulunamadı' });
        }

        // Yeni kapak yüklendiyse path güncelle, yoksa mevcut kalsın
        const kapakUrl = req.file
            ? `/uploads/article-covers/${req.file.filename}`
            : existing[0].kapak_resmi_url;

        let etiketlerJson = existing[0].etiketler || null;
        if (etiketler !== undefined) {
            try {
                const parsed = typeof etiketler === 'string' ? JSON.parse(etiketler) : etiketler;
                etiketlerJson = JSON.stringify(parsed);
            } catch { etiketlerJson = JSON.stringify([]); }
        }

        await pool.query(
            `UPDATE articles
             SET baslik = ?, ozet = ?, icerik = ?, kategori = ?, etiketler = ?,
                 kapak_resmi_url = ?, video_link = ?
             WHERE id = ? AND uzman_id = ?`,
            [baslik, ozet, icerik, kategori, etiketlerJson, kapakUrl, video_link || null, articleId, uzmanId]
        );

        res.status(200).json({ success: true, message: 'Makale güncellendi' });
    } catch (error) {
        console.error('Update article error:', error);
        res.status(500).json({ success: false, message: 'Makale güncellenirken bir hata oluştu' });
    }
};

/**
 * Delete article
 * DELETE /api/uzman/articles/:id
 */
export const deleteArticle = async (req, res) => {
    try {
        const uzmanId = req.user.id;
        const articleId = req.params.id;

        const [result] = await pool.query(
            'DELETE FROM articles WHERE id = ? AND uzman_id = ?',
            [articleId, uzmanId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Makale bulunamadı'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Makale silindi'
        });
    } catch (error) {
        console.error('Delete article error:', error);
        res.status(500).json({
            success: false,
            message: 'Makale silinirken bir hata oluştu'
        });
    }
};

/**
 * Update article status
 * PATCH /api/uzman/articles/:id/status
 */
export const updateArticleStatus = async (req, res) => {
    try {
        const uzmanId = req.user.id;
        const articleId = req.params.id;
        const { durum } = req.body;

        if (!['taslak', 'yayinda', 'arsivlendi'].includes(durum)) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz durum'
            });
        }

        const yayinlanmaTarihi = durum === 'yayinda' ? new Date() : null;

        const [result] = await pool.query(
            `UPDATE articles 
            SET yayinlanma_durumu = ?, yayinlanma_tarihi = ?
            WHERE id = ? AND uzman_id = ?`,
            [durum, yayinlanmaTarihi, articleId, uzmanId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Makale bulunamadı'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Makale durumu güncellendi'
        });
    } catch (error) {
        console.error('Update article status error:', error);
        res.status(500).json({
            success: false,
            message: 'Durum güncellenirken bir hata oluştu'
        });
    }
};

/**
 * Get public articles (yayinda only)
 * GET /api/articles
 */
export const getPublicArticles = async (req, res) => {
    try {
        const { kategori, search, page = 1, limit = 12, sort = 'yeni' } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 12;
        const offsetNum = (pageNum - 1) * limitNum;

        let whereConditions = ["a.yayinlanma_durumu = 'yayinda'"];
        let params = [];

        if (kategori) {
            whereConditions.push('a.kategori = ?');
            params.push(kategori);
        }

        if (search) {
            whereConditions.push('(a.baslik LIKE ? OR a.ozet LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        let orderBy = 'a.yayinlanma_tarihi DESC';
        if (sort === 'populer') {
            orderBy = 'a.okunma_sayisi DESC';
        }

        const query = `
            SELECT a.id, a.baslik, a.ozet, a.kapak_resmi_url, a.kategori, 
                   a.okunma_sayisi, a.yayinlanma_tarihi, a.etiketler,
                   up.ad as yazarAd, up.soyad as yazarSoyad, up.unvan as yazarUnvan,
                   up.profil_fotograf_url as yazarFoto
            FROM articles a
            INNER JOIN users u ON a.uzman_id = u.id
            INNER JOIN uzman_profiles up ON u.id = up.user_id
            WHERE ${whereConditions.join(' AND ')}
            ORDER BY ${orderBy}
            LIMIT ${limitNum} OFFSET ${offsetNum}
        `;

        const [articles] = await pool.query(query, params);

        // Parse etiketler JSON
        articles.forEach(article => {
            if (article.etiketler) {
                try {
                    article.etiketler = typeof article.etiketler === 'string'
                        ? JSON.parse(article.etiketler)
                        : article.etiketler;
                } catch (e) {
                    article.etiketler = [];
                }
            }
        });

        const countQuery = `SELECT COUNT(*) as total FROM articles a WHERE ${whereConditions.join(' AND ')}`;
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        res.status(200).json({
            success: true,
            data: {
                articles,
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Get public articles error:', error);
        res.status(500).json({
            success: false,
            message: 'Makaleler alınırken bir hata oluştu'
        });
    }
};

/**
 * Get article detail
 * GET /api/articles/:id
 */
export const getArticleDetail = async (req, res) => {
    try {
        const articleId = req.params.id;

        const [articles] = await pool.query(
            `SELECT a.*, 
                    up.ad as yazarAd, up.soyad as yazarSoyad, up.unvan as yazarUnvan,
                    up.profil_fotograf_url as yazarFoto, a.uzman_id as yazarId
            FROM articles a
            INNER JOIN users u ON a.uzman_id = u.id
            INNER JOIN uzman_profiles up ON u.id = up.user_id
            WHERE a.id = ? AND a.yayinlanma_durumu = 'yayinda'`,
            [articleId]
        );

        if (articles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Makale bulunamadı'
            });
        }

        const article = articles[0];

        // Parse etiketler
        if (article.etiketler) {
            try {
                article.etiketler = typeof article.etiketler === 'string'
                    ? JSON.parse(article.etiketler)
                    : article.etiketler;
            } catch (e) {
                article.etiketler = [];
            }
        }

        // Increment view count — sadece yeni ziyaretçiler için sayar
        // Tarayıcı bu endpoint'i tekrar çağırsa da DB'de LAST_INSERT_ID trick yerine
        // idempotent olmayan ama hız açısından yeterli basit UPDATE kullanılır.
        // React Strict Mode double-effect sorununu frontend'de useRef ile engelliyoruz.
        await pool.query(
            'UPDATE articles SET okunma_sayisi = okunma_sayisi + 1 WHERE id = ?',
            [articleId]
        );

        // Get other articles by same author
        const [otherArticles] = await pool.query(
            `SELECT id, baslik, kapak_resmi_url, yayinlanma_tarihi
            FROM articles
            WHERE uzman_id = ? AND id != ? AND yayinlanma_durumu = 'yayinda'
            ORDER BY yayinlanma_tarihi DESC
            LIMIT 3`,
            [article.uzman_id, articleId]
        );

        article.digerMakaleler = otherArticles;

        res.status(200).json({
            success: true,
            data: article
        });
    } catch (error) {
        console.error('Get article detail error:', error);
        res.status(500).json({
            success: false,
            message: 'Makale alınırken bir hata oluştu'
        });
    }
};

/**
 * Get uzman's public articles
 * GET /api/articles/uzman/:uzmanId
 */
export const getUzmanPublicArticles = async (req, res) => {
    try {
        const uzmanId = req.params.uzmanId;

        const [articles] = await pool.query(
            `SELECT id, baslik, ozet, kapak_resmi_url, kategori, 
                    okunma_sayisi, yayinlanma_tarihi
            FROM articles
            WHERE uzman_id = ? AND yayinlanma_durumu = 'yayinda'
            ORDER BY yayinlanma_tarihi DESC
            LIMIT 10`,
            [uzmanId]
        );

        res.status(200).json({
            success: true,
            data: articles
        });
    } catch (error) {
        console.error('Get uzman public articles error:', error);
        res.status(500).json({
            success: false,
            message: 'Makaleler alınırken bir hata oluştu'
        });
    }
};
