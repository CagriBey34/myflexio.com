/**
 * Uzman Validation Middleware
 * Validates uzman registration and profile data
 */

import pool from '../../../config/db.js';

/**
 * Validate uzman registration data
 */
export const validateUzmanRegistration = (req, res, next) => {
    const { email, sifre, sifreTekrar, ad, soyad, unvan, telefon, kvkkOnay, sozlesmeOnay } = req.body;

    // Required fields
    if (!email || !sifre || !sifreTekrar || !ad || !soyad || !unvan || !telefon) {
        return res.status(400).json({
            success: false,
            message: 'Tüm zorunlu alanları doldurun'
        });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Geçerli bir email adresi girin'
        });
    }

    // Password match
    if (sifre !== sifreTekrar) {
        return res.status(400).json({
            success: false,
            message: 'Şifreler eşleşmiyor'
        });
    }

    // Password strength
    if (sifre.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Şifre en az 6 karakter olmalıdır'
        });
    }

    // Phone validation (basic)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(telefon.replace(/\s/g, ''))) {
        return res.status(400).json({
            success: false,
            message: 'Geçerli bir telefon numarası girin'
        });
    }

    // KVKK and Sozlesme approval
    if (!kvkkOnay || !sozlesmeOnay) {
        return res.status(400).json({
            success: false,
            message: 'KVKK ve sözleşme onayları gereklidir'
        });
    }

    next();
};

/**
 * Validate profile completion data
 */
export const validateProfileCompletion = (req, res, next) => {
    const { dogumTarihi, cinsiyet, mezuniyetOkul, mezuniyetYili, sehir, ilce } = req.body;

    if (!dogumTarihi || !cinsiyet || !mezuniyetOkul || !mezuniyetYili || !sehir || !ilce) {
        return res.status(400).json({
            success: false,
            message: 'Tüm zorunlu profil alanları doldurulmalıdır'
        });
    }

    // Validate graduation year
    const currentYear = new Date().getFullYear();
    if (mezuniyetYili < 1950 || mezuniyetYili > currentYear) {
        return res.status(400).json({
            success: false,
            message: 'Geçerli bir mezuniyet yılı girin'
        });
    }

    next();
};

/**
 * Check if uzman is approved
 */
export const checkUzmanApproval = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const [users] = await pool.execute(
            'SELECT status FROM users WHERE id = ? AND role = "uzman"',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Uzman bulunamadı'
            });
        }

        const approvedStatuses = ['active', 'approved'];
        if (!approvedStatuses.includes(users[0].status)) {
            return res.status(403).json({
                success: false,
                message: 'Profiliniz henüz onaylanmamış. Admin onayı bekleniyor.'
            });
        }

        next();
    } catch (error) {
        console.error('Check approval error:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
};
