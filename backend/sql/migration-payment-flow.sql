-- Migration: Payment Flow
-- Adds IBAN to specialist profiles and payment tracking to treatment plans

ALTER TABLE `uzman_profiles`
  ADD COLUMN `iban_no` VARCHAR(34) DEFAULT NULL AFTER `evde_seans_ucreti`;

ALTER TABLE `tedavi_planlari`
  ADD COLUMN `durum` ENUM('beklemede_odeme','dekont_yuklendi','aktif') NOT NULL DEFAULT 'beklemede_odeme' AFTER `notlar`,
  ADD COLUMN `dekont_url` VARCHAR(500) DEFAULT NULL AFTER `durum`,
  ADD INDEX `idx_durum` (`durum`);
