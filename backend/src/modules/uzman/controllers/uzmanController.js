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
            sertifikalar
        } = req.body;

        await connection.beginTransaction();

        // Get profile foto if uploaded
        const profilFotografUrl = req.files?.profilFotograf
            ? `/uploads/profil-fotograflar/${req.files.profilFotograf[0].filename}`
            : null;

        // Update uzman profile
        await connection.execute(
            `UPDATE uzman_profiles SET 
       dogum_tarihi = ?, cinsiyet = ?, profil_fotograf_url = ?, biyografi = ?,
       mezuniyet_okul = ?, mezuniyet_yili = ?, sehir = ?, ilce = ?,
       profile_completed_at = NOW()
       WHERE user_id = ?`,
            [dogumTarihi, cinsiyet, profilFotografUrl, biyografi, mezuniyetOkul, mezuniyetYili, sehir, ilce, userId]
        );

        // Get uzman profile id
        const [profiles] = await connection.execute(
            'SELECT id FROM uzman_profiles WHERE user_id = ?',
            [userId]
        );
        const profileId = profiles[0].id;

        // Insert uzmanlik alanlari
        if (uzmanlikAlanlari) {
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
                    u.email as hasta_email
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

        const [result] = await pool.execute(
            `UPDATE randevular
             SET kesin_tarih = ?
             WHERE id = ? AND uzman_profile_id = ? AND durum IN ('beklemede', 'onaylandi')`,
            [kesin_tarih, id, uzman_profile_id]
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

