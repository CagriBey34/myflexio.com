/**
 * Hasta Validation Middleware
 * Validates hasta registration and profile data
 */

/**
 * Validate hasta registration data
 */
export const validateHastaRegistration = (req, res, next) => {
    const { email, sifre, sifreTekrar, ad, soyad, telefon, kvkkOnay } = req.body;

    // Required fields
    if (!email || !sifre || !sifreTekrar || !ad || !soyad || !telefon) {
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

    // KVKK approval
    if (!kvkkOnay) {
        return res.status(400).json({
            success: false,
            message: 'KVKK onayı gereklidir'
        });
    }

    next();
};

/**
 * Validate profile completion data
 */
export const validateProfileCompletion = (req, res, next) => {
    const { sehir, ilce, agriBolgesi, tedaviTercihi, dogumTarihi, cinsiyet } = req.body;

    if (!sehir || !ilce || !agriBolgesi || !tedaviTercihi || !dogumTarihi || !cinsiyet) {
        return res.status(400).json({
            success: false,
            message: 'Tüm zorunlu profil alanları doldurulmalıdır'
        });
    }

    // Validate tedavi tercihi
    const validTercihler = ['online', 'evde', 'klinik'];
    if (!validTercihler.includes(tedaviTercihi)) {
        return res.status(400).json({
            success: false,
            message: 'Geçersiz tedavi tercihi'
        });
    }

    next();
};
