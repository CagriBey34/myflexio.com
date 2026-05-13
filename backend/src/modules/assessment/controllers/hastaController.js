/**
 * Assessment Hasta Controller
 * Handles patient assessment submission and retrieval
 */

import pool from '../../../config/db.js';

/**
 * Get active assessment questions
 * GET /api/assessment/questions
 */
export const getActiveQuestions = async (req, res) => {
    try {
        const [questions] = await pool.execute(
            `SELECT id, soru_metni, soru_tipi, kategori, secenekler, min_deger, max_deger, sira_no
       FROM assessment_questions
       WHERE aktif = true
       ORDER BY sira_no ASC, id ASC`
        );

        // Parse JSON secenekler
        const parsedQuestions = questions.map(q => ({
            ...q,
            secenekler: q.secenekler ? JSON.parse(q.secenekler) : null
        }));

        res.status(200).json({
            success: true,
            data: parsedQuestions
        });
    } catch (error) {
        console.error('Get active questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Sorular alınırken bir hata oluştu'
        });
    }
};

/**
 * Submit assessment responses
 * POST /api/assessment/submit
 */
export const submitAssessment = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const userId = req.user.id;
        const { responses } = req.body;
        const completedAt = new Date();

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

        const hastaProfileId = profiles[0].id;

        // Create assessment session
        const [sessionResult] = await connection.execute(
            'INSERT INTO assessment_sessions (hasta_profile_id, tamamlandi, completed_at) VALUES (?, ?, ?)',
            [hastaProfileId, true, completedAt]
        );

        const sessionId = sessionResult.insertId;

        // Validate questions exist and are active
        const questionIds = responses.map(r => r.soru_id);
        const placeholders = questionIds.map(() => '?').join(',');

        const [validQuestions] = await connection.execute(
            `SELECT id FROM assessment_questions WHERE id IN (${placeholders}) AND aktif = true`,
            questionIds
        );

        if (validQuestions.length !== questionIds.length) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Bazı sorular geçersiz veya aktif değil'
            });
        }

        // Insert responses
        for (const response of responses) {
            await connection.execute(
                'INSERT INTO assessment_responses (hasta_profile_id, soru_id, cevap, completed_at) VALUES (?, ?, ?, ?)',
                [hastaProfileId, response.soru_id, String(response.cevap), completedAt]
            );
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Değerlendirme başarıyla kaydedildi',
            data: {
                session_id: sessionId
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Submit assessment error:', error);
        res.status(500).json({
            success: false,
            message: 'Değerlendirme kaydedilirken bir hata oluştu'
        });
    } finally {
        connection.release();
    }
};

/**
 * Get patient's assessment history
 * GET /api/assessment/my-assessments
 */
export const getMyAssessments = async (req, res) => {
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

        const hastaProfileId = profiles[0].id;

        // Get all assessment sessions
        const [sessions] = await pool.execute(
            `SELECT id, tamamlandi, started_at, completed_at
       FROM assessment_sessions
       WHERE hasta_profile_id = ?
       ORDER BY completed_at DESC`,
            [hastaProfileId]
        );

        // For each session, get responses
        const assessments = [];
        for (const session of sessions) {
            const [responses] = await pool.execute(
                `SELECT ar.id, ar.soru_id, ar.cevap, ar.completed_at,
                aq.soru_metni, aq.soru_tipi, aq.kategori
         FROM assessment_responses ar
         INNER JOIN assessment_questions aq ON ar.soru_id = aq.id
         WHERE ar.hasta_profile_id = ? AND ar.completed_at >= ? AND ar.completed_at <= ?
         ORDER BY aq.sira_no ASC`,
                [hastaProfileId, session.started_at, session.completed_at || new Date()]
            );

            assessments.push({
                session_id: session.id,
                completed_at: session.completed_at,
                responses: responses
            });
        }

        res.status(200).json({
            success: true,
            data: assessments
        });
    } catch (error) {
        console.error('Get my assessments error:', error);
        res.status(500).json({
            success: false,
            message: 'Değerlendirmeler alınırken bir hata oluştu'
        });
    }
};

/**
 * Get latest assessment
 * GET /api/assessment/latest
 */
export const getLatestAssessment = async (req, res) => {
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

        const hastaProfileId = profiles[0].id;

        // Get latest session
        const [sessions] = await pool.execute(
            `SELECT id, completed_at
       FROM assessment_sessions
       WHERE hasta_profile_id = ? AND tamamlandi = true
       ORDER BY completed_at DESC
       LIMIT 1`,
            [hastaProfileId]
        );

        if (sessions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Henüz değerlendirme yapılmamış'
            });
        }

        const session = sessions[0];

        // Get responses for this session
        const [responses] = await pool.execute(
            `SELECT ar.id, ar.soru_id, ar.cevap, ar.completed_at,
              aq.soru_metni, aq.soru_tipi, aq.kategori, aq.secenekler
       FROM assessment_responses ar
       INNER JOIN assessment_questions aq ON ar.soru_id = aq.id
       WHERE ar.hasta_profile_id = ? AND ar.completed_at >= ? AND ar.completed_at <= ?
       ORDER BY aq.sira_no ASC`,
            [hastaProfileId, session.completed_at, session.completed_at]
        );

        // Parse secenekler
        const parsedResponses = responses.map(r => ({
            ...r,
            secenekler: r.secenekler ? JSON.parse(r.secenekler) : null
        }));

        res.status(200).json({
            success: true,
            data: {
                session_id: session.id,
                completed_at: session.completed_at,
                responses: parsedResponses
            }
        });
    } catch (error) {
        console.error('Get latest assessment error:', error);
        res.status(500).json({
            success: false,
            message: 'Son değerlendirme alınırken bir hata oluştu'
        });
    }
};
