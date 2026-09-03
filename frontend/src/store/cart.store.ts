import { create } from 'zustand';
import { CartSummary } from '../types/cart';
import { cartService } from '../services/cart.service';

interface CartState {
  cart: CartSummary | null;
  isDrawerOpen: boolean;
  isLoading: boolean;
  error: string | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isDrawerOpen: false,
  isLoading: false,
  error: null,

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

  fetchCart: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('crochet_customer_token') : null;
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.getCart();
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addItem: async (productId: string, quantity = 1) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('crochet_customer_token') : null;
    if (!token) {
      // Prompt user to login
      if (typeof window !== 'undefined') {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.addToCart(productId, quantity);
      set({ cart, isDrawerOpen: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.updateItemQuantity(itemId, quantity);
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  removeItem: async (itemId: string) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.removeItem(itemId);
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.clearCart();
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
}));
