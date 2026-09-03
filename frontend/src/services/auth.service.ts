import { apiClient } from './api';
import { Customer, Admin } from '../types/user';

export const authService = {
  // Customer Register
  async registerCustomer(payload: { name: string; email: string; password: string; phone?: string }) {
    const res = await apiClient.post('/customer/auth/register', payload);
    return res.data as { customer: Customer; accessToken: string };
  },

  // Customer Login
  async loginCustomer(payload: { email: string; password: string }) {
    const res = await apiClient.post('/customer/auth/login', payload);
    return res.data as { customer: Customer; accessToken: string };
  },

  // Customer Google Sign-In
  async loginWithGoogle(payload: { credential?: string; email?: string; name?: string; googleId?: string; avatarUrl?: string }) {
    const res = await apiClient.post('/customer/auth/google', payload);
    return res.data as { customer: Customer; accessToken: string };
  },

  // Customer Profile
  async getCustomerProfile() {
    const res = await apiClient.get('/customer/auth/profile');
    return res.data as Customer;
  },

  // Admin Login
  async loginAdmin(payload: { email: string; password: string }) {
    const res = await apiClient.post('/admin/auth/login', payload);
    return res.data as { admin: Admin; accessToken: string };
  },
};
