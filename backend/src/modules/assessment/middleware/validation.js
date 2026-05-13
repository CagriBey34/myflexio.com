/**
 * Assessment Validation Middleware
 * Validates assessment questions and responses
 */

/**
 * Validate question creation/update
 */
export const validateQuestion = (req, res, next) => {
    const { soru_metni, soru_tipi, kategori } = req.body;

    if (!soru_metni || !soru_tipi) {
        return res.status(400).json({
            success: false,
            message: 'Soru metni ve soru tipi zorunludur'
        });
    }

    const validTypes = ['multiple_choice', 'scale', 'text', 'yes_no'];
    if (!validTypes.includes(soru_tipi)) {
        return res.status(400).json({
            success: false,
            message: 'Geçersiz soru tipi'
        });
    }

    // Validate multiple choice options
    if (soru_tipi === 'multiple_choice') {
        const { secenekler } = req.body;
        if (!secenekler || !Array.isArray(secenekler) || secenekler.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Çoktan seçmeli sorular için en az 2 seçenek gereklidir'
            });
        }
    }

    // Validate scale questions
    if (soru_tipi === 'scale') {
        const { min_deger, max_deger } = req.body;
        if (!min_deger || !max_deger || min_deger >= max_deger) {
            return res.status(400).json({
                success: false,
                message: 'Ölçek soruları için geçerli min ve max değerler gereklidir'
            });
        }
    }

    next();
};

/**
 * Validate assessment submission
 */
export const validateAssessmentSubmission = (req, res, next) => {
    const { responses } = req.body;

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'En az bir cevap gereklidir'
        });
    }

    // Check each response has required fields
    for (const response of responses) {
        if (!response.soru_id || response.cevap === undefined || response.cevap === null) {
            return res.status(400).json({
                success: false,
                message: 'Her cevap için soru_id ve cevap alanları gereklidir'
            });
        }
    }

    next();
};
