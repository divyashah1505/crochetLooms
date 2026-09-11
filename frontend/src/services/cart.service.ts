import { apiClient } from './api';
import { CartSummary } from '../types/cart';

const extractCart = (res: any): CartSummary => {
  if (res?.data && typeof res.data === 'object' && 'items' in res.data) {
    return res.data as CartSummary;
  }
  if (res && typeof res === 'object' && 'items' in res) {
    return res as CartSummary;
  }
  if (res?.data?.data && typeof res.data.data === 'object' && 'items' in res.data.data) {
    return res.data.data as CartSummary;
  }
  return (res?.data || res || {
    id: '',
    customerId: '',
    items: [],
    totalItems: 0,
    subtotal: 0,
    shippingFee: 0,
    totalAmount: 0,
  }) as CartSummary;
};

export const cartService = {
  async getCart() {
    const res = await apiClient.get('/cart');
    return extractCart(res);
  },

  async addToCart(productId: string, quantity: number = 1) {
    const res = await apiClient.post('/cart/items', { productId, quantity });
    return extractCart(res);
  },

  async updateItemQuantity(itemId: string, quantity: number) {
    const res = await apiClient.put(`/cart/items/${itemId}`, { quantity });
    return extractCart(res);
  },

  async removeItem(itemId: string) {
    const res = await apiClient.delete(`/cart/items/${itemId}`);
    return extractCart(res);
  },

  async clearCart() {
    const res = await apiClient.delete('/cart/clear');
    return extractCart(res);
  },
};
