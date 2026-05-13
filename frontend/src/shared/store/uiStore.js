/**
 * UI Store
 * Zustand store for UI state (modals, toasts, etc.)
 */

import { create } from 'zustand';

export const useUIStore = create((set) => ({
    // Modal state
    isModalOpen: false,
    modalContent: null,
    openModal: (content) => set({ isModalOpen: true, modalContent: content }),
    closeModal: () => set({ isModalOpen: false, modalContent: null }),

    // Toast state
    toasts: [],
    addToast: (toast) =>
        set((state) => ({
            toasts: [...state.toasts, { id: Date.now(), ...toast }],
        })),
    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),

    // Loading state
    isLoading: false,
    setLoading: (loading) => set({ isLoading: loading }),
}));
