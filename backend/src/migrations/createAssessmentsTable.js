/**
 * Migration: Create assessments table
 * Run this file to create the assessments table
 */

import pool from '../config/db.js';

const createAssessmentsTable = async () => {
    try {
        console.log('Creating assessments table...');

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS assessments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                
                -- Step 1: Pain Profile
                pain_region VARCHAR(100) NOT NULL,
                pain_severity INT NOT NULL,
                pain_duration VARCHAR(50) NOT NULL,
                pain_types JSON NOT NULL,
                
                -- Step 2: Functional Impact
                daily_activities_impact INT NOT NULL,
                sleep_impact INT NOT NULL,
                work_impact INT NOT NULL,
                social_impact INT NOT NULL,
                
                -- Step 3: Triggers
                pain_triggers JSON NOT NULL,
                pain_relievers JSON NOT NULL,
                
                -- Step 4: Goals
                treatment_goals JSON NOT NULL,
                expected_duration VARCHAR(50) NOT NULL,
                additional_notes TEXT,
                
                -- Results
                recommended_specialists JSON,
                
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_pain_region (pain_region),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('✅ Assessments table created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating assessments table:', error);
        process.exit(1);
    }
};

createAssessmentsTable();
