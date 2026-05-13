-- Extend uzman_profiles table
ALTER TABLE uzman_profiles 
  ADD COLUMN uzmanlik_alani VARCHAR(100),
  ADD COLUMN online_hizmet BOOLEAN DEFAULT false,
  ADD COLUMN evde_hizmet BOOLEAN DEFAULT false,
  ADD COLUMN klinik_hizmet BOOLEAN DEFAULT false,
  ADD COLUMN seans_ucreti_min DECIMAL(10,2),
  ADD COLUMN seans_ucreti_max DECIMAL(10,2),
  ADD COLUMN online_seans_ucreti DECIMAL(10,2),
  ADD COLUMN evde_seans_ucreti DECIMAL(10,2),
  ADD COLUMN ortalama_rating DECIMAL(3,2) DEFAULT 0.00,
  ADD COLUMN toplam_yorum_sayisi INT DEFAULT 0,
  ADD COLUMN toplam_randevu_sayisi INT DEFAULT 0;

-- Add indexes for search performance
CREATE INDEX idx_uzmanlik_alani ON uzman_profiles(uzmanlik_alani);
CREATE INDEX idx_sehir_ilce ON uzman_profiles(sehir, ilce);
CREATE INDEX idx_rating ON uzman_profiles(ortalama_rating);
CREATE INDEX idx_cinsiyet ON uzman_profiles(cinsiyet);

-- Uzman reviews table
CREATE TABLE IF NOT EXISTS uzman_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uzman_profile_id INT NOT NULL,
  hasta_profile_id INT NOT NULL,
  randevu_id INT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  yorum TEXT,
  profesyonellik_puan INT CHECK (profesyonellik_puan >= 1 AND profesyonellik_puan <= 5),
  iletisim_puan INT CHECK (iletisim_puan >= 1 AND iletisim_puan <= 5),
  tedavi_etkinligi_puan INT CHECK (tedavi_etkinligi_puan >= 1 AND tedavi_etkinligi_puan <= 5),
  zamaninda_gelme_puan INT CHECK (zamaninda_gelme_puan >= 1 AND zamaninda_gelme_puan <= 5),
  anonim BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (uzman_profile_id) REFERENCES uzman_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (hasta_profile_id) REFERENCES hasta_profiles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_review (uzman_profile_id, hasta_profile_id),
  INDEX idx_uzman (uzman_profile_id),
  INDEX idx_rating (rating),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Uzmanlik alanlari reference table
CREATE TABLE IF NOT EXISTS uzmanlik_alanlari_ref (
  id INT PRIMARY KEY AUTO_INCREMENT,
  alan_adi VARCHAR(100) UNIQUE NOT NULL,
  aciklama TEXT,
  aktif BOOLEAN DEFAULT true,
  INDEX idx_aktif (aktif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert reference data
INSERT INTO uzmanlik_alanlari_ref (alan_adi, aciklama) VALUES
('Nöroloji', 'Sinir sistemi hastalıkları'),
('Ortopedi', 'Kas-iskelet sistemi hastalıkları'),
('Geriatri', 'Yaşlı sağlığı'),
('Kardiyoloji', 'Kalp ve damar hastalıkları'),
('Pediatri', 'Çocuk sağlığı'),
('Sporcu Sağlığı', 'Spor yaralanmaları ve performans'),
('Kadın Sağlığı', 'Kadınlara özel fizyoterapi'),
('Fizyoterapi', 'Genel fizyoterapi'),
('Manuel Terapi', 'Elle tedavi yöntemleri'),
('Rehabilitasyon', 'İyileştirme ve rehabilitasyon');

-- Extend hasta_profiles for gender preference
ALTER TABLE hasta_profiles 
  ADD COLUMN cinsiyet_tercihi ENUM('erkek', 'kadin', 'farketmez') DEFAULT 'farketmez';
