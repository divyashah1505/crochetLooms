import { apiClient } from './api';
import { Address } from '../types/user';

export const addressService = {
  async getAddresses() {
    const res = await apiClient.get('/addresses');
    return res.data as Address[];
  },

  async addAddress(payload: Omit<Address, 'id' | 'customerId'>) {
    const res = await apiClient.post('/addresses', payload);
    return res.data as Address;
  },

  async updateAddress(id: string, payload: Partial<Address>) {
    const res = await apiClient.put(`/addresses/${id}`, payload);
    return res.data as Address;
  },

  async deleteAddress(id: string) {
    return apiClient.delete(`/addresses/${id}`);
  },

  async setDefaultAddress(id: string) {
    const res = await apiClient.patch(`/addresses/${id}/default`);
    return res.data as Address;
  },
};
