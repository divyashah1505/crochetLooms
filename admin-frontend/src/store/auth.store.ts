import { create } from 'zustand';
import { Admin } from '../types/user';
import { authService } from '../services/auth.service';

interface AdminAuthState {
  admin: Admin | null;
  adminToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  initAuth: () => Promise<void>;
  setAdminAuth: (admin: Admin, token: string) => void;
  logoutAdmin: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  admin: null,
  adminToken: null,
  isLoading: false,
  isInitialized: false,

  initAuth: async () => {
    if (typeof window === 'undefined') return;

    const adminToken = localStorage.getItem('crochet_admin_token');
    const savedAdmin = localStorage.getItem('crochet_admin_data');

    set({
      adminToken,
      admin: savedAdmin ? JSON.parse(savedAdmin) : null,
      isInitialized: true,
    });

    if (adminToken) {
      try {
        const profile = await authService.getAdminProfile();
        set({ admin: profile });
        localStorage.setItem('crochet_admin_data', JSON.stringify(profile));
      } catch (err) {
        console.warn('Admin session expired or invalid');
      }
    }
  },

  setAdminAuth: (admin, token) => {
    localStorage.setItem('crochet_admin_token', token);
    localStorage.setItem('crochet_admin_data', JSON.stringify(admin));
    set({ admin, adminToken: token });
  },

  logoutAdmin: () => {
    localStorage.removeItem('crochet_admin_token');
    localStorage.removeItem('crochet_admin_data');
    set({ admin: null, adminToken: null });
  },
}));
