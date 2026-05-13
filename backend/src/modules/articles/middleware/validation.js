/**
 * Article Validation Middleware
 * Validates article creation and updates
 */

/**
 * Validate article creation/update
 */
export const validateArticle = (req, res, next) => {
    const { baslik, icerik, kategori } = req.body;

    if (!baslik || baslik.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Başlık zorunludur'
        });
    }

    if (baslik.length > 255) {
        return res.status(400).json({
            success: false,
            message: 'Başlık en fazla 255 karakter olabilir'
        });
    }

    if (!icerik || icerik.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'İçerik zorunludur'
        });
    }

    if (icerik.length < 100) {
        return res.status(400).json({
            success: false,
            message: 'İçerik en az 100 karakter olmalıdır'
        });
    }

    if (!kategori) {
        return res.status(400).json({
            success: false,
            message: 'Kategori zorunludur'
        });
    }

    next();
};
