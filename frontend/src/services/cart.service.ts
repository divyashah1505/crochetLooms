import { apiClient } from './api';
import { CartSummary } from '../types/cart';

export const cartService = {
  async getCart() {
    const res = await apiClient.get('/cart');
    return res.data as CartSummary;
  },

  async addToCart(productId: string, quantity: number = 1) {
    const res = await apiClient.post('/cart/items', { productId, quantity });
    return res.data as CartSummary;
  },

  async updateItemQuantity(itemId: string, quantity: number) {
    const res = await apiClient.put(`/cart/items/${itemId}`, { quantity });
    return res.data as CartSummary;
  },

  async removeItem(itemId: string) {
    const res = await apiClient.delete(`/cart/items/${itemId}`);
    return res.data as CartSummary;
  },

  async clearCart() {
    const res = await apiClient.delete('/cart/clear');
    return res.data as CartSummary;
  },
};
