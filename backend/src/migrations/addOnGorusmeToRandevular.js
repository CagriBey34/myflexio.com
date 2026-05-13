/**
 * Migration: Add randevu_tipi column to randevular table
 * Run: node src/migrations/addOnGorusmeToRandevular.js
 */

import pool from '../config/db.js';

const migrate = async () => {
    try {
        // randevu_tipi kolonu ekle
        await pool.execute(`
            ALTER TABLE randevular
            ADD COLUMN randevu_tipi ENUM('normal', 'on_gorusme') NOT NULL DEFAULT 'normal'
            AFTER hasta_notu
        `).catch(e => {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️  randevu_tipi already exists');
            } else throw e;
        });

        // talep_tarihi'ni nullable yap (ön görüşmede tarih seçilmiyor)
        await pool.execute(`
            ALTER TABLE randevular
            MODIFY COLUMN talep_tarihi DATETIME NULL DEFAULT NULL
        `);

        console.log('✅ Migration completed: randevu_tipi added, talep_tarihi is now nullable');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
};

migrate();
