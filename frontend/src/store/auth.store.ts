import { create } from 'zustand';
import { Customer, Admin } from '../types/user';
import { authService } from '../services/auth.service';

interface AuthState {
  customer: Customer | null;
  admin: Admin | null;
  customerToken: string | null;
  adminToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Auth Modal Popup State
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  authModalNotice: string | null;
  openAuthModal: (mode?: 'login' | 'register', notice?: string) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: 'login' | 'register') => void;

  initAuth: () => Promise<void>;
  setCustomerAuth: (customer: Customer, token: string) => void;
  setAdminAuth: (admin: Admin, token: string) => void;
  logoutCustomer: () => void;
  logoutAdmin: () => void;
}

const getInitialCustomer = (): Customer | null => {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem('crochet_customer_data');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
  return null;
};

const getInitialCustomerToken = (): string | null => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem('crochet_customer_token');
    } catch {
      return null;
    }
  }
  return null;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  customer: getInitialCustomer(),
  admin: null,
  customerToken: getInitialCustomerToken(),
  adminToken: null,
  isLoading: false,
  isInitialized: typeof window !== 'undefined' && !!getInitialCustomerToken(),

  // Auth Modal Initial State
  isAuthModalOpen: false,
  authModalMode: 'login',
  authModalNotice: null,
  openAuthModal: (mode = 'login', notice?: string) =>
    set({ isAuthModalOpen: true, authModalMode: mode, authModalNotice: notice || null }),
  closeAuthModal: () => set({ isAuthModalOpen: false, authModalNotice: null }),
  setAuthModalMode: (mode) => set({ authModalMode: mode }),

  initAuth: async () => {
    if (typeof window === 'undefined') return;

    const customerToken = localStorage.getItem('crochet_customer_token');
    const adminToken = localStorage.getItem('crochet_admin_token');
    const savedCustomer = localStorage.getItem('crochet_customer_data');
    const savedAdmin = localStorage.getItem('crochet_admin_data');

    set({
      customerToken,
      adminToken,
      customer: savedCustomer ? JSON.parse(savedCustomer) : null,
      admin: savedAdmin ? JSON.parse(savedAdmin) : null,
      isInitialized: true,
    });

    if (customerToken) {
      try {
        const profile = await authService.getCustomerProfile();
        set({ customer: profile });
        localStorage.setItem('crochet_customer_data', JSON.stringify(profile));
      } catch (err) {
        // Token might have expired
        console.warn('Customer session expired or invalid');
      }
    }
  },

  setCustomerAuth: (customer, token) => {
    localStorage.setItem('crochet_customer_token', token);
    localStorage.setItem('crochet_customer_data', JSON.stringify(customer));
    set({ customer, customerToken: token, isAuthModalOpen: false, authModalNotice: null });

    // Execute pending cart item addition if any
    import('./cart.store')
      .then(({ useCartStore }) => {
        useCartStore.getState().addPendingItemIfAny();
      })
      .catch(() => {});
  },

  setAdminAuth: (admin, token) => {
    localStorage.setItem('crochet_admin_token', token);
    localStorage.setItem('crochet_admin_data', JSON.stringify(admin));
    set({ admin, adminToken: token });
  },

  logoutCustomer: () => {
    localStorage.removeItem('crochet_customer_token');
    localStorage.removeItem('crochet_customer_data');
    set({ customer: null, customerToken: null });
  },

  logoutAdmin: () => {
    localStorage.removeItem('crochet_admin_token');
    localStorage.removeItem('crochet_admin_data');
    set({ admin: null, adminToken: null });
  },
}));
