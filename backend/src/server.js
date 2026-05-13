/**
 * Server Entry Point
 * Initializes Express app, middleware, routes, and database connection
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './config/db.js';
import authRoutes from './core/auth/routes/auth.js';
import uzmanRoutes from './modules/uzman/routes/uzman.js';
import hastaRoutes from './modules/hasta/routes/hasta.js';
import adminRoutes from './modules/admin/routes/admin.js';
import assessmentAdminRoutes from './modules/assessment/routes/admin.js';
import assessmentHastaRoutes from './modules/assessment/routes/hasta.js';
import articleUzmanRoutes from './modules/articles/routes/uzman.js';
import articlePublicRoutes from './modules/articles/routes/public.js';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/uzman', uzmanRoutes);
app.use('/api/hasta', hastaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assessment/admin', assessmentAdminRoutes);
app.use('/api/assessment', assessmentHastaRoutes);
app.use('/api/articles', articleUzmanRoutes);
app.use('/api/articles', articlePublicRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// Start server
const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Start listening
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on port ${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
            console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
            console.log(`👨‍⚕️ Uzman API: http://localhost:${PORT}/api/uzman`);
            console.log(`🏥 Hasta API: http://localhost:${PORT}/api/hasta`);
            console.log(`⚙️  Admin API: http://localhost:${PORT}/api/admin`);
            console.log(`📋 Assessment API: http://localhost:${PORT}/api/assessment\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
