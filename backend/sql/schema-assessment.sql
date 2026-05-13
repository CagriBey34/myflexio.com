-- Health Assessment Module Schema
-- Questions and responses for patient health assessment

-- Assessment questions table
CREATE TABLE IF NOT EXISTS assessment_questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  soru_metni TEXT NOT NULL,
  soru_tipi ENUM('multiple_choice', 'scale', 'text', 'yes_no') NOT NULL,
  kategori VARCHAR(100),
  secenekler JSON,
  min_deger INT,
  max_deger INT,
  sira_no INT DEFAULT 0,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_aktif (aktif),
  INDEX idx_kategori (kategori),
  INDEX idx_sira (sira_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assessment responses table
CREATE TABLE IF NOT EXISTS assessment_responses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  hasta_profile_id INT NOT NULL,
  soru_id INT NOT NULL,
  cevap TEXT NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hasta_profile_id) REFERENCES hasta_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (soru_id) REFERENCES assessment_questions(id) ON DELETE CASCADE,
  INDEX idx_hasta_profile (hasta_profile_id),
  INDEX idx_soru (soru_id),
  INDEX idx_completed (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assessment sessions table (for tracking completion)
CREATE TABLE IF NOT EXISTS assessment_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  hasta_profile_id INT NOT NULL,
  tamamlandi BOOLEAN DEFAULT false,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (hasta_profile_id) REFERENCES hasta_profiles(id) ON DELETE CASCADE,
  INDEX idx_hasta_profile (hasta_profile_id),
  INDEX idx_tamamlandi (tamamlandi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample questions (optional - for initial setup)
INSERT INTO assessment_questions (soru_metni, soru_tipi, kategori, secenekler, sira_no, aktif) VALUES
('Ağrınız ne zaman başladı?', 'multiple_choice', 'agri', '["Son 1 hafta içinde", "1-3 ay önce", "3-6 ay önce", "6 aydan fazla"]', 1, true),
('Ağrınızı 1-10 arasında değerlendiriniz (1: Çok hafif, 10: Dayanılmaz)', 'scale', 'agri', NULL, 2, true),
('Ağrınız geceleri artıyor mu?', 'yes_no', 'agri', NULL, 3, true),
('Günlük aktivitelerinizi nasıl etkiliyor?', 'text', 'yasam_kalitesi', NULL, 4, true),
('Daha önce fizik tedavi aldınız mı?', 'yes_no', 'tedavi_gecmisi', NULL, 5, true);
