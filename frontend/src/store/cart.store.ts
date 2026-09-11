import { create } from 'zustand';
import { CartSummary } from '../types/cart';
import { cartService } from '../services/cart.service';
import { useAuthStore } from './auth.store';

interface CartState {
  cart: CartSummary | null;
  isDrawerOpen: boolean;
  isLoading: boolean;
  error: string | null;
  pendingItem: { productId: string; quantity: number } | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  addPendingItemIfAny: () => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isDrawerOpen: false,
  isLoading: false,
  error: null,
  pendingItem: null,

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
      // Compulsory Sign In / Sign Up
      set({ pendingItem: { productId, quantity } });
      useAuthStore
        .getState()
        .openAuthModal('login', 'Please sign in or create an account to add items to your cart.');
      throw new Error('AUTH_REQUIRED');
    }

    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.addToCart(productId, quantity);
      set({ cart, isDrawerOpen: true, isLoading: false, pendingItem: null });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  addPendingItemIfAny: async () => {
    const pending = get().pendingItem;
    if (!pending) return;
    set({ pendingItem: null });
    try {
      await get().addItem(pending.productId, pending.quantity);
    } catch (err) {
      console.error('Failed to add pending cart item after login:', err);
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      return get().removeItem(itemId);
    }
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
      try {
        const cart = await cartService.getCart();
        set({ cart, isLoading: false });
      } catch {
        set({ error: err.message, isLoading: false });
        throw err;
      }
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.clearCart();
      set({ cart, isLoading: false });
    } catch (err: any) {
      try {
        const cart = await cartService.getCart();
        set({ cart, isLoading: false });
      } catch {
        set({
          cart: {
            id: get().cart?.id || '',
            customerId: get().cart?.customerId || '',
            items: [],
            totalItems: 0,
            subtotal: 0,
            shippingFee: 0,
            totalAmount: 0,
          },
          isLoading: false,
        });
      }
    }
  },
}));
