-- Blog/Article System Schema
-- Articles table for uzman content creation

-- Uzman articles table
CREATE TABLE IF NOT EXISTS uzman_articles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uzman_profile_id INT NOT NULL,
  baslik VARCHAR(255) NOT NULL,
  icerik TEXT NOT NULL,
  ozet TEXT,
  kapak_gorseli_url VARCHAR(500),
  kategori VARCHAR(100),
  etiketler JSON,
  durum ENUM('taslak', 'yayinda') DEFAULT 'taslak',
  goruntuleme_sayisi INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at TIMESTAMP NULL,
  FOREIGN KEY (uzman_profile_id) REFERENCES uzman_profiles(id) ON DELETE CASCADE,
  INDEX idx_uzman (uzman_profile_id),
  INDEX idx_durum (durum),
  INDEX idx_kategori (kategori),
  INDEX idx_published (published_at),
  INDEX idx_views (goruntuleme_sayisi),
  FULLTEXT INDEX idx_search (baslik, icerik, ozet)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Article categories reference table
CREATE TABLE IF NOT EXISTS article_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  kategori_adi VARCHAR(100) UNIQUE NOT NULL,
  aciklama TEXT,
  aktif BOOLEAN DEFAULT true,
  INDEX idx_aktif (aktif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert reference data
INSERT INTO article_categories (kategori_adi, aciklama) VALUES
('Bel Ağrısı', 'Bel ağrısı ile ilgili makaleler'),
('Boyun Ağrısı', 'Boyun ağrısı ve tedavisi'),
('Egzersiz', 'Egzersiz ve hareket'),
('Beslenme', 'Sağlıklı beslenme'),
('Yaşam Tarzı', 'Sağlıklı yaşam önerileri'),
('Sporcu Sağlığı', 'Spor yaralanmaları ve performans'),
('Rehabilitasyon', 'Rehabilitasyon süreçleri'),
('Genel Sağlık', 'Genel sağlık bilgileri'),
('Diz Ağrısı', 'Diz ağrısı ve tedavisi'),
('Omuz Ağrısı', 'Omuz problemleri');
