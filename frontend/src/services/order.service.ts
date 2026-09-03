import { apiClient } from './api';
import { Order, OrderStatus } from '../types/order';

export const orderService = {
  async checkoutOrder(payload: { addressId: string; notes?: string }) {
    const res = await apiClient.post('/orders', payload);
    return res.data as Order;
  },

  async getCustomerOrders() {
    const res = await apiClient.get('/orders');
    return res.data as Order[];
  },

  async getOrderById(id: string) {
    const res = await apiClient.get(`/orders/${id}`);
    return res.data as Order;
  },

  // Admin APIs
  async getAllOrdersAdmin(status?: OrderStatus, search?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const res = await apiClient.get(`/orders/admin/all?${params.toString()}`);
    return res.data as Order[];
  },

  async getOrderAdminById(id: string) {
    const res = await apiClient.get(`/orders/admin/${id}`);
    return res.data as Order;
  },

  async updateOrderStatusAdmin(id: string, status: OrderStatus) {
    const res = await apiClient.patch(`/orders/admin/${id}/status`, { status });
    return res.data as Order;
  },
};
