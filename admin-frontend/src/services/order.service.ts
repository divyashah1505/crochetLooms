import { apiClient } from './api';
import { Order, OrderStatus } from '../types/order';

export const orderService = {
  async getAllOrdersAdmin(status?: OrderStatus): Promise<Order[]> {
    const res: any = await apiClient.get('/orders/admin', { params: { status } });
    return res.data;
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const res: any = await apiClient.patch(`/orders/admin/${id}/status`, { status });
    return res.data;
  },
};
