/**
 * Migration: Add video_link column to articles table
 * Run: node src/migrations/addVideoLinkToArticles.js
 */

import pool from '../config/db.js';

const migrate = async () => {
    try {
        // Kolon zaten varsa hata verme
        await pool.execute(`
            ALTER TABLE articles
            ADD COLUMN video_link VARCHAR(500) DEFAULT NULL
            AFTER kapak_resmi_url
        `);
        console.log('✅ video_link column added to articles table');
        process.exit(0);
    } catch (error) {
        // MySQL 5.x'te IF NOT EXISTS desteklenmez, duplicate column hatasını yoksay
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️  video_link column already exists, skipping');
            process.exit(0);
        }
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
};

migrate();
