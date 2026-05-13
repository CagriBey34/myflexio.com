/**
 * Auth Store
 * Zustand store for authentication state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,

            login: (user, token, refreshToken) =>
                set({
                    user,
                    token,
                    refreshToken: refreshToken || null,
                    isAuthenticated: true,
                }),

            setToken: (token) => set({ token }),

            logout: () =>
                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    isAuthenticated: false,
                }),

            updateUser: (userData) =>
                set((state) => ({
                    user: { ...state.user, ...userData },
                })),
        }),
        {
            name: 'auth-storage',
        }
    )
);
