-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Anamakine: mysql8-local
-- Üretim Zamanı: 23 Mar 2026, 22:39:27
-- Sunucu sürümü: 8.0.42
-- PHP Sürümü: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Veritabanı: `myflexio`
--

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `articles`
--

CREATE TABLE `articles` (
  `id` int NOT NULL,
  `uzman_id` int NOT NULL,
  `baslik` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ozet` text COLLATE utf8mb4_unicode_ci,
  `icerik` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `kapak_resmi_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kategori` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `etiketler` json DEFAULT NULL,
  `okunma_sayisi` int DEFAULT '0',
  `yayinlanma_durumu` enum('taslak','yayinda','arsivlendi') COLLATE utf8mb4_unicode_ci DEFAULT 'taslak',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `yayinlanma_tarihi` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `assessments`
--

CREATE TABLE `assessments` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `pain_region` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pain_severity` int NOT NULL,
  `pain_duration` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pain_types` json NOT NULL,
  `daily_activities_impact` int NOT NULL,
  `sleep_impact` int NOT NULL,
  `work_impact` int NOT NULL,
  `social_impact` int NOT NULL,
  `pain_triggers` json NOT NULL,
  `pain_relievers` json NOT NULL,
  `treatment_goals` json NOT NULL,
  `expected_duration` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `additional_notes` text COLLATE utf8mb4_unicode_ci,
  `recommended_specialists` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `assessment_questions`
--

CREATE TABLE `assessment_questions` (
  `id` int NOT NULL,
  `soru_metni` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `soru_tipi` enum('multiple_choice','scale','text','yes_no') COLLATE utf8mb4_unicode_ci NOT NULL,
  `kategori` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `secenekler` json DEFAULT NULL,
  `min_deger` int DEFAULT NULL,
  `max_deger` int DEFAULT NULL,
  `sira_no` int DEFAULT '0',
  `aktif` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `assessment_responses`
--

CREATE TABLE `assessment_responses` (
  `id` int NOT NULL,
  `hasta_profile_id` int NOT NULL,
  `soru_id` int NOT NULL,
  `cevap` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `completed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `assessment_sessions`
--

CREATE TABLE `assessment_sessions` (
  `id` int NOT NULL,
  `hasta_profile_id` int NOT NULL,
  `tamamlandi` tinyint(1) DEFAULT '0',
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `hasta_profiles`
--

CREATE TABLE `hasta_profiles` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `ad` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `soyad` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefon` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kvkk_onay` tinyint(1) DEFAULT '0',
  `sehir` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ilce` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agri_bolgesi` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tedavi_tercihi` enum('online','evde','klinik') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dogum_tarihi` date DEFAULT NULL,
  `cinsiyet` enum('erkek','kadin','diger') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agri_seviyesi` int DEFAULT NULL,
  `ameliyat_gecmisi` tinyint(1) DEFAULT '0',
  `ameliyat_detay` text COLLATE utf8mb4_unicode_ci,
  `kronik_hastalik` tinyint(1) DEFAULT '0',
  `kronik_hastalik_detay` text COLLATE utf8mb4_unicode_ci,
  `surekli_ilac` tinyint(1) DEFAULT '0',
  `ilac_listesi` text COLLATE utf8mb4_unicode_ci,
  `alerjiler` text COLLATE utf8mb4_unicode_ci,
  `profile_completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `cinsiyet_tercihi` enum('erkek','kadin','farketmez') COLLATE utf8mb4_unicode_ci DEFAULT 'farketmez'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `medical_reports`
--

CREATE TABLE `medical_reports` (
  `id` int NOT NULL,
  `hasta_profile_id` int NOT NULL,
  `tip` enum('mr','rontgen','kan_tahlili','diger') COLLATE utf8mb4_unicode_ci NOT NULL,
  `dosya_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aciklama` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `randevular`
--

CREATE TABLE `randevular` (
  `id` int NOT NULL,
  `hasta_profile_id` int NOT NULL,
  `uzman_profile_id` int NOT NULL,
  `talep_tarihi` datetime NULL DEFAULT NULL,
  `talep_turu` enum('online','evde','klinik') COLLATE utf8mb4_unicode_ci NOT NULL,
  `durum` enum('beklemede','onaylandi','reddedildi','tamamlandi','iptal') COLLATE utf8mb4_unicode_ci DEFAULT 'beklemede',
  `alternatif_tarih` datetime DEFAULT NULL,
  `red_notu` text COLLATE utf8mb4_unicode_ci,
  `kesin_tarih` datetime DEFAULT NULL,
  `hasta_notu` text COLLATE utf8mb4_unicode_ci,
  `randevu_tipi` enum('normal','on_gorusme') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `reviews`
--

CREATE TABLE `reviews` (
  `id` int NOT NULL,
  `uzman_id` int NOT NULL,
  `hasta_id` int NOT NULL,
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `sertifikalar`
--

CREATE TABLE `sertifikalar` (
  `id` int NOT NULL,
  `uzman_profile_id` int NOT NULL,
  `adi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dosya_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('uzman','hasta','admin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending_approval','approved','rejected','active') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `uzmanlik_alanlari`
--

CREATE TABLE `uzmanlik_alanlari` (
  `id` int NOT NULL,
  `uzman_profile_id` int NOT NULL,
  `kategori` enum('vucutBolgesi','tedaviYontemleri','ozelAlanlar','hastaliklar') COLLATE utf8mb4_unicode_ci NOT NULL,
  `deger` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `uzmanlik_alanlari_ref`
--

CREATE TABLE `uzmanlik_alanlari_ref` (
  `id` int NOT NULL,
  `alan_adi` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aciklama` text COLLATE utf8mb4_unicode_ci,
  `aktif` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `uzman_profiles`
--

CREATE TABLE `uzman_profiles` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `ad` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `soyad` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unvan` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefon` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `diploma_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kvkk_onay` tinyint(1) DEFAULT '0',
  `sozlesme_onay` tinyint(1) DEFAULT '0',
  `dogum_tarihi` date DEFAULT NULL,
  `cinsiyet` enum('erkek','kadin','diger') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profil_fotograf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `biyografi` text COLLATE utf8mb4_unicode_ci,
  `mezuniyet_okul` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mezuniyet_yili` int DEFAULT NULL,
  `sehir` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ilce` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `uzmanlik_alani` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `online_hizmet` tinyint(1) DEFAULT '0',
  `evde_hizmet` tinyint(1) DEFAULT '0',
  `klinik_hizmet` tinyint(1) DEFAULT '0',
  `seans_ucreti_min` decimal(10,2) DEFAULT NULL,
  `seans_ucreti_max` decimal(10,2) DEFAULT NULL,
  `online_seans_ucreti` decimal(10,2) DEFAULT NULL,
  `evde_seans_ucreti` decimal(10,2) DEFAULT NULL,
  `ortalama_rating` decimal(3,2) DEFAULT '0.00',
  `toplam_yorum_sayisi` int DEFAULT '0',
  `toplam_randevu_sayisi` int DEFAULT '0',
  `iban_no` varchar(34) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iban_ad_soyad` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `uzman_reviews`
--

CREATE TABLE `uzman_reviews` (
  `id` int NOT NULL,
  `uzman_profile_id` int NOT NULL,
  `hasta_profile_id` int NOT NULL,
  `randevu_id` int DEFAULT NULL,
  `rating` int NOT NULL,
  `yorum` text COLLATE utf8mb4_unicode_ci,
  `profesyonellik_puan` int DEFAULT NULL,
  `iletisim_puan` int DEFAULT NULL,
  `tedavi_etkinligi_puan` int DEFAULT NULL,
  `zamaninda_gelme_puan` int DEFAULT NULL,
  `anonim` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Dökümü yapılmış tablolar için indeksler
--

--
-- Tablo için indeksler `articles`
--
ALTER TABLE `articles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_uzman` (`uzman_id`),
  ADD KEY `idx_kategori` (`kategori`),
  ADD KEY `idx_durum` (`yayinlanma_durumu`),
  ADD KEY `idx_yayinlanma` (`yayinlanma_tarihi`);

--
-- Tablo için indeksler `assessments`
--
ALTER TABLE `assessments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_pain_region` (`pain_region`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Tablo için indeksler `assessment_questions`
--
ALTER TABLE `assessment_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_aktif` (`aktif`),
  ADD KEY `idx_kategori` (`kategori`),
  ADD KEY `idx_sira` (`sira_no`);

--
-- Tablo için indeksler `assessment_responses`
--
ALTER TABLE `assessment_responses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_hasta_profile` (`hasta_profile_id`),
  ADD KEY `idx_soru` (`soru_id`),
  ADD KEY `idx_completed` (`completed_at`);

--
-- Tablo için indeksler `assessment_sessions`
--
ALTER TABLE `assessment_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_hasta_profile` (`hasta_profile_id`),
  ADD KEY `idx_tamamlandi` (`tamamlandi`);

--
-- Tablo için indeksler `hasta_profiles`
--
ALTER TABLE `hasta_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Tablo için indeksler `medical_reports`
--
ALTER TABLE `medical_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_hasta_profile` (`hasta_profile_id`);

--
-- Tablo için indeksler `randevular`
--
ALTER TABLE `randevular`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_hasta` (`hasta_profile_id`),
  ADD KEY `idx_uzman` (`uzman_profile_id`),
  ADD KEY `idx_durum` (`durum`),
  ADD KEY `idx_tarih` (`talep_tarihi`);

--
-- Tablo için indeksler `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_review` (`uzman_id`,`hasta_id`),
  ADD KEY `hasta_id` (`hasta_id`),
  ADD KEY `idx_uzman` (`uzman_id`),
  ADD KEY `idx_rating` (`rating`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Tablo için indeksler `sertifikalar`
--
ALTER TABLE `sertifikalar`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_uzman_profile` (`uzman_profile_id`);

--
-- Tablo için indeksler `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_status` (`status`);

--
-- Tablo için indeksler `uzmanlik_alanlari`
--
ALTER TABLE `uzmanlik_alanlari`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_uzman_kategori` (`uzman_profile_id`,`kategori`);

--
-- Tablo için indeksler `uzmanlik_alanlari_ref`
--
ALTER TABLE `uzmanlik_alanlari_ref`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `alan_adi` (`alan_adi`),
  ADD KEY `idx_aktif` (`aktif`);

--
-- Tablo için indeksler `uzman_profiles`
--
ALTER TABLE `uzman_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_uzmanlik_alani` (`uzmanlik_alani`),
  ADD KEY `idx_sehir_ilce` (`sehir`,`ilce`),
  ADD KEY `idx_rating` (`ortalama_rating`),
  ADD KEY `idx_cinsiyet` (`cinsiyet`);

--
-- Tablo için indeksler `uzman_reviews`
--
ALTER TABLE `uzman_reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_review` (`uzman_profile_id`,`hasta_profile_id`),
  ADD KEY `hasta_profile_id` (`hasta_profile_id`),
  ADD KEY `idx_uzman` (`uzman_profile_id`),
  ADD KEY `idx_rating` (`rating`),
  ADD KEY `idx_created` (`created_at`);

--
-- Dökümü yapılmış tablolar için AUTO_INCREMENT değeri
--

--
-- Tablo için AUTO_INCREMENT değeri `articles`
--
ALTER TABLE `articles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `assessments`
--
ALTER TABLE `assessments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `assessment_questions`
--
ALTER TABLE `assessment_questions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `assessment_responses`
--
ALTER TABLE `assessment_responses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `assessment_sessions`
--
ALTER TABLE `assessment_sessions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `hasta_profiles`
--
ALTER TABLE `hasta_profiles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `medical_reports`
--
ALTER TABLE `medical_reports`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `randevular`
--
ALTER TABLE `randevular`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `sertifikalar`
--
ALTER TABLE `sertifikalar`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `uzmanlik_alanlari`
--
ALTER TABLE `uzmanlik_alanlari`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `uzmanlik_alanlari_ref`
--
ALTER TABLE `uzmanlik_alanlari_ref`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `uzman_profiles`
--
ALTER TABLE `uzman_profiles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `uzman_reviews`
--
ALTER TABLE `uzman_reviews`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Dökümü yapılmış tablolar için kısıtlamalar
--

--
-- Tablo kısıtlamaları `articles`
--
ALTER TABLE `articles`
  ADD CONSTRAINT `articles_ibfk_1` FOREIGN KEY (`uzman_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `assessments`
--
ALTER TABLE `assessments`
  ADD CONSTRAINT `assessments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `assessment_responses`
--
ALTER TABLE `assessment_responses`
  ADD CONSTRAINT `assessment_responses_ibfk_1` FOREIGN KEY (`hasta_profile_id`) REFERENCES `hasta_profiles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assessment_responses_ibfk_2` FOREIGN KEY (`soru_id`) REFERENCES `assessment_questions` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `assessment_sessions`
--
ALTER TABLE `assessment_sessions`
  ADD CONSTRAINT `assessment_sessions_ibfk_1` FOREIGN KEY (`hasta_profile_id`) REFERENCES `hasta_profiles` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `hasta_profiles`
--
ALTER TABLE `hasta_profiles`
  ADD CONSTRAINT `hasta_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `medical_reports`
--
ALTER TABLE `medical_reports`
  ADD CONSTRAINT `medical_reports_ibfk_1` FOREIGN KEY (`hasta_profile_id`) REFERENCES `hasta_profiles` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `randevular`
--
ALTER TABLE `randevular`
  ADD CONSTRAINT `randevular_ibfk_1` FOREIGN KEY (`hasta_profile_id`) REFERENCES `hasta_profiles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `randevular_ibfk_2` FOREIGN KEY (`uzman_profile_id`) REFERENCES `uzman_profiles` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`uzman_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`hasta_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `sertifikalar`
--
ALTER TABLE `sertifikalar`
  ADD CONSTRAINT `sertifikalar_ibfk_1` FOREIGN KEY (`uzman_profile_id`) REFERENCES `uzman_profiles` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `uzmanlik_alanlari`
--
ALTER TABLE `uzmanlik_alanlari`
  ADD CONSTRAINT `uzmanlik_alanlari_ibfk_1` FOREIGN KEY (`uzman_profile_id`) REFERENCES `uzman_profiles` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `uzman_profiles`
--
ALTER TABLE `uzman_profiles`
  ADD CONSTRAINT `uzman_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `uzman_reviews`
--
ALTER TABLE `uzman_reviews`
  ADD CONSTRAINT `uzman_reviews_ibfk_1` FOREIGN KEY (`uzman_profile_id`) REFERENCES `uzman_profiles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `uzman_reviews_ibfk_2` FOREIGN KEY (`hasta_profile_id`) REFERENCES `hasta_profiles` (`id`) ON DELETE CASCADE;

--
-- Tablo yapısı `tedavi_planlari`
--
CREATE TABLE IF NOT EXISTS `tedavi_planlari` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uzman_profile_id` int NOT NULL,
  `hasta_profile_id` int NOT NULL,
  `randevu_id` int DEFAULT NULL,
  `tedavi_turu` enum('online','evde') NOT NULL,
  `seans_sayisi` int NOT NULL,
  `seans_ucreti` decimal(10,2) NOT NULL,
  `toplam_ucret` decimal(10,2) NOT NULL,
  `notlar` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tp_uzman` FOREIGN KEY (`uzman_profile_id`) REFERENCES `uzman_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tp_hasta` FOREIGN KEY (`hasta_profile_id`) REFERENCES `hasta_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
