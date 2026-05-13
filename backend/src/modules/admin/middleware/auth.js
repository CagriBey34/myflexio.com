/**
 * Admin Middleware
 * Authorization middleware for admin-only routes
 */

/**
 * Check if user is admin
 */
export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Yetkisiz erişim'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Bu işlem için admin yetkisi gereklidir'
        });
    }

    next();
};
