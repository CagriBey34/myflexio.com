/**
 * Hasta Controller
 * Handles hasta registration, profile completion, and management
 */

import bcrypt from 'bcryptjs';
import pool from '../../../config/db.js';
import { generateTokens } from '../../../core/auth/utils/jwtUtils.js';
import { sendEmail, mailYeniRandevuUzman, mailYeniRandevuAdmin, mailSeansTamamlandiHasta, mailSeansTamamlandiUzman, mailHosGeldin, mailDekontYuklendi } from '../../../core/notifications/emailService.js';
import { sendWhatsApp, waYeniRandevuUzman } from '../../../core/notifications/whatsappService.js';

/**
 * Register new hasta
 * POST /api/hasta/register
 */
export const registerHasta = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { email, sifre, ad, soyad, telefon, kvkkOnay } = req.body;

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

        // Hash password
        const hashedPassword = await bcrypt.hash(sifre, 10);

        // Insert user with active status (hasta doesn't need approval)
        const [userResult] = await connection.execute(
            'INSERT INTO users (email, password, role, status) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, 'hasta', 'active']
        );

        const userId = userResult.insertId;

        // Insert hasta profile
        await connection.execute(
            `INSERT INTO hasta_profiles 
       (user_id, ad, soyad, telefon, kvkk_onay) 
       VALUES (?, ?, ?, ?, ?)`,
            [userId, ad, soyad, telefon, kvkkOnay]
        );

        await connection.commit();

        // Generate tokens
        const tokens = generateTokens({
            id: userId,
            email,
            role: 'hasta',
            status: 'active'
        });

        res.status(201).json({
            success: true,
            message: 'Hasta kaydı başarılı',
            data: {
                user: {
                    id: userId,
                    email,
                    role: 'hasta',
                    status: 'active'
                },
                ...tokens
            }
        });

        setImmediate(async () => {
            try {
                const { subject, html } = mailHosGeldin({ ad, email });
                await sendEmail({ to: email, subject, html });
            } catch (e) {
                console.error('[Bildirim] Hoş geldin mail hatası:', e.message);
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Hasta register error:', error);
        res.status(500).json({
            success: false,
            message: 'Kayıt sırasında bir hata oluştu'
        });
    } finally {
        connection.release();
    }
};

/**
 * Complete hasta profile
 * POST /api/hasta/profile/complete
 */
export const completeProfile = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const userId = req.user.id;
        const {
            sehir,
            ilce,
            agriBolgesi,
            tedaviTercihi,
            dogumTarihi,
            cinsiyet,
            agriSeviyesi,
            ameliyatGecmisi,
            ameliyatDetay,
            kronikHastalik,
            kronikHastalikDetay,
            surekliIlac,
            ilacListesi,
            alerjiler
        } = req.body;

        await connection.beginTransaction();

        // Convert date to MySQL format (YYYY-MM-DD)
        let formattedDate = null;
        if (dogumTarihi) {
            const date = new Date(dogumTarihi);
            formattedDate = date.toISOString().split('T')[0]; // Get YYYY-MM-DD part
        }

        // Update hasta profile
        await connection.execute(
            `UPDATE hasta_profiles SET 
       sehir = ?, ilce = ?, agri_bolgesi = ?, tedavi_tercihi = ?,
       dogum_tarihi = ?, cinsiyet = ?, agri_seviyesi = ?,
       ameliyat_gecmisi = ?, ameliyat_detay = ?,
       kronik_hastalik = ?, kronik_hastalik_detay = ?,
       surekli_ilac = ?, ilac_listesi = ?, alerjiler = ?,
       profile_completed_at = NOW()
       WHERE user_id = ?`,
            [
                sehir, ilce, agriBolgesi, tedaviTercihi,
                formattedDate, cinsiyet, agriSeviyesi || null,
                ameliyatGecmisi || false, ameliyatDetay || null,
                kronikHastalik || false, kronikHastalikDetay || null,
                surekliIlac || false, ilacListesi || null, alerjiler || null,
                userId
            ]
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
 * Get hasta profile
 * GET /api/hasta/profile
 */
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user and profile data
        const [profiles] = await pool.execute(
            `SELECT u.id, u.email, u.role, u.status, u.created_at,
              hp.ad, hp.soyad, hp.telefon, hp.kvkk_onay,
              hp.sehir, hp.ilce, hp.agri_bolgesi, hp.tedavi_tercihi,
              hp.dogum_tarihi, hp.cinsiyet, hp.agri_seviyesi,
              hp.ameliyat_gecmisi, hp.ameliyat_detay,
              hp.kronik_hastalik, hp.kronik_hastalik_detay,
              hp.surekli_ilac, hp.ilac_listesi, hp.alerjiler,
              hp.profile_completed_at
       FROM users u
       LEFT JOIN hasta_profiles hp ON u.id = hp.user_id
       WHERE u.id = ? AND u.role = 'hasta'`,
            [userId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Profil bulunamadı'
            });
        }

        const profile = profiles[0];

        // Get medical reports if profile exists
        const profileIdResult = await pool.execute(
            'SELECT id FROM hasta_profiles WHERE user_id = ?',
            [userId]
        );

        if (profileIdResult[0].length > 0) {
            const [reports] = await pool.execute(
                'SELECT id, tip, dosya_url, aciklama, created_at FROM medical_reports WHERE hasta_profile_id = ?',
                [profileIdResult[0][0].id]
            );
            profile.medicalReports = reports;
        }

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
 * Upload medical report
 * POST /api/hasta/reports
 */
export const uploadMedicalReport = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const userId = req.user.id;
        const { tip, aciklama } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Rapor dosyası yüklenmelidir'
            });
        }

        await connection.beginTransaction();

        // Get hasta profile id
        const [profiles] = await connection.execute(
            'SELECT id FROM hasta_profiles WHERE user_id = ?',
            [userId]
        );

        if (profiles.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Hasta profili bulunamadı'
            });
        }

        const profileId = profiles[0].id;
        const dosyaUrl = `/uploads/medical-reports/${req.file.filename}`;

        // Insert medical report
        await connection.execute(
            'INSERT INTO medical_reports (hasta_profile_id, tip, dosya_url, aciklama) VALUES (?, ?, ?, ?)',
            [profileId, tip, dosyaUrl, aciklama || null]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Rapor başarıyla yüklendi'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Upload report error:', error);
        res.status(500).json({
            success: false,
            message: 'Rapor yüklenirken bir hata oluştu'
        });
    } finally {
        connection.release();
    }
};

/**
 * Delete medical report
 * DELETE /api/hasta/reports/:id
 */
export const deleteMedicalReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const [profiles] = await pool.execute(
            'SELECT id FROM hasta_profiles WHERE user_id = ?', [userId]
        );
        if (profiles.length === 0) {
            return res.status(404).json({ success: false, message: 'Hasta profili bulunamadı' });
        }
        const profileId = profiles[0].id;

        const [result] = await pool.execute(
            'DELETE FROM medical_reports WHERE id = ? AND hasta_profile_id = ?',
            [id, profileId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Rapor bulunamadı' });
        }

        res.status(200).json({ success: true, message: 'Rapor silindi' });
    } catch (error) {
        console.error('Delete report error:', error);
        res.status(500).json({ success: false, message: 'Rapor silinirken bir hata oluştu' });
    }
};

/**
 * Get medical reports
 * GET /api/hasta/reports
 */
export const getMedicalReports = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get hasta profile id
        const [profiles] = await pool.execute(
            'SELECT id FROM hasta_profiles WHERE user_id = ?',
            [userId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Hasta profili bulunamadı'
            });
        }

        const profileId = profiles[0].id;

        // Get medical reports
        const [reports] = await pool.execute(
            'SELECT id, tip, dosya_url, aciklama, created_at FROM medical_reports WHERE hasta_profile_id = ? ORDER BY created_at DESC',
            [profileId]
        );

        res.status(200).json({
            success: true,
            data: reports
        });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Raporlar alınırken bir hata oluştu'
        });
    }
};

/**
 * Create new assessment
 * POST /api/hasta/assessment
 */
export const createAssessment = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            painRegion,
            painSeverity,
            painDuration,
            painTypes,
            dailyActivitiesImpact,
            sleepImpact,
            workImpact,
            socialImpact,
            painTriggers,
            painRelievers,
            treatmentGoals,
            expectedDuration,
            additionalNotes
        } = req.body;

        // Import specialist matcher
        const { getRecommendedSpecialists } = await import('../utils/specialistMatcher.js');

        // Get specialist recommendations
        const recommendedSpecialists = getRecommendedSpecialists({
            painRegion,
            painSeverity,
            painDuration,
            painTypes,
            dailyActivitiesImpact,
            sleepImpact,
            workImpact,
            socialImpact,
            painTriggers,
            painRelievers,
            treatmentGoals
        });

        // Insert assessment
        const [result] = await pool.execute(
            `INSERT INTO assessments (
                user_id, pain_region, pain_severity, pain_duration, pain_types,
                daily_activities_impact, sleep_impact, work_impact, social_impact,
                pain_triggers, pain_relievers, treatment_goals, expected_duration,
                additional_notes, recommended_specialists
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                painRegion,
                painSeverity,
                painDuration,
                JSON.stringify(painTypes),
                dailyActivitiesImpact,
                sleepImpact,
                workImpact,
                socialImpact,
                JSON.stringify(painTriggers),
                JSON.stringify(painRelievers),
                JSON.stringify(treatmentGoals),
                expectedDuration,
                additionalNotes || null,
                JSON.stringify(recommendedSpecialists)
            ]
        );

        res.status(201).json({
            success: true,
            data: {
                assessmentId: result.insertId,
                recommendedSpecialists
            }
        });
    } catch (error) {
        console.error('Create assessment error:', error);
        res.status(500).json({
            success: false,
            message: 'Değerlendirme oluşturulurken bir hata oluştu'
        });
    }
};

/**
 * Get user's assessments
 * GET /api/hasta/assessments
 */
export const getAssessments = async (req, res) => {
    try {
        const userId = req.user.id;

        const [assessments] = await pool.execute(
            `SELECT 
                id, pain_region, pain_severity, pain_duration, pain_types,
                daily_activities_impact, sleep_impact, work_impact, social_impact,
                pain_triggers, pain_relievers, treatment_goals, expected_duration,
                additional_notes, recommended_specialists, created_at
            FROM assessments 
            WHERE user_id = ? 
            ORDER BY created_at DESC`,
            [userId]
        );

        // Safe JSON parse helper
        const safeJsonParse = (value) => {
            if (!value) return null;
            if (typeof value === 'object') return value;
            try {
                return JSON.parse(value);
            } catch (e) {
                console.error('JSON parse error:', e, 'Value:', value);
                return null;
            }
        };

        // Parse JSON fields
        const parsedAssessments = assessments.map(assessment => ({
            ...assessment,
            pain_types: safeJsonParse(assessment.pain_types) || [],
            pain_triggers: safeJsonParse(assessment.pain_triggers) || [],
            pain_relievers: safeJsonParse(assessment.pain_relievers) || [],
            treatment_goals: safeJsonParse(assessment.treatment_goals) || [],
            recommended_specialists: safeJsonParse(assessment.recommended_specialists) || []
        }));

        res.status(200).json({
            success: true,
            data: parsedAssessments
        });
    } catch (error) {
        console.error('Get assessments error:', error);
        res.status(500).json({
            success: false,
            message: 'Değerlendirmeler alınırken bir hata oluştu'
        });
    }
};

/**
 * Get single assessment
 * GET /api/hasta/assessment/:id
 */
export const getAssessment = async (req, res) => {
    try {
        const userId = req.user.id;
        const assessmentId = req.params.id;

        const [assessments] = await pool.execute(
            `SELECT 
                id, pain_region, pain_severity, pain_duration, pain_types,
                daily_activities_impact, sleep_impact, work_impact, social_impact,
                pain_triggers, pain_relievers, treatment_goals, expected_duration,
                additional_notes, recommended_specialists, created_at
            FROM assessments 
            WHERE id = ? AND user_id = ?`,
            [assessmentId, userId]
        );

        if (assessments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Değerlendirme bulunamadı'
            });
        }

        // Safe JSON parse helper
        const safeJsonParse = (value) => {
            if (!value) return null;
            if (typeof value === 'object') return value;
            try {
                return JSON.parse(value);
            } catch (e) {
                console.error('JSON parse error:', e);
                return null;
            }
        };

        const assessment = {
            ...assessments[0],
            pain_types: safeJsonParse(assessments[0].pain_types) || [],
            pain_triggers: safeJsonParse(assessments[0].pain_triggers) || [],
            pain_relievers: safeJsonParse(assessments[0].pain_relievers) || [],
            treatment_goals: safeJsonParse(assessments[0].treatment_goals) || [],
            recommended_specialists: safeJsonParse(assessments[0].recommended_specialists) || []
        };

        res.status(200).json({
            success: true,
            data: assessment
        });
    } catch (error) {
        console.error('Get assessment error:', error);
        res.status(500).json({
            success: false,
            message: 'Değerlendirme alınırken bir hata oluştu'
        });
    }
};


/**
 * Get recommended uzmanlar based on assessment
 * GET /api/hasta/assessment/:id/recommendations
 */
export const getAssessmentRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;
        const assessmentId = req.params.id;

        // 1. Assessment'ı çek ve bu kullanıcıya ait mi kontrol et
        const [assessments] = await pool.execute(
            `SELECT a.recommended_specialists, 
                    hp.sehir, hp.ilce, hp.tedavi_tercihi, hp.cinsiyet_tercihi
             FROM assessments a
             INNER JOIN hasta_profiles hp ON a.user_id = hp.user_id
             WHERE a.id = ? AND a.user_id = ?`,
            [assessmentId, userId]
        );

        if (assessments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Değerlendirme bulunamadı'
            });
        }

        const assessment = assessments[0];

        // 2. recommended_specialists tiplerini parse et
        // Örnek: [{ type: "Fizyoterapist", score: 85 }, { type: "Ortopedist", score: 60 }]
        const safeJsonParse = (v) => {
            if (!v) return [];
            if (typeof v === 'object') return v;
            try { return JSON.parse(v); } catch { return []; }
        };

        const recommendedTypes = safeJsonParse(assessment.recommended_specialists);

        if (recommendedTypes.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        // 3. Önerilen uzman tiplerine göre DB'den uzmanları çek
        const typeList = recommendedTypes.map(r => r.type);
        const placeholders = typeList.map(() => '?').join(',');

        const [uzmanlar] = await pool.execute(
            `SELECT 
                u.id as user_id,
                up.id as profile_id,
                up.ad, up.soyad, up.unvan,
                up.sehir, up.ilce,
                up.profil_fotograf_url,
                up.biyografi,
                up.uzmanlik_alani,
                up.online_hizmet, up.evde_hizmet, up.klinik_hizmet,
                up.seans_ucreti_min, up.seans_ucreti_max,
                up.online_seans_ucreti, up.evde_seans_ucreti,
                up.ortalama_rating, up.toplam_yorum_sayisi, up.toplam_randevu_sayisi,
                up.cinsiyet
             FROM users u
             INNER JOIN uzman_profiles up ON u.id = up.user_id
             WHERE u.role = 'uzman' 
               AND u.status = 'active'
               AND up.profile_completed_at IS NOT NULL
               AND up.uzmanlik_alani IN (${placeholders})`,
            typeList
        );

        if (uzmanlar.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        // 4. Hasta profilini matchingAlgorithm için hazırla
        const hastaProfile = {
            sehir: assessment.sehir,
            ilce: assessment.ilce,
            tedavi_tercihi: assessment.tedavi_tercihi,
            cinsiyet_tercihi: assessment.cinsiyet_tercihi,
        };

        // 5. Her uzmana matchingAlgorithm skoru + specialistMatcher skoru ekle
        const { sortByMatchScore } = await import('../../uzman/utils/matchingAlgorithm.js');

        const uzmanlarWithScore = sortByMatchScore(uzmanlar, hastaProfile).map(uzman => {
            // specialistMatcher'dan gelen type score'u bul
            const typeMatch = recommendedTypes.find(r => r.type === uzman.uzmanlik_alani);
            const typeScore = typeMatch ? typeMatch.score : 0;

            // İki skoru birleştir: %60 matchingAlgorithm + %40 specialistMatcher
            const combinedScore = Math.round(
                (uzman.match_score * 0.6) + (typeScore * 0.4)
            );

            return {
                ...uzman,
                specialist_type_score: typeScore,
                match_score: combinedScore,
                // matchReasons specialistMatcher'dan
                match_reasons: typeMatch?.matchReasons || []
            };
        });

        // 6. Skora göre sırala, max 10 uzman döndür
        const sorted = uzmanlarWithScore
            .sort((a, b) => b.match_score - a.match_score)
            .slice(0, 10);

        res.status(200).json({
            success: true,
            data: {
                recommended_types: recommendedTypes,
                uzmanlar: sorted
            }
        });

    } catch (error) {
        console.error('getAssessmentRecommendations error:', error);
        res.status(500).json({
            success: false,
            message: 'Öneriler alınırken bir hata oluştu'
        });
    }
};

// ─── RANDEVU ─────────────────────────────────────────────────────────

/**
 * Randevu talebi oluştur
 * POST /api/hasta/randevu
 */
export const createRandevu = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const userId = req.user.id;
        const { uzman_profile_id, talep_tarihi, talep_turu, hasta_notu, randevu_tipi = 'normal' } = req.body;

        const isOnGorusme = randevu_tipi === 'on_gorusme';

        // Ön görüşmede tarih/saat seçilmez; normal randevuda zorunlu
        if (!uzman_profile_id || !talep_turu) {
            return res.status(400).json({
                success: false,
                message: 'Uzman ve görüşme türü zorunludur'
            });
        }
        if (!isOnGorusme && !talep_tarihi) {
            return res.status(400).json({
                success: false,
                message: 'Normal randevu için tarih zorunludur'
            });
        }

        const [profiles] = await connection.execute(
            'SELECT id FROM hasta_profiles WHERE user_id = ?', [userId]
        );
        if (profiles.length === 0) {
            return res.status(404).json({ success: false, message: 'Hasta profili bulunamadı' });
        }
        const hasta_profile_id = profiles[0].id;

        // Uzman aktif mi?
        const [uzman] = await connection.execute(
            `SELECT up.id FROM uzman_profiles up
             INNER JOIN users u ON up.user_id = u.id
             WHERE (up.id = ? OR u.id = ?) AND u.status = 'active'`,
            [uzman_profile_id, uzman_profile_id]
        );
        if (uzman.length === 0) {
            return res.status(404).json({ success: false, message: 'Uzman bulunamadı' });
        }

        // Çakışan randevu kontrolü (sadece normal randevularda)
        if (!isOnGorusme && talep_tarihi) {
            const [conflict] = await connection.execute(
                `SELECT id FROM randevular
                 WHERE uzman_profile_id = ?
                   AND talep_tarihi = ?
                   AND durum IN ('beklemede', 'onaylandi')`,
                [uzman[0].id, talep_tarihi]
            );
            if (conflict.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Bu tarih ve saatte uzman müsait değil'
                });
            }
        }

        const initialDurum = isOnGorusme ? 'onaylandi' : 'beklemede';
        const [result] = await connection.execute(
            `INSERT INTO randevular
             (hasta_profile_id, uzman_profile_id, talep_tarihi, talep_turu, hasta_notu, randevu_tipi, durum)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [hasta_profile_id, uzman[0].id, talep_tarihi || null, talep_turu, hasta_notu || null, randevu_tipi, initialDurum]
        );

        res.status(201).json({
            success: true,
            message: isOnGorusme ? 'Ön görüşme talebiniz gönderildi' : 'Randevu talebiniz gönderildi',
            data: { randevu_id: result.insertId }
        });

        // Bildirimler (arka planda, yanıtı bloklamaz)
        setImmediate(async () => {
            try {
                const [[hastaInfo]] = await pool.execute(
                    `SELECT hp.ad, hp.soyad, hp.telefon, u.email
                     FROM hasta_profiles hp INNER JOIN users u ON hp.user_id = u.id
                     WHERE hp.id = ?`,
                    [hasta_profile_id]
                );
                const [[uzmanInfo]] = await pool.execute(
                    `SELECT up.ad, up.soyad, up.unvan, up.telefon, u.email
                     FROM uzman_profiles up INNER JOIN users u ON up.user_id = u.id
                     WHERE up.id = ?`,
                    [uzman[0].id]
                );
                const ctx = {
                    hastaAd: hastaInfo?.ad, hastaSoyad: hastaInfo?.soyad,
                    hastaEmail: hastaInfo?.email, hastaTelefon: hastaInfo?.telefon,
                    talep_tarihi, talep_turu, randevu_tipi, hasta_notu,
                };
                // Uzmana bildirim
                if (uzmanInfo?.email) {
                    const { subject, html } = mailYeniRandevuUzman(ctx);
                    await sendEmail({ to: uzmanInfo.email, subject, html });
                }
                if (uzmanInfo?.telefon) {
                    await sendWhatsApp({ to: uzmanInfo.telefon, message: waYeniRandevuUzman(ctx) });
                }
                // Admine bildirim
                if (process.env.ADMIN_EMAIL) {
                    const { subject, html } = mailYeniRandevuAdmin({
                        ...ctx,
                        uzmanAd: uzmanInfo?.ad, uzmanSoyad: uzmanInfo?.soyad,
                        uzmanUnvan: uzmanInfo?.unvan,
                    });
                    await sendEmail({ to: process.env.ADMIN_EMAIL, subject, html });
                }
            } catch (notifErr) {
                console.error('[Bildirim] Randevu bildirim hatası:', notifErr.message);
            }
        });
    } catch (error) {
        console.error('createRandevu error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    } finally {
        connection.release();
    }
};

/**
 * Hasta kendi randevularını listele
 * GET /api/hasta/randevular
 */
export const getHastaRandevular = async (req, res) => {
    try {
        const userId = req.user.id;

        const [profiles] = await pool.execute(
            'SELECT id FROM hasta_profiles WHERE user_id = ?', [userId]
        );
        if (profiles.length === 0) {
            return res.status(404).json({ success: false, message: 'Profil bulunamadı' });
        }
        const hasta_profile_id = profiles[0].id;

        const [randevular] = await pool.execute(
            `SELECT r.*,
                    up.ad as uzman_ad, up.soyad as uzman_soyad,
                    up.unvan, up.profil_fotograf_url,
                    up.uzmanlik_alani,
                    up.user_id as uzman_user_id
             FROM randevular r
             INNER JOIN uzman_profiles up ON r.uzman_profile_id = up.id
             WHERE r.hasta_profile_id = ?
             ORDER BY r.created_at DESC`,
            [hasta_profile_id]
        );

        res.status(200).json({ success: true, data: randevular });
    } catch (error) {
        console.error('getHastaRandevular error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

/**
 * Hasta alternatif tarihi kabul/reddet
 * PATCH /api/hasta/randevu/:id/karar
 */
export const hastaRandevuKarar = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { karar } = req.body; // 'kabul' | 'red'

        const [profiles] = await connection.execute(
            'SELECT id FROM hasta_profiles WHERE user_id = ?', [userId]
        );
        const hasta_profile_id = profiles[0]?.id;

        const [rows] = await connection.execute(
            'SELECT * FROM randevular WHERE id = ? AND hasta_profile_id = ?',
            [id, hasta_profile_id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Randevu bulunamadı' });
        }

        const randevu = rows[0];
        if (randevu.durum !== 'reddedildi' || !randevu.alternatif_tarih) {
            return res.status(400).json({
                success: false,
                message: 'Bu randevu için bekleyen bir öneri yok'
            });
        }

        if (karar === 'kabul') {
            await connection.execute(
                `UPDATE randevular
                 SET durum = 'onaylandi', kesin_tarih = alternatif_tarih
                 WHERE id = ?`,
                [id]
            );
            return res.status(200).json({ success: true, message: 'Randevu onaylandı' });
        } else {
            await connection.execute(
                'UPDATE randevular SET durum = \'iptal\' WHERE id = ?', [id]
            );
            return res.status(200).json({ success: true, message: 'Randevu iptal edildi' });
        }
    } catch (error) {
        console.error('hastaRandevuKarar error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    } finally {
        connection.release();
    }
};

/**
 * Get treatment plans for the logged-in hasta
 * GET /api/hasta/tedavi-plani
 */
export const getHastaTedaviPlani = async (req, res) => {
    try {
        const userId = req.user.id;

        const [hastaRows] = await pool.execute(
            'SELECT id FROM hasta_profiles WHERE user_id = ?',
            [userId]
        );
        if (hastaRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Hasta profili bulunamadı' });
        }
        const hastaProfileId = hastaRows[0].id;

        const [planlar] = await pool.execute(
            `SELECT tp.*,
                    up.ad AS uzman_ad, up.soyad AS uzman_soyad, up.unvan AS uzman_unvan,
                    up.telefon AS uzman_telefon,
                    sa.sistem_iban, sa.iban_ad_soyad, sa.iban_banka_adi
             FROM tedavi_planlari tp
             JOIN uzman_profiles up ON tp.uzman_profile_id = up.id
             LEFT JOIN sistem_ayarlari sa ON sa.id = 1
             WHERE tp.hasta_profile_id = ?
             ORDER BY tp.created_at DESC`,
            [hastaProfileId]
        );

        res.status(200).json({ success: true, data: planlar });
    } catch (error) {
        console.error('getHastaTedaviPlani error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

/**
 * Hasta seans aldığını onaylar (geri alınamaz)
 * PATCH /api/hasta/randevu/:id/seans-al
 */
export const hastaSeansAl = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const [profiles] = await pool.execute(
            'SELECT id FROM hasta_profiles WHERE user_id = ?', [userId]
        );
        if (profiles.length === 0) {
            return res.status(404).json({ success: false, message: 'Hasta profili bulunamadı' });
        }
        const hasta_profile_id = profiles[0].id;

        const [[randevu]] = await pool.execute(
            'SELECT id, hasta_seans_onayladi FROM randevular WHERE id = ? AND hasta_profile_id = ?',
            [id, hasta_profile_id]
        );

        if (!randevu) {
            return res.status(404).json({ success: false, message: 'Randevu bulunamadı' });
        }
        if (randevu.hasta_seans_onayladi) {
            return res.status(400).json({ success: false, message: 'Seans zaten onaylanmış' });
        }

        await pool.execute(
            'UPDATE randevular SET hasta_seans_onayladi = 1, hasta_seans_onaylama_tarihi = NOW() WHERE id = ?',
            [id]
        );

        res.status(200).json({ success: true, message: 'Seans onaylandı' });
    } catch (error) {
        console.error('hastaSeansAl error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

/**
 * Upload payment receipt (dekont) for a treatment plan
 * POST /api/hasta/tedavi-plani/:id/dekont
 */
export const uploadDekont = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const userId = req.user.id;
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Dekont dosyası yüklenmelidir' });
        }

        await connection.beginTransaction();

        const [hastaRows] = await connection.execute(
            'SELECT id FROM hasta_profiles WHERE user_id = ?', [userId]
        );
        if (hastaRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Hasta profili bulunamadı' });
        }
        const hastaProfileId = hastaRows[0].id;

        const [planRows] = await connection.execute(
            'SELECT id FROM tedavi_planlari WHERE id = ? AND hasta_profile_id = ? AND durum = ?',
            [id, hastaProfileId, 'beklemede_odeme']
        );
        if (planRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Tedavi planı bulunamadı veya zaten işlendi' });
        }

        const dekontUrl = `/uploads/dekontlar/${req.file.filename}`;

        await connection.execute(
            "UPDATE tedavi_planlari SET dekont_url = ?, durum = 'dekont_yuklendi' WHERE id = ?",
            [dekontUrl, id]
        );

        await connection.commit();
        res.status(200).json({ success: true, message: 'Dekont başarıyla yüklendi' });

        setImmediate(async () => {
            try {
                const [[bilgi]] = await pool.execute(
                    `SELECT hp.ad as hasta_ad, hp.soyad as hasta_soyad, hu.email as hasta_email,
                            up.ad as uzman_ad, up.soyad as uzman_soyad, up.unvan as uzman_unvan,
                            tp.tedavi_turu, tp.seans_sayisi, tp.toplam_ucret
                     FROM tedavi_planlari tp
                     INNER JOIN hasta_profiles hp ON tp.hasta_profile_id = hp.id
                     INNER JOIN users hu ON hp.user_id = hu.id
                     INNER JOIN uzman_profiles up ON tp.uzman_profile_id = up.id
                     WHERE tp.id = ?`,
                    [id]
                );
                if (bilgi && process.env.ADMIN_EMAIL) {
                    const { subject, html } = mailDekontYuklendi({
                        hastaAd: bilgi.hasta_ad, hastaSoyad: bilgi.hasta_soyad, hastaEmail: bilgi.hasta_email,
                        uzmanUnvan: bilgi.uzman_unvan, uzmanAd: bilgi.uzman_ad, uzmanSoyad: bilgi.uzman_soyad,
                        tedaviTuru: bilgi.tedavi_turu, seansSayisi: bilgi.seans_sayisi, toplamUcret: bilgi.toplam_ucret,
                    });
                    await sendEmail({ to: process.env.ADMIN_EMAIL, subject, html });
                }
            } catch (e) {
                console.error('[Bildirim] Dekont bildirim hatası:', e.message);
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('uploadDekont error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    } finally {
        connection.release();
    }
};

/**
 * Hastanın aktif tedavi planına ait tüm seansları döndür
 * GET /api/hasta/seanslar
 */
export const getHastaSeanslari = async (req, res) => {
    try {
        const [profiles] = await pool.execute(
            'SELECT id FROM hasta_profiles WHERE user_id = ?', [req.user.id]
        );
        if (profiles.length === 0) return res.status(404).json({ success: false, message: 'Profil bulunamadı' });
        const hastaProfileId = profiles[0].id;

        const [seanslar] = await pool.execute(
            `SELECT s.*,
                    tp.tedavi_turu, tp.seans_sayisi, tp.toplam_ucret,
                    up.ad AS uzman_ad, up.soyad AS uzman_soyad, up.unvan AS uzman_unvan,
                    up.user_id AS uzman_user_id,
                    CASE WHEN rv.id IS NOT NULL THEN 1 ELSE 0 END AS already_reviewed
             FROM seanslar s
             INNER JOIN tedavi_planlari tp ON s.tedavi_plani_id = tp.id
             INNER JOIN uzman_profiles up ON tp.uzman_profile_id = up.id
             LEFT JOIN reviews rv ON rv.uzman_id = up.user_id AND rv.hasta_id = ?
             WHERE tp.hasta_profile_id = ? AND tp.durum = 'aktif'
             ORDER BY s.seans_no ASC`,
            [req.user.id, hastaProfileId]
        );
        res.status(200).json({ success: true, data: seanslar });
    } catch (error) {
        console.error('getHastaSeanslari error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

/**
 * Hasta seansı onaylar — her iki taraf onaylarsa seans tamamlanır, sıradaki aktifleşir
 * PATCH /api/hasta/seanslar/:seansId/seans-al
 */
export const hastaSeansOnay = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const [profiles] = await conn.execute(
            'SELECT id FROM hasta_profiles WHERE user_id = ?', [req.user.id]
        );
        if (profiles.length === 0) { conn.release(); return res.status(404).json({ success: false, message: 'Profil bulunamadı' }); }
        const hastaProfileId = profiles[0].id;

        const { seansId } = req.params;
        const [[seans]] = await conn.execute(
            `SELECT s.* FROM seanslar s
             INNER JOIN tedavi_planlari tp ON s.tedavi_plani_id = tp.id
             WHERE s.id = ? AND tp.hasta_profile_id = ?`,
            [seansId, hastaProfileId]
        );
        if (!seans) { conn.release(); return res.status(404).json({ success: false, message: 'Seans bulunamadı' }); }
        if (seans.durum !== 'aktif') { conn.release(); return res.status(400).json({ success: false, message: 'Seans aktif değil' }); }
        if (seans.hasta_seans_onayladi) { conn.release(); return res.status(400).json({ success: false, message: 'Zaten onaylandı' }); }

        await conn.beginTransaction();
        await conn.execute(
            'UPDATE seanslar SET hasta_seans_onayladi = 1, hasta_seans_onaylama_tarihi = NOW() WHERE id = ?',
            [seansId]
        );

        let seansTamamlandi = false;
        if (seans.uzman_seans_onayladi) {
            await conn.execute(`UPDATE seanslar SET durum = 'tamamlandi' WHERE id = ?`, [seansId]);
            await conn.execute(
                `UPDATE seanslar SET durum = 'aktif'
                 WHERE tedavi_plani_id = ? AND seans_no = ? AND durum = 'bekliyor'`,
                [seans.tedavi_plani_id, seans.seans_no + 1]
            );
            seansTamamlandi = true;
        }
        await conn.commit();
        conn.release();
        res.status(200).json({ success: true, message: 'Seans onaylandı' });

        if (seansTamamlandi) {
            setImmediate(async () => {
                try {
                    const [[bilgi]] = await pool.execute(
                        `SELECT hp.ad as hasta_ad, hu.email as hasta_email,
                                up.ad as uzman_ad, up.soyad as uzman_soyad, up.unvan as uzman_unvan, uu.email as uzman_email,
                                s.seans_no, tp.seans_sayisi
                         FROM seanslar s
                         INNER JOIN tedavi_planlari tp ON s.tedavi_plani_id = tp.id
                         INNER JOIN hasta_profiles hp ON tp.hasta_profile_id = hp.id
                         INNER JOIN users hu ON hp.user_id = hu.id
                         INNER JOIN uzman_profiles up ON tp.uzman_profile_id = up.id
                         INNER JOIN users uu ON up.user_id = uu.id
                         WHERE s.id = ?`,
                        [seansId]
                    );
                    if (bilgi?.hasta_email) {
                        const { subject, html } = mailSeansTamamlandiHasta({
                            hastaAd: bilgi.hasta_ad, uzmanUnvan: bilgi.uzman_unvan,
                            uzmanAd: bilgi.uzman_ad, uzmanSoyad: bilgi.uzman_soyad,
                            seansNo: bilgi.seans_no, toplamSeans: bilgi.seans_sayisi,
                        });
                        await sendEmail({ to: bilgi.hasta_email, subject, html });
                    }
                    if (bilgi?.uzman_email) {
                        const { subject, html } = mailSeansTamamlandiUzman({
                            uzmanAd: bilgi.uzman_ad, hastaAd: bilgi.hasta_ad, hastaSoyad: '',
                            seansNo: bilgi.seans_no, toplamSeans: bilgi.seans_sayisi,
                        });
                        await sendEmail({ to: bilgi.uzman_email, subject, html });
                    }
                } catch (e) {
                    console.error('[Bildirim] Seans tamamlandı bildirim hatası:', e.message);
                }
            });
        }
    } catch (error) {
        await conn.rollback();
        conn.release();
        console.error('hastaSeansOnay error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};