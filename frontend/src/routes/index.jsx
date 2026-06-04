/**
 * Main Router Configuration
 */

import { createBrowserRouter } from 'react-router-dom';
import RoleRoute from './RoleRoute';

// Layouts
import PublicLayout from '../core/layouts/PublicLayout';
import AuthLayout from '../core/layouts/AuthLayout';
import DashboardLayout from '../core/layouts/DashboardLayout';

// Landing
import Home from '../modules/landing/pages/Home';

// Auth
import Login from '../core/auth/pages/Login';
import Register from '../core/auth/pages/Register';
import UzmanRegister from '../core/auth/pages/UzmanRegister';
import HastaRegister from '../core/auth/pages/HastaRegister';

// Uzman
import UzmanDashboard from '../modules/uzman/pages/Dashboard';
import UzmanProfile from '../modules/uzman/pages/Profile';
import UzmanCompleteProfile from '../modules/uzman/pages/CompleteProfile';
import UzmanEditProfile from '../modules/uzman/pages/EditProfile'; // YENİ: edit sayfası
import UzmanReviews from '../modules/uzman/pages/Reviews';
import UzmanRandevular from '../modules/uzman/pages/Randevular';

// Hasta
import HastaDashboard from '../modules/hasta/pages/Dashboard';
import HastaProfile from '../modules/hasta/pages/Profile';
import CompleteProfile from '../modules/hasta/pages/CompleteProfile';
import Assessment from '../modules/hasta/pages/Assessment';
import AssessmentList from '../modules/hasta/pages/AssessmentList';
import AssessmentDetail from '../modules/hasta/pages/AssessmentDetail';
import AssessmentResult from '../modules/hasta/pages/AssessmentResult';
import UzmanSearch from '../modules/hasta/pages/UzmanSearch';
import UzmanProfileDetail from '../modules/hasta/pages/UzmanProfileDetail';
import UzmanProfileView from '../modules/hasta/pages/UzmanProfile';
import Randevularim from '../modules/hasta/pages/Randevularim';

// Admin
import AdminDashboard from '../modules/admin/pages/Dashboard';
import UzmanBasvurular from '../modules/admin/pages/UzmanBasvurular'; // DÜZELTME: duplicate import kaldırıldı
import Kullanicilar from '../modules/admin/pages/Kullanicilar';
import AdminRandevular from '../modules/admin/pages/Randevular';
import AdminYorumlar from '../modules/admin/pages/Yorumlar';
import AssessmentSorular from '../modules/admin/pages/AssessmentSorular';
import Profiller from '../modules/admin/pages/Profiller';

// 404
import NotFound from '../core/components/NotFound';

const router = createBrowserRouter([
    // Public routes
    {
        element: <PublicLayout />,
        children: [
            {
                path: '/',
                element: <Home />,
            },
        ],
    },

    // Auth routes
    {
        element: <AuthLayout />,
        children: [
            {
                path: '/login',
                element: <Login />,
            },
            {
                path: '/register',
                element: <Register />,
            },
            {
                path: '/register/uzman',
                element: <UzmanRegister />,
            },
            {
                path: '/register/hasta',
                element: <HastaRegister />,
            },
        ],
    },

    // Uzman routes
    {
        element: (
            <RoleRoute allowedRoles={['uzman']}>
                <DashboardLayout />
            </RoleRoute>
        ),
        children: [
            {
                path: '/uzman/dashboard',
                element: <UzmanDashboard />,
            },
            {
                path: '/uzman/profile',
                element: <UzmanProfile />,
            },
            {
                path: '/uzman/profile/complete',
                element: <UzmanCompleteProfile />,
            },
            {
                // YENİ: edit route eklendi
                path: '/uzman/profile/edit',
                element: <UzmanEditProfile />,
            },
            {
                path: '/uzman/reviews',
                element: <UzmanReviews />,
            },
            {
                path: '/uzman/randevular',
                element: <UzmanRandevular />,
            },
        ],
    },

    // Hasta routes
    {
        element: (
            <RoleRoute allowedRoles={['hasta']}>
                <DashboardLayout />
            </RoleRoute>
        ),
        children: [
            {
                path: '/hasta/dashboard',
                element: <HastaDashboard />,
            },
            {
                path: '/hasta/profile',
                element: <HastaProfile />,
            },
            {
                path: '/hasta/profile/complete',
                element: <CompleteProfile />,
            },
            {
                path: '/hasta/assessment',
                element: <AssessmentList />,
            },
            {
                path: '/hasta/assessment/new',
                element: <Assessment />,
            },
            { 
                path: '/hasta/assessment/:id/result', 
                element: <AssessmentResult /> 
            },
            {
                path: '/hasta/assessment/:id',
                element: <AssessmentDetail />,
            },
            {
                path: '/hasta/uzmanlar',
                element: <UzmanSearch />,
            },
            {
                // DÜZELTME: /hasta/uzman/:id kaldırıldı, tek tutarlı route kullanılıyor
                path: '/hasta/uzman/:id',
                element: <UzmanProfileView />,
            },
            { 
                path: '/hasta/randevular', 
                element: <Randevularim /> 
            }
        ],
    },

    // Admin routes
    {
        element: (
            <RoleRoute allowedRoles={['admin']}>
                <DashboardLayout />
            </RoleRoute>
        ),
        children: [
            {
                path: '/admin/dashboard',
                element: <AdminDashboard />,
            },
            {
                path: '/admin/uzman-basvurular',
                element: <UzmanBasvurular />, // DÜZELTME: duplicate kaldırıldı
            },
            {
                path: '/admin/kullanicilar',
                element: <Kullanicilar />,
            },
            { 
                path: '/admin/randevular', 
                element: <AdminRandevular /> 
            },
            { 
                path: '/admin/yorumlar', 
                element: <AdminYorumlar /> 
            },
            { 
                path: '/admin/sorular', 
                element: <AssessmentSorular /> 
            },
            { 
                path: '/admin/profiller', 
                element: <Profiller /> 
            }
        ],
    },

    // 404
    {
        path: '*',
        element: <NotFound />,
        
    },
]);

/* docker compose up -d  */

export default router;