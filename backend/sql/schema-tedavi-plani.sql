-- Tedavi Planları tablosu
-- Uzmanın ön görüşme sonrasında hastaya atadığı tedavi planını tutar

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
  KEY `idx_uzman_profile_id` (`uzman_profile_id`),
  KEY `idx_hasta_profile_id` (`hasta_profile_id`),
  CONSTRAINT `fk_tp_uzman` FOREIGN KEY (`uzman_profile_id`) REFERENCES `uzman_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tp_hasta` FOREIGN KEY (`hasta_profile_id`) REFERENCES `hasta_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
