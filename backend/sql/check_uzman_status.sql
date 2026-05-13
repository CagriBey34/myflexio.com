-- Uzman durumunu kontrol et ve onay ver
SELECT id, email, role, status FROM users WHERE role = 'uzman';

-- Eğer pending_approval ise, approved yap:
-- UPDATE users SET status = 'approved' WHERE role = 'uzman' AND email = 'UZMAN_EMAIL_BURAYA';
