-- Migration: seanslar tablosu
-- Tedavi planına bağlı, sıralı seans kayıtları
-- Her seans bir önceki tamamlandığında 'aktif' hale gelir

CREATE TABLE IF NOT EXISTS seanslar (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    tedavi_plani_id  INT NOT NULL,
    seans_no         INT NOT NULL,
    tarih            DATETIME NULL,
    durum            ENUM('bekliyor', 'aktif', 'tamamlandi') NOT NULL DEFAULT 'bekliyor',
    uzman_seans_onayladi        TINYINT(1) NOT NULL DEFAULT 0,
    uzman_seans_onaylama_tarihi DATETIME NULL,
    hasta_seans_onayladi        TINYINT(1) NOT NULL DEFAULT 0,
    hasta_seans_onaylama_tarihi DATETIME NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_plan_seans (tedavi_plani_id, seans_no),
    FOREIGN KEY (tedavi_plani_id) REFERENCES tedavi_planlari(id) ON DELETE CASCADE
);
