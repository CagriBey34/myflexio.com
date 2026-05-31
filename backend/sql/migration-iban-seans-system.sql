-- Migration: Sistem IBAN + Seans Takip Sistemi
-- Çalıştırma: mysql -u <user> -p myflexio < migration-iban-seans-system.sql

-- 1. Tek sistem IBAN'ı saklamak için ayarlar tablosu
CREATE TABLE IF NOT EXISTS sistem_ayarlari (
  id INT PRIMARY KEY DEFAULT 1,
  sistem_iban VARCHAR(50) DEFAULT NULL,
  iban_ad_soyad VARCHAR(100) DEFAULT NULL,
  iban_banka_adi VARCHAR(100) DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sadece bir kayıt olacak (id=1)
INSERT INTO sistem_ayarlari (id) VALUES (1) ON DUPLICATE KEY UPDATE id = 1;

-- 2. Uzman profil tablosuna iban_no alanı ekle (zaten yoksa)
ALTER TABLE uzman_profiles
  ADD COLUMN IF NOT EXISTS iban_no VARCHAR(50) DEFAULT NULL;

-- 3. Tedavi planları tablosuna durum ve dekont alanları (zaten yoksa)
ALTER TABLE tedavi_planlari
  ADD COLUMN IF NOT EXISTS durum ENUM('beklemede_odeme','dekont_yuklendi','aktif') NOT NULL DEFAULT 'beklemede_odeme' AFTER notlar,
  ADD COLUMN IF NOT EXISTS dekont_url VARCHAR(500) DEFAULT NULL AFTER durum;

-- 4. Randevu tablosuna seans onay alanları ekle (zaten yoksa)
ALTER TABLE randevular
  ADD COLUMN IF NOT EXISTS uzman_seans_onayladi TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS uzman_seans_onaylama_tarihi TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS hasta_seans_onayladi TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hasta_seans_onaylama_tarihi TIMESTAMP NULL DEFAULT NULL;
