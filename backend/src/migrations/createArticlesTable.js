/**
 * Migration: Create articles table
 */

import pool from '../config/db.js';

const createArticlesTable = async () => {
    try {
        console.log('Creating articles table...');

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS articles (
                id INT PRIMARY KEY AUTO_INCREMENT,
                uzman_id INT NOT NULL,
                baslik VARCHAR(255) NOT NULL,
                ozet TEXT,
                icerik TEXT NOT NULL,
                kapak_resmi_url VARCHAR(500),
                kategori VARCHAR(100),
                etiketler JSON,
                okunma_sayisi INT DEFAULT 0,
                yayinlanma_durumu ENUM('taslak', 'yayinda', 'arsivlendi') DEFAULT 'taslak',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                yayinlanma_tarihi TIMESTAMP NULL,
                
                FOREIGN KEY (uzman_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_uzman (uzman_id),
                INDEX idx_kategori (kategori),
                INDEX idx_durum (yayinlanma_durumu),
                INDEX idx_yayinlanma (yayinlanma_tarihi)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('✅ Articles table created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating articles table:', error);
        process.exit(1);
    }
};

createArticlesTable();
