import { apiClient } from './api';
import { Admin } from '../types/user';

export const authService = {
  async loginAdmin(credentials: { email: string; password: string }): Promise<{ admin: Admin; accessToken: string }> {
    const res: any = await apiClient.post('/admin/auth/login', credentials);
    return res.data;
  },

  async getAdminProfile(): Promise<Admin> {
    const res: any = await apiClient.get('/admin/auth/profile');
    return res.data;
  },
};
