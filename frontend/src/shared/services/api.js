/**
 * API Service
 * Axios instance with interceptors for authentication
 */

import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
    (config) => {
        const authData = localStorage.getItem('auth-storage');
        if (authData) {
            try {
                const { state } = JSON.parse(authData);
                if (state?.token) {
                    config.headers.Authorization = `Bearer ${state.token}`;
                }
            } catch (error) {
                console.error('Error parsing auth data:', error);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            // Refresh token endpoint'ine yapılan istek başarısız olduysa direkt çıkış yap
            if (originalRequest.url?.includes('/auth/refresh')) {
                localStorage.removeItem('auth-storage');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const authData = localStorage.getItem('auth-storage');
                const { state } = JSON.parse(authData || '{}');
                const refreshToken = state?.refreshToken;

                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await api.post('/auth/refresh', { refreshToken });
                const { accessToken } = response.data.data;

                // Yeni token'ı store'a kaydet
                const parsed = JSON.parse(localStorage.getItem('auth-storage') || '{}');
                parsed.state.token = accessToken;
                localStorage.setItem('auth-storage', JSON.stringify(parsed));

                processQueue(null, accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem('auth-storage');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
