/**
 * Admin Controller
 * Handles admin operations: uzman approvals, user management, statistics
 */

import pool from '../../../config/db.js';
import { sendEmail, mailOnaylandiHasta, mailOnaylandiUzman, mailReddedildiHasta } from '../../../core/notifications/emailService.js';
import { sendWhatsApp, waOnaylandiHasta, waOnaylandiUzman, waReddedildiHasta } from '../../../core/notifications/whatsappService.js';

/**
 * Get dashboard statistics
 * GET /api/admin/stats
 */
export const getDashboardStats = async (req, res) => {
    try {
        // Total users by role
        const [userStats] = await pool.query(`
            SELECT 
                role,
                COUNT(*) as count,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
            FROM users
            GROUP BY role
        `);

        // Pending uzman applications
        const [pendingApps] = await pool.query(`
            SELECT COUNT(*) as count
            FROM users
            WHERE role = 'uzman' AND status IN ('pending_approval', 'pending')
        `);

        // Total assessments
        const [assessments] = await pool.query(`
            SELECT COUNT(*) as count FROM assessments
        `);

        // Total reviews
        const [reviews] = await pool.query(`
            SELECT COUNT(*) as count FROM reviews
        `);

        const [randevuStats] = await pool.execute(
            `SELECT 
            COUNT(*) as toplam,
            SUM(durum = 'beklemede') as beklemede,
            SUM(durum = 'onaylandi') as onaylandi
            FROM randevular`
        );

        // Total articles
        const [articles] = await pool.query(`
            SELECT COUNT(*) as count FROM articles WHERE yayinlanma_durumu = 'yayinda'
        `);

        // Recent activities (last 10)
        const [activities] = await pool.query(`
            SELECT 
                u.id,
                u.email,
                u.role,
                u.created_at,
                'Yeni kayıt' as activity_type
            FROM users u
            ORDER BY u.created_at DESC
            LIMIT 10
        `);

        res.status(200).json({
            success: true,
            data: {
                users: userStats,
                pendingApplications: pendingApps[0].count,
                totalAssessments: assessments[0].count,
                totalReviews: reviews[0].count,
                totalArticles: articles[0].count,
                recentActivities: activities,
                randevuStats: randevuStats[0]
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'İstatistikler alınırken bir hata oluştu'
        });
    }
};

/**
 * Get uzman applications
 * GET /api/admin/uzman-basvurular
 */
export const getUzmanApplications = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereClause = "u.role = 'uzman'";
        const params = [];

        if (status) {
            whereClause += ' AND u.status = ?';
            params.push(status);
        }

        const [applications] = await pool.query(`
            SELECT 
                u.id,
                u.email,
                u.status,
                u.created_at,
                up.ad,
                up.soyad,
                up.unvan,
                up.diploma_url,
                up.mezuniyet_okul,
                up.mezuniyet_yili
            FROM users u
            LEFT JOIN uzman_profiles up ON u.id = up.user_id
            WHERE ${whereClause}
            ORDER BY u.created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), offset]);

        const [total] = await pool.query(`
            SELECT COUNT(*) as count
            FROM users u
            WHERE ${whereClause}
        `, params);

        res.status(200).json({
            success: true,
            data: {
                applications,
                total: total[0].count,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get uzman applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Başvurular alınırken bir hata oluştu'
        });
    }
};

/**
 * Get single uzman application detail
 * GET /api/admin/uzman-basvurular/:id
 */
export const getUzmanApplicationDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const [application] = await pool.query(`
            SELECT 
                u.id,
                u.email,
                u.status,
                u.created_at,
                up.*
            FROM users u
            LEFT JOIN uzman_profiles up ON u.id = up.user_id
            WHERE u.id = ? AND u.role = 'uzman'
        `, [id]);

        if (application.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Başvuru bulunamadı'
            });
        }

        res.status(200).json({
            success: true,
            data: application[0]
        });
    } catch (error) {
        console.error('Get application detail error:', error);
        res.status(500).json({
            success: false,
            message: 'Başvuru detayı alınırken bir hata oluştu'
        });
    }
};

/**
 * Update uzman application status (approve/reject)
 * PATCH /api/admin/uzman-basvurular/:id
 */
export const updateUzmanApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const normalizedStatus = status === 'approved' ? 'active' : status;

        if (!['active', 'rejected'].includes(normalizedStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz durum'
            });
        }

        // Update user status
        await pool.query(
            'UPDATE users SET status = ? WHERE id = ? AND role = ?',
            [normalizedStatus, id, 'uzman']
        );

        res.status(200).json({
            success: true,
            message: normalizedStatus === 'active' ? 'Başvuru onaylandı' : 'Başvuru reddedildi'
        });
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({
            success: false,
            message: 'Durum güncellenirken bir hata oluştu'
        });
    }
};

/**
 * Get all users
 * GET /api/admin/users
 */
export const getUsers = async (req, res) => {
    try {
        const { role, status, search, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereConditions = [];
        const params = [];

        if (role) {
            whereConditions.push('u.role = ?');
            params.push(role);
        }

        if (status) {
            whereConditions.push('u.status = ?');
            params.push(status);
        }

        if (search) {
            whereConditions.push('(u.email LIKE ? OR hp.ad LIKE ? OR hp.soyad LIKE ? OR up.ad LIKE ? OR up.soyad LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        const [users] = await pool.query(`
            SELECT 
                u.id,
                u.email,
                u.role,
                u.status,
                u.created_at,
                COALESCE(hp.ad, up.ad) as ad,
                COALESCE(hp.soyad, up.soyad) as soyad,
                up.unvan
            FROM users u
            LEFT JOIN hasta_profiles hp ON u.id = hp.user_id
            LEFT JOIN uzman_profiles up ON u.id = up.user_id
            ${whereClause}
            ORDER BY u.created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), offset]);

        const [total] = await pool.query(`
            SELECT COUNT(*) as count
            FROM users u
            LEFT JOIN hasta_profiles hp ON u.id = hp.user_id
            LEFT JOIN uzman_profiles up ON u.id = up.user_id
            ${whereClause}
        `, params);

        res.status(200).json({
            success: true,
            data: {
                users,
                total: total[0].count,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcılar alınırken bir hata oluştu'
        });
    }
};

/**
 * Update user status
 * PATCH /api/admin/users/:id/status
 */
export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'suspended', 'pending_approval', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz durum'
            });
        }

        await pool.query(
            'UPDATE users SET status = ? WHERE id = ?',
            [status, id]
        );

        res.status(200).json({
            success: true,
            message: 'Kullanıcı durumu güncellendi'
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Durum güncellenirken bir hata oluştu'
        });
    }
};

/**
 * Delete user
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Don't allow deleting yourself
        if (id === req.user.id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Kendi hesabınızı silemezsiniz'
            });
        }

        await pool.query('DELETE FROM users WHERE id = ?', [id]);

        res.status(200).json({
            success: true,
            message: 'Kullanıcı silindi'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı silinirken bir hata oluştu'
        });
    }
};

/**
 * Tüm randevuları listele
 * GET /api/admin/randevular
 */
export const getRandevular = async (req, res) => {
    try {
        const durum = req.query.durum || 'beklemede';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const whereClause = durum === 'hepsi' ? '' : 'WHERE r.durum = ?';
        const params = durum === 'hepsi' ? [limit, offset] : [durum, limit, offset];

        const [randevular] = await pool.query(
            `SELECT
                r.id, r.talep_tarihi, r.talep_turu, r.durum,
                r.hasta_notu, r.red_notu, r.alternatif_tarih,
                r.kesin_tarih, r.created_at, r.randevu_tipi,
                hp.ad as hasta_ad, hp.soyad as hasta_soyad,
                hp.telefon as hasta_telefon,
                hu.email as hasta_email,
                up.ad as uzman_ad, up.soyad as uzman_soyad,
                up.unvan, up.uzmanlik_alani, up.telefon as uzman_telefon,
                uu.email as uzman_email
             FROM randevular r
             INNER JOIN hasta_profiles hp ON r.hasta_profile_id = hp.id
             INNER JOIN users hu ON hp.user_id = hu.id
             INNER JOIN uzman_profiles up ON r.uzman_profile_id = up.id
             INNER JOIN users uu ON up.user_id = uu.id
             ${whereClause}
             ORDER BY r.created_at DESC
             LIMIT ? OFFSET ?`,
            params
        );

        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM randevular r ${whereClause}`,
            durum === 'hepsi' ? [] : [durum]
        );

        res.status(200).json({
            success: true,
            data: {
                randevular,
                total: countResult[0].total,
                page: Number(page),
                limit: Number(limit)
            }
        });
    } catch (error) {
        console.error('getRandevular error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

/**
 * Randevu durumunu güncelle (admin)
 * PATCH /api/admin/randevular/:id
 */
export const updateRandevuDurum = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const { durum, red_notu } = req.body;
        // durum: 'onaylandi' | 'reddedildi' | 'iptal' | 'tamamlandi'

        const validDurumlar = ['onaylandi', 'reddedildi', 'iptal', 'tamamlandi'];
        if (!validDurumlar.includes(durum)) {
            return res.status(400).json({ success: false, message: 'Geçersiz durum' });
        }

        // Önce mevcut randevu bilgilerini al (bildirim için)
        const [[randevu]] = await connection.execute(
            `SELECT r.*,
                    hp.ad as hasta_ad, hp.soyad as hasta_soyad, hp.telefon as hasta_telefon,
                    hu.email as hasta_email,
                    up.ad as uzman_ad, up.soyad as uzman_soyad, up.unvan as uzman_unvan,
                    up.telefon as uzman_telefon,
                    uu.email as uzman_email
             FROM randevular r
             INNER JOIN hasta_profiles hp ON r.hasta_profile_id = hp.id
             INNER JOIN users hu ON hp.user_id = hu.id
             INNER JOIN uzman_profiles up ON r.uzman_profile_id = up.id
             INNER JOIN users uu ON up.user_id = uu.id
             WHERE r.id = ?`,
            [id]
        );

        if (!randevu) {
            return res.status(404).json({ success: false, message: 'Randevu bulunamadı' });
        }

        // Uzman zaten kesin_tarih belirlediyse onu koruyoruz; sadece durum ve red_notu güncelliyoruz
        await connection.execute(
            `UPDATE randevular
             SET durum = ?,
                 red_notu = ?
             WHERE id = ?`,
            [durum, red_notu || null, id]
        );

        res.status(200).json({ success: true, message: 'Randevu güncellendi' });

        // Bildirimler (arka planda)
        setImmediate(async () => {
            try {
                const ctx = {
                    hastaAd: randevu.hasta_ad, hastaSoyad: randevu.hasta_soyad,
                    hastaEmail: randevu.hasta_email, hastaTelefon: randevu.hasta_telefon,
                    uzmanAd: randevu.uzman_ad, uzmanSoyad: randevu.uzman_soyad,
                    uzmanUnvan: randevu.uzman_unvan, uzmanEmail: randevu.uzman_email,
                    uzmanTelefon: randevu.uzman_telefon,
                    talep_tarihi: randevu.talep_tarihi, talep_turu: randevu.talep_turu,
                    kesin_tarih: randevu.kesin_tarih,
                    randevu_tipi: randevu.randevu_tipi, red_notu,
                };

                if (durum === 'onaylandi') {
                    // Hastaya bildirim
                    if (randevu.hasta_email) {
                        const { subject, html } = mailOnaylandiHasta(ctx);
                        await sendEmail({ to: randevu.hasta_email, subject, html });
                    }
                    if (randevu.hasta_telefon) {
                        await sendWhatsApp({ to: randevu.hasta_telefon, message: waOnaylandiHasta(ctx) });
                    }
                    // Uzmana bildirim
                    if (randevu.uzman_email) {
                        const { subject, html } = mailOnaylandiUzman(ctx);
                        await sendEmail({ to: randevu.uzman_email, subject, html });
                    }
                    if (randevu.uzman_telefon) {
                        await sendWhatsApp({ to: randevu.uzman_telefon, message: waOnaylandiUzman(ctx) });
                    }
                } else if (durum === 'reddedildi') {
                    // Sadece hastaya bildirim
                    if (randevu.hasta_email) {
                        const { subject, html } = mailReddedildiHasta(ctx);
                        await sendEmail({ to: randevu.hasta_email, subject, html });
                    }
                    if (randevu.hasta_telefon) {
                        await sendWhatsApp({ to: randevu.hasta_telefon, message: waReddedildiHasta(ctx) });
                    }
                }
            } catch (notifErr) {
                console.error('[Bildirim] Admin randevu bildirim hatası:', notifErr.message);
            }
        });
    } catch (error) {
        console.error('updateRandevuDurum error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    } finally {
        connection.release();
    }
};

// ─── YORUM YÖNETİMİ ──────────────────────────────────────────────────

export const getYorumlar = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const [yorumlar] = await pool.query(
            `SELECT 
                ur.id, ur.rating, ur.yorum, ur.created_at,
                ur.profesyonellik_puan, ur.iletisim_puan,
                ur.tedavi_etkinligi_puan, ur.anonim,
                hp.ad as hasta_ad, hp.soyad as hasta_soyad,
                up.ad as uzman_ad, up.soyad as uzman_soyad,
                up.unvan
             FROM uzman_reviews ur
             INNER JOIN hasta_profiles hp ON ur.hasta_profile_id = hp.id
             INNER JOIN uzman_profiles up ON ur.uzman_profile_id = up.id
             ORDER BY ur.created_at DESC
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [[{ total }]] = await pool.execute(
            'SELECT COUNT(*) as total FROM uzman_reviews'
        );

        res.status(200).json({
            success: true,
            data: { yorumlar, total, page: Number(page), limit: Number(limit) }
        });
    } catch (error) {
        console.error('getYorumlar error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

export const deleteYorum = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM uzman_reviews WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: 'Yorum silindi' });
    } catch (error) {
        console.error('deleteYorum error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

// ─── ASSESSMENT SORULARI ─────────────────────────────────────────────

export const getSorular = async (req, res) => {
    try {
        const [sorular] = await pool.execute(
            `SELECT id, soru_metni, soru_tipi, kategori, 
                    secenekler, min_deger, max_deger, sira_no, aktif
             FROM assessment_questions
             ORDER BY sira_no ASC, id ASC`
        );
        const parsed = sorular.map(s => ({
            ...s,
            secenekler: s.secenekler
                ? (typeof s.secenekler === 'string'
                    ? JSON.parse(s.secenekler)
                    : s.secenekler)
                : null
        }));
        res.status(200).json({ success: true, data: parsed });
    } catch (error) {
        console.error('getSorular error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

export const createSoru = async (req, res) => {
    try {
        const { soru_metni, soru_tipi, kategori,
                secenekler, min_deger, max_deger, sira_no } = req.body;

        const [result] = await pool.execute(
            `INSERT INTO assessment_questions
             (soru_metni, soru_tipi, kategori, secenekler, min_deger, max_deger, sira_no, aktif)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
            [
                soru_metni, soru_tipi, kategori || null,
                secenekler ? JSON.stringify(secenekler) : null,
                min_deger || null, max_deger || null, sira_no || 0
            ]
        );
        res.status(201).json({ success: true, data: { id: result.insertId } });
    } catch (error) {
        console.error('createSoru error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

export const updateSoru = async (req, res) => {
    try {
        const { id } = req.params;
        const { soru_metni, soru_tipi, kategori,
                secenekler, min_deger, max_deger, sira_no, aktif } = req.body;

        await pool.execute(
            `UPDATE assessment_questions SET
             soru_metni = ?, soru_tipi = ?, kategori = ?,
             secenekler = ?, min_deger = ?, max_deger = ?,
             sira_no = ?, aktif = ?
             WHERE id = ?`,
            [
                soru_metni, soru_tipi, kategori || null,
                secenekler ? JSON.stringify(secenekler) : null,
                min_deger || null, max_deger || null,
                sira_no || 0, aktif ? 1 : 0, id
            ]
        );
        res.status(200).json({ success: true, message: 'Soru güncellendi' });
    } catch (error) {
        console.error('updateSoru error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

export const deleteSoru = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute(
            'UPDATE assessment_questions SET aktif = 0 WHERE id = ?', [id]
        );
        res.status(200).json({ success: true, message: 'Soru pasife alındı' });
    } catch (error) {
        console.error('deleteSoru error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

// ─── PROFİL YÖNETİMİ ─────────────────────────────────────────────────

export const getHastalar = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const searchClause = search
            ? `AND (hp.ad LIKE ? OR hp.soyad LIKE ? OR u.email LIKE ?)`
            : '';
        const searchParams = search
            ? [`%${search}%`, `%${search}%`, `%${search}%`]
            : [];

        const [hastalar] = await pool.query(
                `SELECT 
                u.id as user_id, u.email, u.status, u.created_at,
                hp.id as profile_id, hp.ad, hp.soyad, hp.telefon,
                hp.sehir, hp.ilce, hp.agri_bolgesi, hp.tedavi_tercihi,
                hp.cinsiyet, hp.kronik_hastalik, hp.ameliyat_gecmisi,
                hp.profile_completed_at,
                (SELECT COUNT(*) FROM assessments a WHERE a.user_id = u.id) as assessment_sayisi,
                (SELECT COUNT(*) FROM randevular r 
                 WHERE r.hasta_profile_id = hp.id) as randevu_sayisi
             FROM users u
             INNER JOIN hasta_profiles hp ON u.id = hp.user_id
             WHERE u.role = 'hasta' ${searchClause}
             ORDER BY u.created_at DESC
             LIMIT ? OFFSET ?`,
            [...searchParams, limit, offset]
        );

        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) as total FROM users u
             INNER JOIN hasta_profiles hp ON u.id = hp.user_id
             WHERE u.role = 'hasta' ${searchClause}`,
            searchParams
        );

        res.status(200).json({
            success: true,
            data: { hastalar, total, page: Number(page) }
        });
    } catch (error) {
        console.error('getHastalar error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

export const getHastaDetail = async (req, res) => {
    try {
        const { id } = req.params;

        // Temel profil
        const [rows] = await pool.query(
            `SELECT 
                u.id as user_id, u.email, u.status, u.created_at,
                hp.id as profile_id,
                hp.ad, hp.soyad, hp.telefon, hp.kvkk_onay,
                hp.sehir, hp.ilce, hp.agri_bolgesi, hp.tedavi_tercihi,
                hp.dogum_tarihi, hp.cinsiyet, hp.agri_seviyesi,
                hp.ameliyat_gecmisi, hp.ameliyat_detay,
                hp.kronik_hastalik, hp.kronik_hastalik_detay,
                hp.surekli_ilac, hp.ilac_listesi, hp.alerjiler,
                hp.cinsiyet_tercihi, hp.profile_completed_at
             FROM users u
             INNER JOIN hasta_profiles hp ON u.id = hp.user_id
             WHERE u.id = ?`,
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Hasta bulunamadı' });
        }
        const hasta = rows[0];

        // Tıbbi raporlar
        const [raporlar] = await pool.query(
            `SELECT id, tip, dosya_url, aciklama, created_at
             FROM medical_reports
             WHERE hasta_profile_id = ?
             ORDER BY created_at DESC`,
            [hasta.profile_id]
        );

        // Değerlendirmeler (tam detay)
        const [assessments] = await pool.query(
            `SELECT 
                id, pain_region, pain_severity, pain_duration,
                pain_types, daily_activities_impact, sleep_impact,
                work_impact, social_impact, pain_triggers,
                pain_relievers, treatment_goals, expected_duration,
                additional_notes, recommended_specialists, created_at
             FROM assessments
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [id]
        );

        const safeJsonParse = (v) => {
            if (!v) return [];
            if (typeof v === 'object') return v;
            try { return JSON.parse(v); } catch { return []; }
        };

        const parsedAssessments = assessments.map(a => ({
            ...a,
            pain_types: safeJsonParse(a.pain_types),
            pain_triggers: safeJsonParse(a.pain_triggers),
            pain_relievers: safeJsonParse(a.pain_relievers),
            treatment_goals: safeJsonParse(a.treatment_goals),
            recommended_specialists: safeJsonParse(a.recommended_specialists),
        }));

        // Randevular
        const [randevular] = await pool.query(
            `SELECT r.*,
                    up.ad as uzman_ad, up.soyad as uzman_soyad,
                    up.unvan, up.uzmanlik_alani
             FROM randevular r
             INNER JOIN uzman_profiles up ON r.uzman_profile_id = up.id
             WHERE r.hasta_profile_id = ?
             ORDER BY r.created_at DESC`,
            [hasta.profile_id]
        );

        // Yorumlar (hastanın yazdıkları)
        const [yorumlar] = await pool.query(
            `SELECT ur.*, up.ad as uzman_ad, up.soyad as uzman_soyad, up.unvan
             FROM uzman_reviews ur
             INNER JOIN uzman_profiles up ON ur.uzman_profile_id = up.id
             WHERE ur.hasta_profile_id = ?
             ORDER BY ur.created_at DESC`,
            [hasta.profile_id]
        );

        res.status(200).json({
            success: true,
            data: {
                ...hasta,
                raporlar,
                assessments: parsedAssessments,
                randevular,
                yorumlar
            }
        });
    } catch (error) {
        console.error('getHastaDetail error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

export const getUzmanlar = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const status = req.query.status || '';
        const offset = (page - 1) * limit;


        const conditions = ["u.role = 'uzman'"];
        const params = [];

        if (search) {
            conditions.push(
                '(up.ad LIKE ? OR up.soyad LIKE ? OR u.email LIKE ?)'
            );
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (status) {
            conditions.push('u.status = ?');
            params.push(status);
        }

        const where = 'WHERE ' + conditions.join(' AND ');

        const [uzmanlar] = await pool.query(
            `SELECT 
                u.id as user_id, u.email, u.status, u.created_at,
                up.id as profile_id, up.ad, up.soyad, up.unvan,
                up.uzmanlik_alani, up.sehir, up.ilce,
                up.ortalama_rating, up.toplam_yorum_sayisi,
                up.toplam_randevu_sayisi, up.profile_completed_at,
                up.diploma_url, up.online_hizmet, up.evde_hizmet, up.klinik_hizmet
             FROM users u
             INNER JOIN uzman_profiles up ON u.id = up.user_id
             ${where}
             ORDER BY u.created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) as total FROM users u
             INNER JOIN uzman_profiles up ON u.id = up.user_id
             ${where}`,
            params
        );

        res.status(200).json({
            success: true,
            data: { uzmanlar, total, page: Number(page) }
        });
    } catch (error) {
        console.error('getUzmanlar error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

export const getTedaviPlanlariAdmin = async (req, res) => {
    try {
        const [planlar] = await pool.execute(
            `SELECT tp.id, tp.tedavi_turu, tp.seans_sayisi, tp.seans_ucreti, tp.toplam_ucret,
                    tp.notlar, tp.durum, tp.dekont_url, tp.created_at,
                    hp.ad AS hasta_ad, hp.soyad AS hasta_soyad,
                    up.ad AS uzman_ad, up.soyad AS uzman_soyad, up.unvan AS uzman_unvan
             FROM tedavi_planlari tp
             INNER JOIN hasta_profiles hp ON tp.hasta_profile_id = hp.id
             INNER JOIN uzman_profiles up ON tp.uzman_profile_id = up.id
             ORDER BY tp.created_at DESC`
        );
        res.status(200).json({ success: true, data: planlar });
    } catch (error) {
        console.error('getTedaviPlanlariAdmin error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

export const aktiveTedaviPlaniAdmin = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { id } = req.params;
        await conn.beginTransaction();

        const [result] = await conn.execute(
            `UPDATE tedavi_planlari SET durum = 'aktif' WHERE id = ? AND durum = 'dekont_yuklendi'`,
            [id]
        );
        if (result.affectedRows === 0) {
            await conn.rollback();
            conn.release();
            return res.status(404).json({ success: false, message: 'Plan bulunamadı veya güncellenemez' });
        }

        const [[plan]] = await conn.execute(
            'SELECT seans_sayisi FROM tedavi_planlari WHERE id = ?', [id]
        );
        for (let i = 1; i <= plan.seans_sayisi; i++) {
            await conn.execute(
                `INSERT INTO seanslar (tedavi_plani_id, seans_no, durum)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE durum = VALUES(durum)`,
                [id, i, i === 1 ? 'aktif' : 'bekliyor']
            );
        }

        await conn.commit();
        conn.release();
        res.status(200).json({ success: true, message: 'Tedavi planı aktifleştirildi' });
    } catch (error) {
        await conn.rollback();
        conn.release();
        console.error('aktiveTedaviPlaniAdmin error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

// ─── AKTİF EŞLEŞMELer ─────────────────────────────────────────────────────

export const getAktifEslesmeler = async (req, res) => {
    try {
        const [planlar] = await pool.execute(
            `SELECT tp.id, tp.tedavi_turu, tp.seans_sayisi, tp.toplam_ucret, tp.created_at,
                    hp.ad AS hasta_ad, hp.soyad AS hasta_soyad, hp.telefon AS hasta_telefon,
                    hu.email AS hasta_email,
                    up.ad AS uzman_ad, up.soyad AS uzman_soyad, up.unvan AS uzman_unvan,
                    (SELECT COUNT(*) FROM seanslar s WHERE s.tedavi_plani_id = tp.id) AS toplam_seans,
                    (SELECT COUNT(*) FROM seanslar s WHERE s.tedavi_plani_id = tp.id AND s.durum = 'tamamlandi') AS tamamlanan_seans
             FROM tedavi_planlari tp
             INNER JOIN hasta_profiles hp ON tp.hasta_profile_id = hp.id
             INNER JOIN users hu ON hp.user_id = hu.id
             INNER JOIN uzman_profiles up ON tp.uzman_profile_id = up.id
             WHERE tp.durum = 'aktif'
             ORDER BY tp.created_at DESC`
        );
        res.status(200).json({ success: true, data: planlar });
    } catch (error) {
        console.error('getAktifEslesmeler error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

export const getAdminEslesmeSeanslari = async (req, res) => {
    try {
        const { planId } = req.params;
        const [seanslar] = await pool.execute(
            `SELECT s.* FROM seanslar s
             INNER JOIN tedavi_planlari tp ON s.tedavi_plani_id = tp.id
             WHERE s.tedavi_plani_id = ? AND tp.durum = 'aktif'
             ORDER BY s.seans_no ASC`,
            [planId]
        );
        res.status(200).json({ success: true, data: seanslar });
    } catch (error) {
        console.error('getAdminEslesmeSeanslari error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

// ─── SİSTEM IBAN ─────────────────────────────────────────────────────

export const getSistemIban = async (req, res) => {
    try {
        const [[row]] = await pool.execute('SELECT * FROM sistem_ayarlari WHERE id = 1');
        res.status(200).json({ success: true, data: row || {} });
    } catch (error) {
        console.error('getSistemIban error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

export const setSistemIban = async (req, res) => {
    try {
        const { sistem_iban, iban_ad_soyad, iban_banka_adi } = req.body;
        if (!sistem_iban || sistem_iban.trim().length < 10) {
            return res.status(400).json({ success: false, message: 'Geçerli bir IBAN giriniz' });
        }
        await pool.execute(
            `INSERT INTO sistem_ayarlari (id, sistem_iban, iban_ad_soyad, iban_banka_adi, updated_at)
             VALUES (1, ?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE
             sistem_iban = VALUES(sistem_iban),
             iban_ad_soyad = VALUES(iban_ad_soyad),
             iban_banka_adi = VALUES(iban_banka_adi),
             updated_at = NOW()`,
            [sistem_iban.trim().toUpperCase(), iban_ad_soyad || null, iban_banka_adi || null]
        );
        res.status(200).json({ success: true, message: 'Sistem IBAN güncellendi' });
    } catch (error) {
        console.error('setSistemIban error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

export const getUzmanDetail = async (req, res) => {
    try {
        const { id } = req.params;

        // Temel profil
        const [rows] = await pool.query(
            `SELECT
                u.id as user_id, u.email, u.status, u.created_at,
                up.id as profile_id,
                up.ad, up.soyad, up.unvan, up.telefon,
                up.dogum_tarihi, up.cinsiyet,
                up.profil_fotograf_url, up.biyografi,
                up.mezuniyet_okul, up.mezuniyet_yili,
                up.sehir, up.ilce,
                up.uzmanlik_alani,
                up.online_hizmet, up.evde_hizmet, up.klinik_hizmet,
                up.seans_ucreti_min, up.seans_ucreti_max,
                up.online_seans_ucreti, up.evde_seans_ucreti,
                up.ortalama_rating, up.toplam_yorum_sayisi,
                up.toplam_randevu_sayisi,
                up.diploma_url, up.kvkk_onay, up.sozlesme_onay,
                up.iban_no, up.iban_ad_soyad,
                up.profile_completed_at
             FROM users u
             INNER JOIN uzman_profiles up ON u.id = up.user_id
             WHERE u.id = ?`,
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Uzman bulunamadı' });
        }
        const uzman = rows[0];

        // Sertifikalar
        const [sertifikalar] = await pool.query(
            `SELECT id, adi, dosya_url, created_at
             FROM sertifikalar
             WHERE uzman_profile_id = ?
             ORDER BY created_at DESC`,
            [uzman.profile_id]
        );

        // Uzmanlık alanları
        const [uzmanlikAlanlari] = await pool.query(
            `SELECT id, kategori, deger
             FROM uzmanlik_alanlari
             WHERE uzman_profile_id = ?
             ORDER BY kategori`,
            [uzman.profile_id]
        );

        // Kategoriye göre grupla
        const grupluAlanlar = uzmanlikAlanlari.reduce((acc, item) => {
            if (!acc[item.kategori]) acc[item.kategori] = [];
            acc[item.kategori].push(item.deger);
            return acc;
        }, {});

        // Yorumlar (tam detay)
        const [yorumlar] = await pool.query(
            `SELECT 
                ur.id, ur.rating, ur.yorum, ur.created_at,
                ur.profesyonellik_puan, ur.iletisim_puan,
                ur.tedavi_etkinligi_puan, ur.zamaninda_gelme_puan,
                ur.anonim,
                hp.ad as hasta_ad, hp.soyad as hasta_soyad
             FROM uzman_reviews ur
             INNER JOIN hasta_profiles hp ON ur.hasta_profile_id = hp.id
             WHERE ur.uzman_profile_id = ?
             ORDER BY ur.created_at DESC`,
            [uzman.profile_id]
        );

        // Randevular (son 20)
        const [randevular] = await pool.query(
            `SELECT 
                r.id, r.talep_tarihi, r.talep_turu, r.durum,
                r.hasta_notu, r.kesin_tarih, r.created_at,
                hp.ad as hasta_ad, hp.soyad as hasta_soyad,
                hp.telefon as hasta_telefon
             FROM randevular r
             INNER JOIN hasta_profiles hp ON r.hasta_profile_id = hp.id
             WHERE r.uzman_profile_id = ?
             ORDER BY r.created_at DESC
             LIMIT 20`,
            [uzman.profile_id]
        );

        // Makale sayısı
        const [[{ makale_sayisi }]] = await pool.query(
            `SELECT COUNT(*) as makale_sayisi
             FROM articles
             WHERE uzman_id = ? AND yayinlanma_durumu = 'yayinda'`,
            [id]
        );

        res.status(200).json({
            success: true,
            data: {
                ...uzman,
                uzmanlikAlanlari: grupluAlanlar,
                sertifikalar,
                yorumlar,
                randevular,
                makale_sayisi
            }
        });
    } catch (error) {
        console.error('getUzmanDetail error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};
