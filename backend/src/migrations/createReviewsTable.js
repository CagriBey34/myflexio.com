/**
 * Migration: Create reviews table
 */

import pool from '../config/db.js';

const createReviewsTable = async () => {
    try {
        console.log('Creating reviews table...');

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT PRIMARY KEY AUTO_INCREMENT,
                uzman_id INT NOT NULL,
                hasta_id INT NOT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                FOREIGN KEY (uzman_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (hasta_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_review (uzman_id, hasta_id),
                INDEX idx_uzman (uzman_id),
                INDEX idx_rating (rating),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('✅ Reviews table created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating reviews table:', error);
        process.exit(1);
    }
};

createReviewsTable();
