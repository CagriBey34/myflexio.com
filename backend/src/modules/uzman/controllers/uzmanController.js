/**
 * Uzman Controller
 * Handles uzman registration, profile completion, and management
 */

import bcrypt from 'bcryptjs';
import pool from '../../../config/db.js';
import { generateTokens } from '../../../core/auth/utils/jwtUtils.js';
import { sendEmail, mailKesinTarihHasta } from '../../../core/notifications/emailService.js';
import { sendWhatsApp, waKesinTarihHasta } from '../../../core/notifications/whatsappService.js';

/**
 * Register new uzman
 * POST /api/uzman/register
 */
export const registerUzman = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { email, sifre, ad, soyad, unvan, telefon, kvkkOnay, sozlesmeOnay } = req.body;

        await connection.beginTransaction();

        // Check if user already exists
        const [existingUsers] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            await connection.rollback();
            return res.status(409).json({
                success: false,
                message: 'Bu email adresi zaten kayıtlı'
            });
        }

        // Check if diploma file was uploaded
        if (!req.file) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Diploma dosyası yüklenmelidir'
            });
        }

        const diplomaUrl = `/uploads/diplomas/${req.file.filename}`;

        // Hash password
        const hashedPassword = await bcrypt.hash(sifre, 10);

        // Convert string booleans to actual booleans
        const kvkkOnayBool = kvkkOnay === 'true' || kvkkOnay === true;
        const sozlesmeOnayBool = sozlesmeOnay === 'true' || sozlesmeOnay === true;

        // Insert user with pending_approval status
        const [userResult] = await connection.execute(
            'INSERT INTO users (email, password, role, status) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, 'uzman', 'pending_approval']
        );

        const userId = userResult.insertId;

        // Insert uzman profile
        await connection.execute(
            `INSERT INTO uzman_profiles 
       (user_id, ad, soyad, unvan, telefon, diploma_url, kvkk_onay, sozlesme_onay) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, ad, soyad, unvan, telefon, diplomaUrl, kvkkOnayBool, sozlesmeOnayBool]
        );

        await connection.commit();

        // Generate tokens
        const tokens = generateTokens({
            id: userId,
            email,
            role: 'uzman',
            status: 'pending_approval'
        });

        res.status(201).json({
            success: true,
            message: 'Uzman kaydı başarılı. Admin onayı bekleniyor.',
            data: {
                user: {
                    id: userId,
                    email,
                    role: 'uzman',
                    status: 'pending_approval'
                },
                ...tokens
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Uzman register error:', error);
        res.status(500).json({
            success: false,
            message: 'Kayıt sırasında bir hata oluştu'
        });
    } finally {
        connection.release();
    }
};

/**
 * Complete uzman profile (after approval)
 * POST /api/uzman/profile/complete
 */
export const completeProfile = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const userId = req.user.id;
        const {
            dogumTarihi,
            cinsiyet,
            biyografi,
            mezuniyetOkul,
            mezuniyetYili,
            sehir,
            ilce,
            uzmanlikAlanlari,
            sertifikalar,
            onlineSeansucreti,
            evdeSeansucreti,
            ibanNo,
            ibanAdSoyad
        } = req.body;

        await connection.beginTransaction();

        // Only update photo if a new one was uploaded
        const profilFotografUrl = req.files?.profilFotograf
            ? `/uploads/profil-fotograflar/${req.files.profilFotograf[0].filename}`
            : null;

        const updateFields = [
            'dogum_tarihi = ?', 'cinsiyet = ?', 'biyografi = ?',
            'mezuniyet_okul = ?', 'mezuniyet_yili = ?', 'sehir = ?', 'ilce = ?',
            'online_seans_ucreti = ?', 'evde_seans_ucreti = ?', 'iban_no = ?', 'iban_ad_soyad = ?',
            'profile_completed_at = NOW()'
        ];
        const updateValues = [
            dogumTarihi, cinsiyet, biyografi,
            mezuniyetOkul, mezuniyetYili, sehir, ilce,
            onlineSeansucreti || null, evdeSeansucreti || null, ibanNo || null, ibanAdSoyad || null
        ];

        if (profilFotografUrl) {
            updateFields.splice(2, 0, 'profil_fotograf_url = ?');
            updateValues.splice(2, 0, profilFotografUrl);
        }
        updateValues.push(userId);

        await connection.execute(
            `UPDATE uzman_profiles SET ${updateFields.join(', ')} WHERE user_id = ?`,
            updateValues
        );

        // Get uzman profile id
        const [profiles] = await connection.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?',
            [userId]
        );
        const profileId = profiles[0].id;

        // Delete existing uzmanlik alanlari before re-inserting (prevent duplicates on edit)
        if (uzmanlikAlanlari) {
            await connection.execute(
                'DELETE FROM uzmanlik_alanlari WHERE uzman_profile_id = ?',
                [profileId]
            );

            const parsedAlanlari = typeof uzmanlikAlanlari === 'string'
                ? JSON.parse(uzmanlikAlanlari)
                : uzmanlikAlanlari;

            for (const [kategori, degerler] of Object.entries(parsedAlanlari)) {
                if (Array.isArray(degerler)) {
                    for (const deger of degerler) {
                        await connection.execute(
                            'INSERT INTO uzmanlik_alanlari (uzman_profile_id, kategori, deger) VALUES (?, ?, ?)',
                            [profileId, kategori, deger]
                        );
                    }
                }
            }
        }

        // Handle sertifika uploads
        if (req.files?.sertifika) {
            const sertifikaData = typeof sertifikalar === 'string'
                ? JSON.parse(sertifikalar)
                : sertifikalar || [];

            for (let i = 0; i < req.files.sertifika.length; i++) {
                const file = req.files.sertifika[i];
                const sertifikaAdi = sertifikaData[i]?.adi || `Sertifika ${i + 1}`;
                const dosyaUrl = `/uploads/sertifikalar/${file.filename}`;

                await connection.execute(
                    'INSERT INTO sertifikalar (uzman_profile_id, adi, dosya_url) VALUES (?, ?, ?)',
                    [profileId, sertifikaAdi, dosyaUrl]
                );
            }
        }

        // Update user status to active
        await connection.execute(
            'UPDATE users SET status = ? WHERE id = ?',
            ['active', userId]
        );

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Profil başarıyla tamamlandı'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Complete profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Profil tamamlanırken bir hata oluştu'
        });
    } finally {
        connection.release();
    }
};

/**
 * Get uzman profile
 * GET /api/uzman/profile
 */
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user and profile data
        const [profiles] = await pool.execute(
            `SELECT u.id, u.email, u.role, u.status, u.created_at,
              up.ad, up.soyad, up.unvan, up.telefon, up.diploma_url,
              up.dogum_tarihi, up.cinsiyet, up.profil_fotograf_url, up.biyografi,
              up.mezuniyet_okul, up.mezuniyet_yili, up.sehir, up.ilce,
              up.online_seans_ucreti, up.evde_seans_ucreti, up.iban_no,
              up.profile_completed_at
       FROM users u
       LEFT JOIN uzman_profiles up ON u.id = up.user_id
       WHERE u.id = ? AND u.role = 'uzman'`,
            [userId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Profil bulunamadı'
            });
        }

        const profile = profiles[0];
        const profileId = await pool.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?',
            [userId]
        );

        if (profileId[0].length > 0) {
            // Get uzmanlik alanlari
            const [alanlari] = await pool.execute(
                'SELECT kategori, deger FROM uzmanlik_alanlari WHERE uzman_profile_id = ?',
                [profileId[0][0].id]
            );

            // Group by kategori
            const uzmanlikAlanlari = alanlari.reduce((acc, item) => {
                if (!acc[item.kategori]) {
                    acc[item.kategori] = [];
                }
                acc[item.kategori].push(item.deger);
                return acc;
            }, {});

            // Get sertifikalar
            const [sertifikalar] = await pool.execute(
                'SELECT id, adi, dosya_url, created_at FROM sertifikalar WHERE uzman_profile_id = ?',
                [profileId[0][0].id]
            );

            profile.uzmanlikAlanlari = uzmanlikAlanlari;
            profile.sertifikalar = sertifikalar;
        }

        const [makaleler] = await pool.execute(
            `SELECT id, baslik, created_at 
             FROM articles 
             WHERE uzman_id = ? AND yayinlanma_durumu = 'yayinda'
             ORDER BY created_at DESC
             LIMIT 5`,
            [userId]
        );
        profile.makaleler = makaleler;

        // Reviews
        const [reviews] = await pool.execute(
            `SELECT r.id, r.rating, r.comment, r.created_at,
                    hp.ad as hastaAd, hp.soyad as hastaSoyad
             FROM reviews r
             INNER JOIN users u ON r.hasta_id = u.id
             INNER JOIN hasta_profiles hp ON u.id = hp.user_id
             WHERE r.uzman_id = ?
             ORDER BY r.created_at DESC`,
            [userId]
        );
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
        profile.avgRating = Math.round(avgRating * 10) / 10;
        profile.totalReviews = reviews.length;
        profile.reviews = reviews;

        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Profil alınırken bir hata oluştu'
        });
    }
};

/**
 * Get uzman's appointments
 * GET /api/uzman/randevular
 */
export const getUzmanRandevular = async (req, res) => {
    try {
        const userId = req.user.id;

        const [profiles] = await pool.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?', [userId]
        );
        if (profiles.length === 0) {
            return res.status(404).json({ success: false, message: 'Uzman profili bulunamadı' });
        }
        const uzman_profile_id = profiles[0].id;

        const [randevular] = await pool.execute(
            `SELECT r.*,
                    hp.ad as hasta_ad, hp.soyad as hasta_soyad,
                    hp.telefon as hasta_telefon,
                    hp.sehir as hasta_sehir, hp.ilce as hasta_ilce,
                    hp.dogum_tarihi as hasta_dogum_tarihi,
                    hp.cinsiyet as hasta_cinsiyet,
                    hp.agri_bolgesi as hasta_agri_bolgesi,
                    hp.agri_seviyesi as hasta_agri_seviyesi,
                    hp.tedavi_tercihi as hasta_tedavi_tercihi,
                    hp.kronik_hastalik as hasta_kronik_hastalik,
                    hp.kronik_hastalik_detay as hasta_kronik_hastalik_detay,
                    hp.ameliyat_gecmisi as hasta_ameliyat_gecmisi,
                    hp.ameliyat_detay as hasta_ameliyat_detay,
                    hp.surekli_ilac as hasta_surekli_ilac,
                    hp.ilac_listesi as hasta_ilac_listesi,
                    hp.alerjiler as hasta_alerjiler,
                    u.email as hasta_email,
                    (SELECT COUNT(*) FROM tedavi_planlari
                     WHERE uzman_profile_id = r.uzman_profile_id
                       AND hasta_profile_id = r.hasta_profile_id
                       AND durum = 'aktif') > 0 as eslesme_var,
                    (SELECT COUNT(*) FROM tedavi_planlari
                     WHERE randevu_id = r.id) > 0 as plan_gonderildi
             FROM randevular r
             INNER JOIN hasta_profiles hp ON r.hasta_profile_id = hp.id
             INNER JOIN users u ON hp.user_id = u.id
             WHERE r.uzman_profile_id = ?
             ORDER BY r.created_at DESC`,
            [uzman_profile_id]
        );

        res.status(200).json({ success: true, data: randevular });
    } catch (error) {
        console.error('getUzmanRandevular error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

/**
 * Uzman onaylanan randevu için kesin tarih/saat belirler
 * PATCH /api/uzman/randevular/:id/kesin-tarih
 */
export const setKesinTarih = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { kesin_tarih } = req.body;

        if (!kesin_tarih) {
            return res.status(400).json({ success: false, message: 'Kesin tarih zorunludur' });
        }

        const [profiles] = await pool.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?', [userId]
        );
        if (profiles.length === 0) {
            return res.status(404).json({ success: false, message: 'Uzman profili bulunamadı' });
        }
        const uzman_profile_id = profiles[0].id;

        // Bildirim için randevu + hasta + uzman bilgilerini al
        const [[randevu]] = await pool.execute(
            `SELECT r.talep_turu, r.randevu_tipi,
                    hp.ad as hasta_ad, hp.soyad as hasta_soyad, hp.telefon as hasta_telefon,
                    hu.email as hasta_email,
                    up.ad as uzman_ad, up.soyad as uzman_soyad, up.unvan as uzman_unvan
             FROM randevular r
             INNER JOIN hasta_profiles hp ON r.hasta_profile_id = hp.id
             INNER JOIN users hu ON hp.user_id = hu.id
             INNER JOIN uzman_profiles up ON r.uzman_profile_id = up.id
             WHERE r.id = ? AND r.uzman_profile_id = ? AND r.durum IN ('beklemede', 'onaylandi')`,
            [id, uzman_profile_id]
        );

        if (!randevu) {
            return res.status(404).json({ success: false, message: 'Randevu bulunamadı veya güncellenemez' });
        }

        const yeniDurum = randevu.randevu_tipi === 'on_gorusme' ? 'onaylandi' : null;

        const [result] = await pool.execute(
            `UPDATE randevular
             SET kesin_tarih = ?${yeniDurum ? ', durum = ?' : ''}
             WHERE id = ? AND uzman_profile_id = ? AND durum IN ('beklemede', 'onaylandi')`,
            yeniDurum
                ? [kesin_tarih, yeniDurum, id, uzman_profile_id]
                : [kesin_tarih, id, uzman_profile_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Randevu bulunamadı veya güncellenemez' });
        }

        res.status(200).json({ success: true, message: 'Kesin tarih belirlendi' });

        // Hastaya bildirim (arka planda)
        setImmediate(async () => {
            try {
                const ctx = {
                    hastaAd: randevu.hasta_ad,
                    uzmanUnvan: randevu.uzman_unvan,
                    uzmanAd: randevu.uzman_ad,
                    uzmanSoyad: randevu.uzman_soyad,
                    kesin_tarih,
                    talep_turu: randevu.talep_turu,
                };
                if (randevu.hasta_email) {
                    const { subject, html } = mailKesinTarihHasta(ctx);
                    await sendEmail({ to: randevu.hasta_email, subject, html });
                }
                if (randevu.hasta_telefon) {
                    await sendWhatsApp({ to: randevu.hasta_telefon, message: waKesinTarihHasta(ctx) });
                }
            } catch (notifErr) {
                console.error('[Bildirim] Kesin tarih bildirim hatası:', notifErr.message);
            }
        });
    } catch (error) {
        console.error('setKesinTarih error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

/**
 * Create treatment plan for a patient
 * POST /api/uzman/tedavi-plani
 */
export const createTedaviPlani = async (req, res) => {
    try {
        const userId = req.user.id;
        const { hastaProfileId, randevuId, tedaviTuru, seansSayisi, notlar } = req.body;

        if (!hastaProfileId || !tedaviTuru || !seansSayisi) {
            return res.status(400).json({ success: false, message: 'Eksik alanlar: hastaProfileId, tedaviTuru, seansSayisi zorunludur' });
        }
        if (!['online', 'evde'].includes(tedaviTuru)) {
            return res.status(400).json({ success: false, message: 'tedaviTuru online veya evde olmalıdır' });
        }

        const [uzmanRows] = await pool.execute(
            'SELECT id, online_seans_ucreti, evde_seans_ucreti FROM uzman_profiles WHERE user_id = ?',
            [userId]
        );
        if (uzmanRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Uzman profili bulunamadı' });
        }
        const uzmanProfile = uzmanRows[0];

        const seansUcreti = tedaviTuru === 'online'
            ? parseFloat(uzmanProfile.online_seans_ucreti || 0)
            : parseFloat(uzmanProfile.evde_seans_ucreti || 0);

        const toplamUcret = seansUcreti * parseInt(seansSayisi);

        await pool.execute(
            `INSERT INTO tedavi_planlari
             (uzman_profile_id, hasta_profile_id, randevu_id, tedavi_turu, seans_sayisi, seans_ucreti, toplam_ucret, notlar)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [uzmanProfile.id, hastaProfileId, randevuId || null, tedaviTuru, seansSayisi, seansUcreti, toplamUcret, notlar || null]
        );

        res.status(201).json({ success: true, message: 'Tedavi planı oluşturuldu' });
    } catch (error) {
        console.error('createTedaviPlani error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

/**
 * Get uzman's treatment plans with patient info and payment status
 * GET /api/uzman/tedavi-planlari
 */
export const getUzmanTedaviPlanlari = async (req, res) => {
    try {
        const userId = req.user.id;

        const [uzmanRows] = await pool.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?', [userId]
        );
        if (uzmanRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Uzman profili bulunamadı' });
        }
        const uzmanProfileId = uzmanRows[0].id;

        const [planlar] = await pool.execute(
            `SELECT tp.id, tp.tedavi_turu, tp.seans_sayisi, tp.seans_ucreti, tp.toplam_ucret,
                    tp.notlar, tp.durum, tp.dekont_url, tp.created_at,
                    hp.ad AS hasta_ad, hp.soyad AS hasta_soyad, hp.telefon AS hasta_telefon
             FROM tedavi_planlari tp
             INNER JOIN hasta_profiles hp ON tp.hasta_profile_id = hp.id
             WHERE tp.uzman_profile_id = ?
             ORDER BY tp.created_at DESC`,
            [uzmanProfileId]
        );

        res.status(200).json({ success: true, data: planlar });
    } catch (error) {
        console.error('getUzmanTedaviPlanlari error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

/**
 * Tedavi planını aktifleştir ve seanslar oluştur
 * @param {number} planId
 * @param {object} conn - pool connection
 */
async function createSeanslariForPlan(planId, conn) {
    const [[plan]] = await conn.execute(
        'SELECT seans_sayisi FROM tedavi_planlari WHERE id = ?', [planId]
    );
    if (!plan) throw new Error('Plan bulunamadı');

    const inserts = [];
    for (let i = 1; i <= plan.seans_sayisi; i++) {
        inserts.push([planId, i, i === 1 ? 'aktif' : 'bekliyor']);
    }
    for (const row of inserts) {
        await conn.execute(
            `INSERT INTO seanslar (tedavi_plani_id, seans_no, durum)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE durum = VALUES(durum)`,
            row
        );
    }
}

/**
 * Activate a treatment plan after reviewing dekont
 * PATCH /api/uzman/tedavi-plani/:id/aktifet
 */
export const aktiveTedaviPlani = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const [uzmanRows] = await conn.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?', [userId]
        );
        if (uzmanRows.length === 0) {
            conn.release();
            return res.status(404).json({ success: false, message: 'Uzman profili bulunamadı' });
        }
        const uzmanProfileId = uzmanRows[0].id;

        await conn.beginTransaction();

        const [result] = await conn.execute(
            `UPDATE tedavi_planlari SET durum = 'aktif'
             WHERE id = ? AND uzman_profile_id = ? AND durum = 'dekont_yuklendi'`,
            [id, uzmanProfileId]
        );

        if (result.affectedRows === 0) {
            await conn.rollback();
            conn.release();
            return res.status(404).json({ success: false, message: 'Plan bulunamadı veya güncellenemez' });
        }

        await createSeanslariForPlan(id, conn);

        await conn.commit();
        conn.release();
        res.status(200).json({ success: true, message: 'Tedavi planı aktifleştirildi' });
    } catch (error) {
        await conn.rollback();
        conn.release();
        console.error('aktiveTedaviPlani error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

/**
 * Uzman seans verdiğini onaylar
 * PATCH /api/uzman/randevular/:id/seans-ver
 */
export const uzmanSeansVer = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const [profiles] = await pool.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?', [userId]
        );
        if (profiles.length === 0) {
            return res.status(404).json({ success: false, message: 'Uzman profili bulunamadı' });
        }
        const uzman_profile_id = profiles[0].id;

        const [[randevu]] = await pool.execute(
            'SELECT id, uzman_seans_onayladi FROM randevular WHERE id = ? AND uzman_profile_id = ?',
            [id, uzman_profile_id]
        );

        if (!randevu) {
            return res.status(404).json({ success: false, message: 'Randevu bulunamadı' });
        }
        if (randevu.uzman_seans_onayladi) {
            return res.status(400).json({ success: false, message: 'Seans zaten onaylanmış' });
        }

        await pool.execute(
            'UPDATE randevular SET uzman_seans_onayladi = 1, uzman_seans_onaylama_tarihi = NOW() WHERE id = ?',
            [id]
        );

        res.status(200).json({ success: true, message: 'Seans onaylandı' });
    } catch (error) {
        console.error('uzmanSeansVer error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

/**
 * Update uzman IBAN
 * PATCH /api/uzman/profile/iban
 */
export const updateIban = async (req, res) => {
    try {
        const userId = req.user.id;
        const { ibanNo, ibanAdSoyad } = req.body;

        if (!ibanNo || typeof ibanNo !== 'string' || ibanNo.trim().length < 10) {
            return res.status(400).json({ success: false, message: 'Geçerli bir IBAN giriniz' });
        }

        await pool.execute(
            'UPDATE uzman_profiles SET iban_no = ?, iban_ad_soyad = ? WHERE user_id = ?',
            [ibanNo.trim().toUpperCase(), ibanAdSoyad?.trim() || null, userId]
        );

        res.status(200).json({ success: true, message: 'IBAN güncellendi' });
    } catch (error) {
        console.error('updateIban error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

/**
 * Aktif tedavi planları (eşleşmeler) listesi
 * GET /api/uzman/eslesmeler
 */
export const getUzmanEslesmeler = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?', [req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Uzman profili bulunamadı' });
        const uzmanProfileId = rows[0].id;

        const [planlar] = await pool.execute(
            `SELECT tp.id, tp.tedavi_turu, tp.seans_sayisi, tp.toplam_ucret, tp.created_at,
                    hp.id AS hasta_profile_id, hp.ad AS hasta_ad, hp.soyad AS hasta_soyad,
                    hp.telefon AS hasta_telefon,
                    u.email AS hasta_email,
                    (SELECT COUNT(*) FROM seanslar s WHERE s.tedavi_plani_id = tp.id) AS toplam_seans,
                    (SELECT COUNT(*) FROM seanslar s WHERE s.tedavi_plani_id = tp.id AND s.durum = 'tamamlandi') AS tamamlanan_seans,
                    (SELECT MIN(s2.id) FROM seanslar s2 WHERE s2.tedavi_plani_id = tp.id AND s2.durum = 'aktif') AS aktif_seans_id
             FROM tedavi_planlari tp
             INNER JOIN hasta_profiles hp ON tp.hasta_profile_id = hp.id
             INNER JOIN users u ON hp.user_id = u.id
             WHERE tp.uzman_profile_id = ? AND tp.durum = 'aktif'
             ORDER BY tp.created_at DESC`,
            [uzmanProfileId]
        );
        res.status(200).json({ success: true, data: planlar });
    } catch (error) {
        console.error('getUzmanEslesmeler error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

/**
 * Bir eşleşmeye ait tüm seanslar
 * GET /api/uzman/eslesmeler/:planId/seanslar
 */
export const getEslesmeSeanslariUzman = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?', [req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Uzman profili bulunamadı' });
        const uzmanProfileId = rows[0].id;

        const { planId } = req.params;
        const [[plan]] = await pool.execute(
            'SELECT id FROM tedavi_planlari WHERE id = ? AND uzman_profile_id = ? AND durum = "aktif"',
            [planId, uzmanProfileId]
        );
        if (!plan) return res.status(403).json({ success: false, message: 'Plan bulunamadı' });

        const [seanslar] = await pool.execute(
            `SELECT * FROM seanslar WHERE tedavi_plani_id = ? ORDER BY seans_no ASC`,
            [planId]
        );
        res.status(200).json({ success: true, data: seanslar });
    } catch (error) {
        console.error('getEslesmeSeanslariUzman error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

/**
 * Seans tarihi belirle
 * PATCH /api/uzman/seanslar/:seansId/tarih
 */
export const setSeansTargihi = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?', [req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Uzman profili bulunamadı' });
        const uzmanProfileId = rows[0].id;

        const { seansId } = req.params;
        const { tarih } = req.body;

        const [[seans]] = await pool.execute(
            `SELECT s.id, s.durum FROM seanslar s
             INNER JOIN tedavi_planlari tp ON s.tedavi_plani_id = tp.id
             WHERE s.id = ? AND tp.uzman_profile_id = ?`,
            [seansId, uzmanProfileId]
        );
        if (!seans) return res.status(404).json({ success: false, message: 'Seans bulunamadı' });
        if (seans.durum !== 'aktif') return res.status(400).json({ success: false, message: 'Sadece aktif seansa tarih belirlenebilir' });

        await pool.execute('UPDATE seanslar SET tarih = ? WHERE id = ?', [tarih, seansId]);
        res.status(200).json({ success: true, message: 'Tarih kaydedildi' });
    } catch (error) {
        console.error('setSeansTargihi error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

/**
 * Uzman seansı onaylar — her iki taraf onaylarsa seans tamamlanır, sıradaki aktifleşir
 * PATCH /api/uzman/seanslar/:seansId/seans-ver
 */
export const uzmanSeansOnay = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?', [req.user.id]
        );
        if (rows.length === 0) { conn.release(); return res.status(404).json({ success: false, message: 'Uzman profili bulunamadı' }); }
        const uzmanProfileId = rows[0].id;

        const { seansId } = req.params;
        const [[seans]] = await conn.execute(
            `SELECT s.* FROM seanslar s
             INNER JOIN tedavi_planlari tp ON s.tedavi_plani_id = tp.id
             WHERE s.id = ? AND tp.uzman_profile_id = ?`,
            [seansId, uzmanProfileId]
        );
        if (!seans) { conn.release(); return res.status(404).json({ success: false, message: 'Seans bulunamadı' }); }
        if (seans.durum !== 'aktif') { conn.release(); return res.status(400).json({ success: false, message: 'Seans aktif değil' }); }
        if (seans.uzman_seans_onayladi) { conn.release(); return res.status(400).json({ success: false, message: 'Zaten onaylandı' }); }

        await conn.beginTransaction();
        await conn.execute(
            'UPDATE seanslar SET uzman_seans_onayladi = 1, uzman_seans_onaylama_tarihi = NOW() WHERE id = ?',
            [seansId]
        );

        if (seans.hasta_seans_onayladi) {
            await conn.execute(`UPDATE seanslar SET durum = 'tamamlandi' WHERE id = ?`, [seansId]);
            await conn.execute(
                `UPDATE seanslar SET durum = 'aktif'
                 WHERE tedavi_plani_id = ? AND seans_no = ? AND durum = 'bekliyor'`,
                [seans.tedavi_plani_id, seans.seans_no + 1]
            );
        }
        await conn.commit();
        conn.release();
        res.status(200).json({ success: true, message: 'Seans onaylandı' });
    } catch (error) {
        await conn.rollback();
        conn.release();
        console.error('uzmanSeansOnay error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

/**
 * GET /api/uzman/hasta/:hastaProfileId/raporlar
 * Uzmanın randevusu olan hastanın tıbbi raporlarını getirir
 */
export const getHastaRaporlari = async (req, res) => {
    try {
        const userId = req.user.id;
        const { hastaProfileId } = req.params;

        const [profiles] = await pool.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?', [userId]
        );
        if (profiles.length === 0) {
            return res.status(404).json({ success: false, message: 'Uzman profili bulunamadı' });
        }
        const uzman_profile_id = profiles[0].id;

        // Uzmanın bu hastayla randevusu olup olmadığını kontrol et
        const [check] = await pool.execute(
            'SELECT id FROM randevular WHERE uzman_profile_id = ? AND hasta_profile_id = ? LIMIT 1',
            [uzman_profile_id, hastaProfileId]
        );
        if (check.length === 0) {
            return res.status(403).json({ success: false, message: 'Bu hastanın raporlarına erişim yetkiniz yok' });
        }

        const [raporlar] = await pool.execute(
            'SELECT id, tip, dosya_url, aciklama, created_at FROM medical_reports WHERE hasta_profile_id = ? ORDER BY created_at DESC',
            [hastaProfileId]
        );

        res.status(200).json({ success: true, data: raporlar });
    } catch (error) {
        console.error('getHastaRaporlari error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};
