/**
 * Database configuration and connection pool
 * Centralized MySQL connection management
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * MySQL connection pool configuration
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD  || 'root123',
    database: process.env.DB_NAME || 'myflexio',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    timezone: '+03:00',
});

/**
 * Test database connection
 */
export const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✓ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('✗ Database connection failed:', error.message);
        throw error;
    }
};

export default pool;
