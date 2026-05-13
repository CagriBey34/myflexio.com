/**
 * Assessment Admin Controller
 * Manages assessment questions (CRUD operations)
 */

import pool from '../../../config/db.js';

/**
 * Create new assessment question
 * POST /api/assessment/admin/questions
 */
export const createQuestion = async (req, res) => {
    try {
        const {
            soru_metni,
            soru_tipi,
            kategori,
            secenekler,
            min_deger,
            max_deger,
            sira_no,
            aktif
        } = req.body;

        const seceneklerJson = secenekler ? JSON.stringify(secenekler) : null;

        const [result] = await pool.execute(
            `INSERT INTO assessment_questions 
       (soru_metni, soru_tipi, kategori, secenekler, min_deger, max_deger, sira_no, aktif)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                soru_metni,
                soru_tipi,
                kategori || null,
                seceneklerJson,
                min_deger || null,
                max_deger || null,
                sira_no || 0,
                aktif !== undefined ? aktif : true
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Soru başarıyla oluşturuldu',
            data: {
                id: result.insertId
            }
        });
    } catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({
            success: false,
            message: 'Soru oluşturulurken bir hata oluştu'
        });
    }
};

/**
 * Get all assessment questions
 * GET /api/assessment/admin/questions
 */
export const getQuestions = async (req, res) => {
    try {
        const { kategori, aktif } = req.query;

        let query = 'SELECT * FROM assessment_questions WHERE 1=1';
        const params = [];

        if (kategori) {
            query += ' AND kategori = ?';
            params.push(kategori);
        }

        if (aktif !== undefined) {
            query += ' AND aktif = ?';
            params.push(aktif === 'true' ? 1 : 0);
        }

        query += ' ORDER BY sira_no ASC, id ASC';

        const [questions] = await pool.execute(query, params);

        // Parse JSON secenekler
        const parsedQuestions = questions.map(q => ({
            ...q,
            secenekler: q.secenekler ? JSON.parse(q.secenekler) : null,
            aktif: Boolean(q.aktif)
        }));

        res.status(200).json({
            success: true,
            data: parsedQuestions
        });
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Sorular alınırken bir hata oluştu'
        });
    }
};

/**
 * Get single assessment question
 * GET /api/assessment/admin/questions/:id
 */
export const getQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        const [questions] = await pool.execute(
            'SELECT * FROM assessment_questions WHERE id = ?',
            [id]
        );

        if (questions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Soru bulunamadı'
            });
        }

        const question = {
            ...questions[0],
            secenekler: questions[0].secenekler ? JSON.parse(questions[0].secenekler) : null,
            aktif: Boolean(questions[0].aktif)
        };

        res.status(200).json({
            success: true,
            data: question
        });
    } catch (error) {
        console.error('Get question error:', error);
        res.status(500).json({
            success: false,
            message: 'Soru alınırken bir hata oluştu'
        });
    }
};

/**
 * Update assessment question
 * PUT /api/assessment/admin/questions/:id
 */
export const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            soru_metni,
            soru_tipi,
            kategori,
            secenekler,
            min_deger,
            max_deger,
            sira_no,
            aktif
        } = req.body;

        // Check if question exists
        const [existing] = await pool.execute(
            'SELECT id FROM assessment_questions WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Soru bulunamadı'
            });
        }

        const seceneklerJson = secenekler ? JSON.stringify(secenekler) : null;

        await pool.execute(
            `UPDATE assessment_questions SET
       soru_metni = ?, soru_tipi = ?, kategori = ?, secenekler = ?,
       min_deger = ?, max_deger = ?, sira_no = ?, aktif = ?
       WHERE id = ?`,
            [
                soru_metni,
                soru_tipi,
                kategori || null,
                seceneklerJson,
                min_deger || null,
                max_deger || null,
                sira_no !== undefined ? sira_no : 0,
                aktif !== undefined ? aktif : true,
                id
            ]
        );

        res.status(200).json({
            success: true,
            message: 'Soru başarıyla güncellendi'
        });
    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({
            success: false,
            message: 'Soru güncellenirken bir hata oluştu'
        });
    }
};

/**
 * Delete assessment question
 * DELETE /api/assessment/admin/questions/:id
 */
export const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute(
            'DELETE FROM assessment_questions WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Soru bulunamadı'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Soru başarıyla silindi'
        });
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({
            success: false,
            message: 'Soru silinirken bir hata oluştu'
        });
    }
};

/**
 * Reorder questions
 * PUT /api/assessment/admin/questions/reorder
 */
export const reorderQuestions = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { questions } = req.body; // Array of {id, sira_no}

        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz sıralama verisi'
            });
        }

        await connection.beginTransaction();

        for (const q of questions) {
            await connection.execute(
                'UPDATE assessment_questions SET sira_no = ? WHERE id = ?',
                [q.sira_no, q.id]
            );
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Sorular başarıyla sıralandı'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Reorder questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Sorular sıralanırken bir hata oluştu'
        });
    } finally {
        connection.release();
    }
};
